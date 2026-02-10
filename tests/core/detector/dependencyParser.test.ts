import { parseSoundDependencies, parseInlineSoundDependencies, resolveAllObjFiles } from '../../../src/core/detector/dependencyParser';
import { MockFileSystem } from '../../helpers/mockFileSystem';
import { MockLogger } from '../../helpers/mockLogger';
import { FileType } from '../../../src/constants/fileTypes';
import type { DynamxFile } from '../../../src/types';

function createDynamxFile(overrides: Partial<DynamxFile> = {}): DynamxFile {
  return {
    type: FileType.Sounds,
    name: 'test_sound',
    dir: 'mypack/sounds',
    content: '',
    dependencies: [],
    ...overrides,
  };
}

describe('parseSoundDependencies', () => {
  let fs: MockFileSystem;
  let logger: MockLogger;

  beforeEach(() => {
    fs = new MockFileSystem();
    logger = new MockLogger();
  });

  it('returns empty array when there are no Sound: lines', async () => {
    const file = createDynamxFile({ content: 'Name: TestSound\nVolume: 1.0' });
    const result = await parseSoundDependencies(file, '/packs', fs, logger);
    expect(result).toEqual([]);
  });

  it('resolves a single sound dependency', async () => {
    const file = createDynamxFile({
      content: 'Sound: engine_start',
      dir: 'mypack/sounds',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/engine_start.ogg', 'audio-data');
    const result = await parseSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('mypack/assets/dynamxmod/sounds/engine_start.ogg');
    expect(result[0].type).toBe('audio');
  });

  it('resolves multiple sound dependencies', async () => {
    const file = createDynamxFile({
      content: 'Sound: start\nSound: idle\nSound: accelerate',
      dir: 'mypack/sounds',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/start.ogg', 'data1');
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/idle.ogg', 'data2');
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/accelerate.ogg', 'data3');
    const result = await parseSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(3);
    expect(result.map(d => d.file)).toEqual([
      'mypack/assets/dynamxmod/sounds/start.ogg',
      'mypack/assets/dynamxmod/sounds/idle.ogg',
      'mypack/assets/dynamxmod/sounds/accelerate.ogg',
    ]);
  });

  it('deduplicates sound dependencies', async () => {
    const file = createDynamxFile({
      content: 'Sound: horn\nSound: horn',
      dir: 'mypack/sounds',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/horn.ogg', 'data');
    const result = await parseSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
  });

  it('logs error when sound file is missing', async () => {
    const file = createDynamxFile({
      content: 'Sound: missing_sound',
      dir: 'mypack/sounds',
    });
    await parseSoundDependencies(file, '/packs', fs, logger);
    expect(logger.getErrors().length).toBeGreaterThan(0);
    expect(logger.hasMessage('ENOENT')).toBe(true);
  });

  it('uses the correct pack name from file.dir', async () => {
    const file = createDynamxFile({
      content: 'Sound: beep',
      dir: 'custompack/vehicles/sounds',
    });
    fs.addFile('/packs/custompack/assets/dynamxmod/sounds/beep.ogg', 'beep-data');
    const result = await parseSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('custompack/assets/dynamxmod/sounds/beep.ogg');
  });

  it('handles Sound: with empty value', async () => {
    const file = createDynamxFile({
      content: 'Sound: ',
      dir: 'mypack/sounds',
    });
    const result = await parseSoundDependencies(file, '/packs', fs, logger);
    expect(result).toEqual([]);
  });

  it('handles multiple Sound: entries in the same file', async () => {
    const file = createDynamxFile({
      content: 'Sound: rev_low\nName: V8Engine\nSound: rev_high',
      dir: 'mypack/sounds',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/rev_low.ogg', 'low');
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/rev_high.ogg', 'high');
    const result = await parseSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(2);
    expect(result[0].file).toContain('rev_low');
    expect(result[1].file).toContain('rev_high');
  });
});

describe('parseInlineSoundDependencies', () => {
  let fs: MockFileSystem;
  let logger: MockLogger;

  beforeEach(() => {
    fs = new MockFileSystem();
    logger = new MockLogger();
  });

  it('returns empty array for file without HornSound or SirenSound', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'Name: Sedan\nModel: obj/sedan.obj\nDefaultSounds: pack.sounds_sedan',
      dir: 'mypack/vehicle_sedan.dynx',
    });
    const result = await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(result).toEqual([]);
  });

  it('extracts single HornSound dependency', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'Name: Sedan\nHornSound: horn',
      dir: 'mypack/vehicle_sedan.dynx',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/horn.ogg', 'horn-audio');
    const result = await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('mypack/assets/dynamxmod/sounds/horn.ogg');
    expect(result[0].type).toBe('audio');
  });

  it('extracts single SirenSound dependency', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'Name: Ambulance\nSirenSound: siren',
      dir: 'mypack/vehicle_ambulance.dynx',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/siren.ogg', 'siren-audio');
    const result = await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('mypack/assets/dynamxmod/sounds/siren.ogg');
    expect(result[0].type).toBe('audio');
  });

  it('extracts both HornSound and SirenSound', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'Name: Police\nHornSound: horn\nSirenSound: siren',
      dir: 'mypack/vehicle_police.dynx',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/horn.ogg', 'horn-audio');
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/siren.ogg', 'siren-audio');
    const result = await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(2);
    expect(result.map(d => d.file)).toContain('mypack/assets/dynamxmod/sounds/horn.ogg');
    expect(result.map(d => d.file)).toContain('mypack/assets/dynamxmod/sounds/siren.ogg');
  });

  it('handles path with subdirectory (horn/car)', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'HornSound: horn/car',
      dir: 'mypack/vehicle_sedan.dynx',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/horn/car.ogg', 'car-horn-audio');
    const result = await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('mypack/assets/dynamxmod/sounds/horn/car.ogg');
  });

  it('deduplicates identical sound paths', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'HornSound: horn\nHornSound: horn',
      dir: 'mypack/vehicle_sedan.dynx',
    });
    fs.addFile('/packs/mypack/assets/dynamxmod/sounds/horn.ogg', 'horn-audio');
    const result = await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
  });

  it('logs error for missing .ogg file', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'HornSound: missing_horn',
      dir: 'mypack/vehicle_sedan.dynx',
    });
    await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(logger.getErrors().length).toBeGreaterThan(0);
    expect(logger.hasMessage('ENOENT')).toBe(true);
  });

  it('uses correct pack name from file.dir', async () => {
    const file = createDynamxFile({
      type: FileType.Vehicle,
      content: 'SirenSound: ambulance_siren',
      dir: 'custompack/vehicles/vehicle_ambulance.dynx',
    });
    fs.addFile('/packs/custompack/assets/dynamxmod/sounds/ambulance_siren.ogg', 'siren-data');
    const result = await parseInlineSoundDependencies(file, '/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('custompack/assets/dynamxmod/sounds/ambulance_siren.ogg');
  });
});

