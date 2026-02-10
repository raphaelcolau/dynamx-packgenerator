import { FileType } from '../constants/fileTypes';

export interface DynamxFile {
  readonly type: FileType;
  readonly name: string;
  readonly dir: string;
  readonly content: string;
  dependencies: (string | Dependency)[];
}

export interface Dependency {
  readonly file: string;
  readonly content: Buffer | string;
  readonly type: 'image' | 'text' | 'audio';
}

export interface ObjFile {
  readonly file: string;
  readonly dependencies: Dependency[];
  readonly content: string;
}

export type ParsedFiles = {
  [K in Exclude<FileType, FileType.Obj | FileType.Unknown>]: DynamxFile[];
} & {
  [FileType.Obj]: ObjFile[];
  [FileType.Unknown]: DynamxFile[];
  total: number;
};

export function createEmptyParsedFiles(objFiles: ObjFile[] = []): ParsedFiles {
  return {
    [FileType.Vehicle]: [],
    [FileType.Trailer]: [],
    [FileType.Armor]: [],
    [FileType.Wheel]: [],
    [FileType.Engine]: [],
    [FileType.Sounds]: [],
    [FileType.BlockProp]: [],
    [FileType.Block]: [],
    [FileType.Boat]: [],
    [FileType.Helicopter]: [],
    [FileType.Plane]: [],
    [FileType.Obj]: objFiles,
    [FileType.Unknown]: [],
    total: 0,
  };
}
