import path from 'path';
import { FileSystemPort } from './fileSystemPort';
import { Logger } from '../../cli/output/logger';

export function getAppDirectory(fs: FileSystemPort, logger: Logger): string {
  let appDataDir: string;
  if (process.platform === 'win32') {
    appDataDir = process.env.APPDATA ?? '';
  } else if (process.platform === 'darwin') {
    appDataDir = path.join(process.env.HOME ?? '', 'Library', 'Application Support');
  } else {
    appDataDir = process.env.HOME ?? '';
  }

  const packManagerDir = path.join(appDataDir, 'PackManager');
  if (!fs.existsSync(packManagerDir)) {
    try {
      fs.mkdirSync(packManagerDir, { recursive: true });
      logger.success(`Folder created: ${packManagerDir}`);
    } catch (error) {
      logger.error(`An error occurred while creating the PackManager folder: ${String(error)}`);
    }
  } else {
    logger.success(`Folder detected: ${packManagerDir}`);
  }
  return packManagerDir;
}
