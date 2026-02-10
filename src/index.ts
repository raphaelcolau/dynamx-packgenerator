import * as p from '@clack/prompts';
import { ConsoleLogger } from './cli/output/logger';
import { NodeFileSystem } from './infrastructure/filesystem/nodeFileSystem';
import { ArchiverService } from './infrastructure/archive/archiveService';
import { HttpProtectService } from './infrastructure/http/protectService';
import { showBanner } from './cli/prompts/banner';
import { selectDirectory } from './cli/prompts/directoryPrompt';
import { mainMenu } from './cli/prompts/mainMenu';
import { detect } from './core/detector/detector';
import { FileType, FILE_TYPE_LABELS } from './constants/fileTypes';

async function main(): Promise<void> {
  const logger = new ConsoleLogger();
  const fs = new NodeFileSystem();
  const archiveService = new ArchiverService(fs);
  const protectService = new HttpProtectService(fs, logger);

  showBanner();

  const directory = await selectDirectory(fs, logger);

  const s = p.spinner();
  s.start('Scanning packs...');
  const files = await detect(directory, fs, logger);
  const summary = Object.values(FileType)
    .filter(type => {
      const arr = files[type];
      return arr && (arr as unknown[]).length > 0;
    })
    .map(type => `${(files[type] as unknown[]).length} ${FILE_TYPE_LABELS[type].toLowerCase()}`)
    .join(', ');
  s.stop(`Found ${files.total} files${summary ? ` (${summary})` : ''}`);

  await mainMenu(files, directory, fs, archiveService, protectService, logger);
}

main().catch((err) => {
  p.log.error(String(err));
  process.exit(1);
});
