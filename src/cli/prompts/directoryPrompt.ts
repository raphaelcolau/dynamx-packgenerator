import * as p from '@clack/prompts';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { Logger } from '../output/logger';
import { getAppDirectory } from '../../infrastructure/filesystem/appDirectory';

export async function selectDirectory(fs: FileSystemPort, logger: Logger): Promise<string> {
  const appDir = getAppDirectory(fs, logger);

  const choice = await p.select({
    message: 'Select working directory',
    options: [
      { value: 'app', label: 'App folder', hint: appDir },
      { value: 'local', label: 'Local folder', hint: process.cwd() },
    ],
  });

  if (p.isCancel(choice)) {
    p.cancel('Goodbye!');
    process.exit(0);
  }

  return choice === 'local' ? './' : appDir;
}