describe('resolveAllObjFiles', () => {
  let fs: MockFileSystem;
  let logger: MockLogger;

  beforeEach(() => {
    fs = new MockFileSystem();
    logger = new MockLogger();
  });

  it('returns empty array when there are no obj files', async () => {
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toEqual([]);
  });

  it('parses a single obj file', async () => {
    fs.addFile('/packs/model.obj', 'v 0 0 0\nv 1 0 0\nf 1 2');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).toBe('model.obj');
    expect(result[0].content).toBe('v 0 0 0\nv 1 0 0\nf 1 2');
  });

  it('resolves mtl dependency from obj', async () => {
    fs.addFile('/packs/model.obj', 'mtllib material.mtl\nv 0 0 0');
    fs.addFile('/packs/material.mtl', 'newmtl Default');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    const mtlDep = result[0].dependencies.find(d => d.file.endsWith('.mtl'));
    expect(mtlDep).toBeDefined();
    expect(mtlDep!.file).toBe('material.mtl');
    expect(mtlDep!.type).toBe('text');
  });

  it('resolves texture from mtl map_Kd line', async () => {
    fs.addFile('/packs/model.obj', 'mtllib material.mtl\nv 0 0 0');
    fs.addFile('/packs/material.mtl', 'newmtl Default\nmap_Kd texture.png');
    fs.addFile('/packs/texture.png', Buffer.from('png-data'));
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    const texDep = result[0].dependencies.find(d => d.file.endsWith('.png'));
    expect(texDep).toBeDefined();
    expect(texDep!.file).toBe('texture.png');
    expect(texDep!.type).toBe('image');
  });

  it('handles missing mtl file gracefully', async () => {
    fs.addFile('/packs/model.obj', 'mtllib missing.mtl\nv 0 0 0');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(logger.getErrors().length).toBeGreaterThan(0);
    expect(logger.hasMessage('ENOENT')).toBe(true);
  });

  it('resolves dc collision files', async () => {
    fs.addFile('/packs/model.obj', 'v 0 0 0');
    fs.addFile('/packs/model.dc', 'collision-data');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    const dcDep = result[0].dependencies.find(d => d.file.endsWith('.dc'));
    expect(dcDep).toBeDefined();
    expect(dcDep!.file).toBe('model.dc');
    expect(dcDep!.type).toBe('text');
  });

  it('handles multiple obj files', async () => {
    fs.addFile('/packs/car.obj', 'v 0 0 0');
    fs.addFile('/packs/truck.obj', 'v 1 1 1');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(2);
    const fileNames = result.map(r => r.file);
    expect(fileNames).toContain('car.obj');
    expect(fileNames).toContain('truck.obj');
  });

  it('normalizes backslashes in file paths', async () => {
    fs.addFile('/packs/models\\car.obj', 'v 0 0 0');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].file).not.toContain('\\');
    expect(result[0].file).toContain('/');
  });

  it('skips mtl with name >= 256 characters', async () => {
    const longName = 'a'.repeat(256) + '.mtl';
    fs.addFile('/packs/model.obj', `mtllib ${longName}\nv 0 0 0`);
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    const mtlDep = result[0].dependencies.find(d => d.file.endsWith('.mtl'));
    expect(mtlDep).toBeUndefined();
    expect(logger.hasMessage('mtl file name is too long')).toBe(true);
  });

  it('handles obj with no dependencies', async () => {
    fs.addFile('/packs/simple.obj', 'v 0 0 0\nv 1 0 0\nf 1 2');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    expect(result[0].dependencies).toEqual([]);
    expect(logger.hasMessage('No dependencies found')).toBe(true);
  });

  it('handles mtl with no map_Kd lines', async () => {
    fs.addFile('/packs/model.obj', 'mtllib simple.mtl\nv 0 0 0');
    fs.addFile('/packs/simple.mtl', 'newmtl Default\nKd 0.8 0.8 0.8');
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(1);
    const mtlDep = result[0].dependencies.find(d => d.file.endsWith('.mtl'));
    expect(mtlDep).toBeDefined();
    const texDep = result[0].dependencies.find(d => d.type === 'image');
    expect(texDep).toBeUndefined();
  });

  it('returns correct content for each obj file', async () => {
    const carContent = 'v 0 0 0\nv 1 0 0\nf 1 2';
    const truckContent = 'v 2 2 2\nv 3 3 3\nf 1 2';
    fs.addFile('/packs/car.obj', carContent);
    fs.addFile('/packs/truck.obj', truckContent);
    const result = await resolveAllObjFiles('/packs', fs, logger);
    expect(result).toHaveLength(2);
    const car = result.find(r => r.file === 'car.obj');
    const truck = result.find(r => r.file === 'truck.obj');
    expect(car!.content).toBe(carContent);
    expect(truck!.content).toBe(truckContent);
  });
});
