import * as p from '@clack/prompts';
import { ParsedFiles, DynamxFile } from '../../types';
import { SELECTABLE_TYPES, FILE_TYPE_LABELS, FileType, stripFileTypePrefix } from '../../constants/fileTypes';
import { PackBuilder } from '../../core/pack/packBuilder';
import { generatePack } from '../../core/pack/packGenerator';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { ArchiveServicePort } from '../../infrastructure/archive/archiveService';
import { ProtectServicePort } from '../../infrastructure/http/protectService';
import { Logger } from '../output/logger';

const PACK_NAME_REGEX = /^[a-zA-Z0-9]*$/;
const MAX_PACK_NAME_LENGTH = 10;

const enum WizardStep {
  PackName,
  TypeSelection,
  ItemSelection,
  Protection,
  Generate,
}

export async function packWizard(
  files: ParsedFiles,
  directory: string,
  fs: FileSystemPort,
  archiveService: ArchiveServicePort,
  protectService: ProtectServicePort,
  logger: Logger,
): Promise<void> {
  p.log.step('Pack Creation');

  let step: WizardStep = WizardStep.PackName;
  let packName = '';
  let selectedTypes: FileType[] = [];
  let builder = new PackBuilder();

  while (step <= WizardStep.Generate) {
    switch (step) {
      case WizardStep.PackName: {
        const defaultId = PackBuilder.generateId();
        const result = await p.text({
          message: 'Pack name',
          placeholder: defaultId,
          defaultValue: defaultId,
          validate: (value) => {
            const v = value ?? '';
            if (v.length === 0) return undefined;
            if (v.length > MAX_PACK_NAME_LENGTH) return 'Max 10 characters.';
            if (v.includes(' ')) return 'Cannot contain spaces.';
            if (!PACK_NAME_REGEX.test(v)) return 'Only letters and numbers allowed.';
            return undefined;
          },
        });
        if (p.isCancel(result)) return;
        packName = result;
        step = WizardStep.TypeSelection;
        break;
      }

      case WizardStep.TypeSelection: {
        const availableTypes = SELECTABLE_TYPES.filter(([type]) => {
          const arr = files[type] as DynamxFile[];
          return arr && arr.length > 0;
        });

        if (availableTypes.length === 0) {
          p.log.warn('No selectable files detected. Add packs to the Packs folder first.');
          return;
        }

        const result = await p.multiselect({
          message: 'Select file types to include',
          options: availableTypes.map(([type, label]) => ({
            value: type,
            label,
            hint: `${(files[type] as DynamxFile[]).length} files`,
          })),
          required: true,
        });
        if (p.isCancel(result)) {
          step = WizardStep.PackName;
          break;
        }
        selectedTypes = result;
        step = WizardStep.ItemSelection;
        break;
      }

      case WizardStep.ItemSelection: {
        builder = new PackBuilder();
        builder.setPackId(packName);

        let cancelled = false;
        for (const type of selectedTypes) {
          const fileList = files[type] as DynamxFile[];
          if (fileList.length === 1) {
            builder.addElement(fileList[0]);
            p.log.info(`Auto-included: ${fileList[0].name}`);
            continue;
          }

          const sortedOptions = fileList
            .map((file, index) => {
              const rawName = file.dir.split('/').pop()?.replace('.dynx', '') ?? '';
              const itemName = stripFileTypePrefix(rawName);
              const displayName = file.name ? `${file.name} - ${itemName}` : itemName;
              return { value: index, label: displayName };
            })
            .sort((a, b) => a.label.localeCompare(b.label));

          const selectedItems = await p.multiselect({
            message: `Select ${FILE_TYPE_LABELS[type].toLowerCase()} items`,
            options: sortedOptions,
            required: true,
          });
          if (p.isCancel(selectedItems)) {
            cancelled = true;
            break;
          }

          for (const idx of selectedItems) {
            builder.addElement(fileList[idx]);
          }
        }

        if (cancelled) {
          step = WizardStep.TypeSelection;
          break;
        }

        p.log.success(`Pack will contain ${builder.getElementCount()} elements.`);
        step = WizardStep.Protection;
        break;
      }

      case WizardStep.Protection: {
        const wantProtection = await p.confirm({
          message: 'Protect your pack?',
          active: 'Yes',
          inactive: 'No',
          initialValue: false,
        });
        if (p.isCancel(wantProtection)) {
          step = WizardStep.TypeSelection;
          break;
        }

        if (wantProtection) {
          builder.setProtected(true);

          const host = await p.text({
            message: 'Server hostname',
            placeholder: 'myserver.com',
            validate: (value) => {
              if (!(value ?? '').trim()) return 'Hostname is required.';
              return undefined;
            },
          });
          if (p.isCancel(host)) {
            step = WizardStep.Protection;
            break;
          }
          builder.setHost(host);

          const gameDir = await p.text({
            message: 'Game root directory (optional)',
            placeholder: 'DrawLife',
          });
          if (p.isCancel(gameDir)) {
            step = WizardStep.Protection;
            break;
          }
          builder.setGameDir(gameDir);
        } else {
          builder.setProtected(false);
        }

        step = WizardStep.Generate;
        break;
      }

      case WizardStep.Generate: {
        const s = p.spinner();
        s.start('Generating pack...');
        try {
          const pack = builder.build();
          const archivePath = await generatePack(files, pack, directory, fs, archiveService, logger);
          s.stop('Pack generated successfully!');

          if (pack.isProtected && pack.host) {
            await handleProtection(archivePath, pack.host, pack.gameDir ?? '', pack.packId, protectService);
          }
        } catch (err) {
          s.stop('Pack generation failed.');
          p.log.error(String(err));
        }
        return;
      }
    }
  }
}

async function handleProtection(
  archivePath: string,
  host: string,
  gameDir: string,
  packId: string,
  protectService: ProtectServicePort,
): Promise<void> {
  let currentHost = host;

  while (true) {
    const s = p.spinner();
    s.start('Protecting pack...');

    try {
      const result = await protectService.protectPack(archivePath, currentHost, gameDir, packId);
      if (result) {
        s.stop('Pack protected successfully!');
        return;
      }
      s.stop('Protection failed (no download link returned).');
    } catch (err) {
      s.stop('Protection failed.');
      p.log.error(String(err));
    }

    const action = await p.select({
      message: 'Protection failed. What do you want to do?',
      options: [
        { value: 'retry', label: 'Retry', hint: 'Try again with the same settings' },
        { value: 'modify', label: 'Modify hostname', hint: 'Change the server hostname' },
        { value: 'skip', label: 'Skip protection', hint: 'Keep the unprotected pack' },
      ],
    });

    if (p.isCancel(action) || action === 'skip') {
      p.log.info('Protection skipped. Pack was generated without protection.');
      return;
    }

    if (action === 'modify') {
      const newHost = await p.text({
        message: 'Server hostname',
        placeholder: currentHost,
        defaultValue: currentHost,
        validate: (value) => {
          if (!(value ?? '').trim()) return 'Hostname is required.';
          return undefined;
        },
      });
      if (p.isCancel(newHost)) {
        p.log.info('Protection skipped. Pack was generated without protection.');
        return;
      }
      currentHost = newHost;
    }
    // 'retry' loops again with same settings
  }
}
