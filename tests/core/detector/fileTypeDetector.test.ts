import { detectFileType, detectDependencyType } from '../../../src/core/detector/fileTypeDetector';
import { FileType } from '../../../src/constants/fileTypes';

describe('detectFileType', () => {
  it('returns Vehicle for filename with vehicle_ prefix', () => {
    expect(detectFileType('vehicle_sedan.dynx')).toBe(FileType.Vehicle);
  });

  it('returns Trailer for filename with trailer_ prefix', () => {
    expect(detectFileType('trailer_flatbed.dynx')).toBe(FileType.Trailer);
  });

  it('returns Armor for filename with armor_ prefix', () => {
    expect(detectFileType('armor_heavy.dynx')).toBe(FileType.Armor);
  });

  it('returns Wheel for filename with wheel_ prefix', () => {
    expect(detectFileType('wheel_offroad.dynx')).toBe(FileType.Wheel);
  });

  it('returns Engine for filename with engine_ prefix', () => {
    expect(detectFileType('engine_v8.dynx')).toBe(FileType.Engine);
  });

  it('returns Sounds for filename with sounds_ prefix', () => {
    expect(detectFileType('sounds_muscle.dynx')).toBe(FileType.Sounds);
  });

  it('returns BlockProp for filename with block_prop_ prefix before matching block_', () => {
    expect(detectFileType('block_prop_chair.dynx')).toBe(FileType.BlockProp);
  });

  it('returns Block for filename with block_ prefix that is not block_prop_', () => {
    expect(detectFileType('block_concrete.dynx')).toBe(FileType.Block);
  });

  it('returns Boat for filename with boat_ prefix', () => {
    expect(detectFileType('boat_speedster.dynx')).toBe(FileType.Boat);
  });

  it('returns Helicopter for filename with helicopter_ prefix', () => {
    expect(detectFileType('helicopter_apache.dynx')).toBe(FileType.Helicopter);
  });

  it('returns Plane for filename with plane_ prefix', () => {
    expect(detectFileType('plane_cessna.dynx')).toBe(FileType.Plane);
  });

  it('returns Unknown for unrecognized filename', () => {
    expect(detectFileType('readme.txt')).toBe(FileType.Unknown);
  });
});

describe('detectDependencyType', () => {
  it('returns file for object dependency', () => {
    expect(detectDependencyType({ file: 'test.obj', content: '', type: 'text' })).toBe('file');
  });

  it('returns correct FileType for string with known prefix', () => {
    expect(detectDependencyType('engine_turbo')).toBe(FileType.Engine);
  });

  it('returns Obj for string starting with obj/', () => {
    expect(detectDependencyType('obj/mymodel.obj')).toBe(FileType.Obj);
  });
});
