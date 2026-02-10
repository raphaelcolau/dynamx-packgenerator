import * as p from '@clack/prompts';
import chalk from 'chalk';
import { ParsedFiles, DynamxFile, ObjFile } from '../../types';
import { FileType, FILE_TYPE_LABELS } from '../../constants/fileTypes';

export async function listPrompt(files: ParsedFiles): Promise<void> {
  const options = Object.values(FileType)
    .filter(type => {
      const arr = files[type];
      return arr && (arr as unknown[]).length > 0;
    })
    .map(type => ({
      value: type,
      label: FILE_TYPE_LABELS[type],
      hint: `${(files[type] as unknown[]).length} files`,
    }));

  if (options.length === 0) {
    p.log.warn('No files detected.');
    return;
  }

  const choice = await p.select({
    message: 'Select a file type to list',
    options,
  });

  if (p.isCancel(choice)) return;

  const fileList = files[choice];
  if (!fileList) return;

  const entries = fileList.map(file => {
    const origin = 'file' in file ? (file as ObjFile).file : (file as DynamxFile).dir;
    return origin.split('/').pop() ?? '';
  }).sort((a, b) => a.localeCompare(b));

  const lines: string[] = [];
  for (const name of entries) {
    lines.push(`  ${chalk.green('●')} ${name}`);
  }
  lines.push(`\n  Total: ${chalk.yellow(String(fileList.length))} ${FILE_TYPE_LABELS[choice]} files`);
  p.note(lines.join('\n'), FILE_TYPE_LABELS[choice]);
}
