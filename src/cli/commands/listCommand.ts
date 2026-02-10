import chalk from 'chalk';
import { Command } from './command';
import { Logger } from '../output/logger';
import { ParsedFiles, DynamxFile, ObjFile } from '../../types';
import { ALL_FILE_TYPE_NAMES, FileType } from '../../constants/fileTypes';

export class ListCommand implements Command {
  readonly name = '/list';
  readonly description = 'Display all parsed files of a type';
  constructor(private readonly logger: Logger, private readonly getFiles: () => ParsedFiles | undefined) {}

  execute(args?: string): void {
    const files = this.getFiles();
    if (!files) { this.logger.error('Files not loaded yet.'); return; }
    if (!args) {
      this.logger.raw(`${chalk.blue('/list <type>')} - List all files of a type`);
      this.logger.warn(ALL_FILE_TYPE_NAMES.join(', '));
      return;
    }
    const type = args.trim().toLowerCase();
    if (!ALL_FILE_TYPE_NAMES.includes(type)) {
      this.logger.error(`Invalid type: ${type}`);
      this.logger.raw(`Valid types: ${ALL_FILE_TYPE_NAMES.join(', ')}`);
      return;
    }
    const fileList = files[type as FileType];
    if (!fileList) return;
    this.logger.raw(`Files of type: ${type}`);
    for (const file of fileList) {
      const origin = 'file' in file ? (file as ObjFile).file : (file as DynamxFile).dir;
      const name = origin.split('/').pop() ?? '';
      this.logger.raw(` - ${chalk.green(name)}`);
    }
    this.logger.raw(`Total of ${fileList.length} ${type} files.`);
  }
}
