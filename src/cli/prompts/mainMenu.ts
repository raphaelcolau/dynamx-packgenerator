import * as p from '@clack/prompts';
import path from 'path';
import { ParsedFiles } from '../../types';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { ArchiveServicePort } from '../../infrastructure/archive/archiveService';
import { ProtectServicePort } from '../../infrastructure/http/protectService';
import { Logger } from '../output/logger';
import { packWizard } from './packWizard';
import { listPrompt } from './listPrompt';

type MenuAction = 'create' | 'list' | 'clear' | 'exit';

export async function mainMenu(
  files: ParsedFiles,
  directory: string,
  fs: FileSystemPort,
  archiveService: ArchiveServicePort,
  protectService: ProtectServicePort,
  logger: Logger,
): Promise<void> {
  while (true) {
    const action = await p.select<MenuAction>({
      message: 'What do you want to do?',
      options: [
        { value: 'create' as MenuAction, label: 'Create a new pack' },
        { value: 'list' as MenuAction, label: 'List detected files' },
        { value: 'clear' as MenuAction, label: 'Clear build folder' },
        { value: 'exit' as MenuAction, label: 'Exit' },
      ],
    });

    if (p.isCancel(action)) {
      p.cancel('Goodbye!');
      process.exit(0);
    }

    switch (action) {
      case 'create':
        await packWizard(files, directory, fs, archiveService, protectService, logger);
        break;
      case 'list':
        await listPrompt(files);
        break;
      case 'clear': {
        const outputDir = path.join(directory, 'builds');
        if (await fs.exists(outputDir)) {
          await fs.rm(outputDir, { recursive: true, force: true });
          await fs.mkdir(outputDir, { recursive: true });
          p.log.success('Build folder cleared.');
        } else {
          p.log.info('Build folder is already empty.');
        }
        break;
      }
      case 'exit':
        p.outro('Goodbye!');
        process.exit(0);
    }
  }
}
