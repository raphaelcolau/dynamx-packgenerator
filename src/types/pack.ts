import { DynamxFile } from './dynamx';

export interface Pack {
  packId: string;
  elements: DynamxFile[];
  isProtected: boolean | undefined;
  host?: string;
  gameDir?: string;
}
