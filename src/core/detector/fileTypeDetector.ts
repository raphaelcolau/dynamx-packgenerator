import { FileType, FILE_TYPE_PREFIXES } from '../../constants/fileTypes';

export function detectFileType(filename: string): FileType {
  for (const [prefix, type] of FILE_TYPE_PREFIXES) {
    if (filename.includes(prefix)) return type;
  }
  return FileType.Unknown;
}

export function detectDependencyType(dependency: unknown): FileType | 'file' {
  if (typeof dependency === 'object' && dependency !== null) return 'file';
  if (typeof dependency !== 'string') return FileType.Unknown;
  for (const [prefix, type] of FILE_TYPE_PREFIXES) {
    if (dependency.startsWith(prefix)) return type;
  }
  if (dependency.startsWith('obj/')) return FileType.Obj;
  return FileType.Unknown;
}
