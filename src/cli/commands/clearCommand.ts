import { Command } from './command';
import { Logger } from '../output/logger';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import path from 'path';

export class ClearCommand implements Command {
  readonly name = '/clear';
  readonly description = 'Clear build folder';
  constructor(private readonly logger: Logger, private readonly fs: FileSystemPort, private readonly getDirectory: () => string) {}
  async execute(): Promise<void> {
    const outputDir = path.join(this.getDirectory(), 'builds');
    if (await this.fs.exists(outputDir)) {
      await this.fs.rm(outputDir, { recursive: true, force: true });
      await this.fs.mkdir(outputDir, { recursive: true });
      this.logger.success('Build folder cleared.');
    }
  }
}
