import { vi } from 'vitest';
import { detect } from '../../../src/core/detector/detector';
import { MockFileSystem } from '../../helpers/mockFileSystem';
import { MockLogger } from '../../helpers/mockLogger';
import { FileType } from '../../../src/constants/fileTypes';
import { createEmptyParsedFiles } from '../../../src/types';

describe('detect', () => {
  let fs: MockFileSystem;
  let logger: MockLogger;
  const directory = '/project';

  beforeEach(() => {
    fs = new MockFileSystem();
    logger = new MockLogger();
  });

  it('creates Packs directory if missing', async () => {
    const result = await detect(directory, fs, logger);

    expect(result).toEqual(createEmptyParsedFiles());
    expect(logger.hasMessage('Packs folder created')).toBe(true);
  });

  it('returns empty ParsedFiles when no files found', async () => {
    fs.addDirectory('/project/Packs');

    const result = await detect(directory, fs, logger);

    expect(result[FileType.Vehicle]).toEqual([]);
    expect(result[FileType.Trailer]).toEqual([]);
    expect(result[FileType.Obj]).toEqual([]);
    expect(logger.hasMessage('No files found')).toBe(true);
  });

  it('correctly categorizes a vehicle .dynx file', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile('/project/Packs/mypack/vehicle_car.dynx', 'Name: MyCar');

    const result = await detect(directory, fs, logger);

    expect(result[FileType.Vehicle]).toHaveLength(1);
    expect(result[FileType.Vehicle][0].type).toBe(FileType.Vehicle);
    expect(result[FileType.Vehicle][0].name).toBe('vehicle_car');
  });

  it('correctly categorizes a trailer .dynx file', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile('/project/Packs/mypack/trailer_flat.dynx', 'Name: FlatTrailer');

    const result = await detect(directory, fs, logger);

    expect(result[FileType.Trailer]).toHaveLength(1);
    expect(result[FileType.Trailer][0].type).toBe(FileType.Trailer);
    expect(result[FileType.Trailer][0].name).toBe('trailer_flat');
  });

  it('correctly categorizes multiple file types', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile('/project/Packs/pack/vehicle_car.dynx', 'Name: Car');
    fs.addFile('/project/Packs/pack/wheel_big.dynx', 'Name: BigWheel');
    fs.addFile('/project/Packs/pack/engine_v8.dynx', 'Name: V8');
    fs.addFile('/project/Packs/pack/armor_plate.dynx', 'Name: Plate');

    const result = await detect(directory, fs, logger);

    expect(result[FileType.Vehicle]).toHaveLength(1);
    expect(result[FileType.Wheel]).toHaveLength(1);
    expect(result[FileType.Engine]).toHaveLength(1);
    expect(result[FileType.Armor]).toHaveLength(1);
  });

  it('parses dependencies for vehicle files', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile(
      '/project/Packs/pack/vehicle_car.dynx',
      'Name: Car\nModel: obj/car_model\nDefaultEngine: pack.engine_v8'
    );

    const result = await detect(directory, fs, logger);

    const vehicle = result[FileType.Vehicle][0];
    expect(vehicle.dependencies).toContain('obj/car_model');
    expect(vehicle.dependencies).toContain('engine_v8');
  });

  it('includes obj files from resolveAllObjFiles', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile('/project/Packs/pack/obj/car.obj', 'mtllib car.mtl');
    fs.addFile('/project/Packs/pack/obj/car.mtl', '# material');
    fs.addFile('/project/Packs/pack/vehicle_car.dynx', 'Name: Car');

    const result = await detect(directory, fs, logger);

    expect(result[FileType.Obj].length).toBeGreaterThanOrEqual(1);
    expect(result[FileType.Obj][0].file).toContain('car.obj');
  });

  it('computes correct total count', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile('/project/Packs/pack/vehicle_car.dynx', 'Name: Car');
    fs.addFile('/project/Packs/pack/vehicle_truck.dynx', 'Name: Truck');
    fs.addFile('/project/Packs/pack/wheel_big.dynx', 'Name: BigWheel');

    const result = await detect(directory, fs, logger);

    expect(result.total).toBe(3);
  });

  it('handles unknown file types', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile('/project/Packs/pack/random_thing.dynx', 'Name: Unknown');

    const result = await detect(directory, fs, logger);

    expect(result[FileType.Unknown]).toHaveLength(1);
    expect(result[FileType.Unknown][0].type).toBe(FileType.Unknown);
  });

  it('normalizes paths in file dirs', async () => {
    fs.addDirectory('/project/Packs');
    fs.addFile('/project/Packs/pack/vehicle_car.dynx', 'Name: Car');

    const result = await detect(directory, fs, logger);

    const vehicle = result[FileType.Vehicle][0];
    expect(vehicle.dir).not.toContain('\\');
    expect(vehicle.dir).toContain('/');
  });
});
