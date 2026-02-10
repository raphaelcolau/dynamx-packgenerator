import { ParsedFiles, DynamxFile } from '../../types';
import { FileType } from '../../constants/fileTypes';

export interface PackInfoResult {
  content: string;
  dir: string;
}

export function resolvePackInfo(files: ParsedFiles, packFolderName: string): PackInfoResult {
  const existing = (files[FileType.Unknown] as DynamxFile[]).find(
    (f) => f.dir.endsWith('pack_info.dynx')
  );
  if (existing) return { content: existing.content, dir: existing.dir };

  const defaultContent = [
    `PackName: ${packFolderName}`,
    'CompatibleWithLoaderVersions: [1.0,1.1)',
    'PackVersion: 5.0.0',
    'DcFileVersion: 12.5.0',
  ].join('\n');

  return { content: defaultContent, dir: `${packFolderName}/pack_info.dynx` };
}
