export enum FileType {
  Vehicle = 'vehicle',
  Trailer = 'trailer',
  Armor = 'armor',
  Wheel = 'wheel',
  Engine = 'engine',
  Sounds = 'sounds',
  BlockProp = 'block_prop',
  Block = 'block',
  Boat = 'boat',
  Helicopter = 'helicopter',
  Plane = 'plane',
  Obj = 'obj',
  Unknown = 'unknown',
}

export const FILE_TYPE_PREFIXES: ReadonlyArray<[string, FileType]> = [
  ['vehicle_', FileType.Vehicle],
  ['trailer_', FileType.Trailer],
  ['armor_', FileType.Armor],
  ['wheel_', FileType.Wheel],
  ['engine_', FileType.Engine],
  ['sounds_', FileType.Sounds],
  ['block_prop_', FileType.BlockProp],
  ['block_', FileType.Block],
  ['boat_', FileType.Boat],
  ['helicopter_', FileType.Helicopter],
  ['plane_', FileType.Plane],
];

export const TYPES_WITH_DYNX_DEPENDENCIES: readonly FileType[] = [
  FileType.Vehicle, FileType.Trailer, FileType.Armor, FileType.Wheel,
  FileType.BlockProp, FileType.Block, FileType.Boat, FileType.Helicopter, FileType.Plane,
];

export const SELECTABLE_TYPES: ReadonlyArray<[FileType, string]> = [
  [FileType.Vehicle, 'Vehicle'],
  [FileType.Trailer, 'Trailer'],
  [FileType.Armor, 'Armor'],
  [FileType.Block, 'Block'],
  [FileType.BlockProp, 'Block Prop'],
  [FileType.Boat, 'Boat'],
  [FileType.Plane, 'Plane'],
  [FileType.Helicopter, 'Helicopter'],
];

export const ALL_FILE_TYPE_NAMES: readonly string[] = Object.values(FileType);

export function stripFileTypePrefix(name: string): string {
  for (const [prefix] of FILE_TYPE_PREFIXES) {
    if (name.startsWith(prefix)) return name.slice(prefix.length);
  }
  return name;
}

export const FILE_TYPE_LABELS: Record<FileType, string> = {
  [FileType.Vehicle]: 'Vehicle',
  [FileType.Trailer]: 'Trailer',
  [FileType.Armor]: 'Armor',
  [FileType.Wheel]: 'Wheel',
  [FileType.Engine]: 'Engine',
  [FileType.Sounds]: 'Sounds',
  [FileType.BlockProp]: 'Block Prop',
  [FileType.Block]: 'Block',
  [FileType.Boat]: 'Boat',
  [FileType.Helicopter]: 'Helicopter',
  [FileType.Plane]: 'Plane',
  [FileType.Obj]: 'Obj',
  [FileType.Unknown]: 'Unknown',
};
