import chalk from 'chalk';
import { FileType, FILE_TYPE_LABELS } from '../../constants/fileTypes';
import { ParsedFiles } from '../../types';
import { Logger } from '../../cli/output/logger';

export function logParsedFileSummary(parsedFiles: ParsedFiles, logger: Logger): void {
  logger.raw('Parsed files:');
  for (const type of Object.values(FileType)) {
    const arr = parsedFiles[type];
    if (arr) logger.raw(`\t${FILE_TYPE_LABELS[type]}: ${chalk.yellow(String(arr.length))}`);
  }
  logger.raw(`Total: ${chalk.yellow(String(parsedFiles.total))}`);
}
