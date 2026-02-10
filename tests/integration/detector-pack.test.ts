import { detect } from '../../src/core/detector/detector';
import { PackBuilder } from '../../src/core/pack/packBuilder';
import { generateLangFileContent } from '../../src/core/pack/langFileGenerator';
import { resolvePackInfo } from '../../src/core/pack/packInfoGenerator';
import { MockFileSystem } from '../helpers/mockFileSystem';
import { MockLogger } from '../helpers/mockLogger';
import { FileType } from '../../src/constants/fileTypes';
import { DynamxFile } from '../../src/types';

describe('Detector → Pack Integration', () => {
  let fs: MockFileSystem;
  let logger: MockLogger;
  const dir = '/test';

  beforeEach(() => {
    fs = new MockFileSystem();
    logger = new MockLogger();

    // Register the Packs directory so existsSync returns true
    fs.addDirectory('/test/Packs');

    // Vehicle file
    fs.addFile(
      '/test/Packs/MyPack/vehicle_sedan.dynx',
      'Name: Sedan\nModel: obj/sedan.obj\nDefaultEngine: MyPack.engine_v6\nDefaultSounds: MyPack.sounds_sport\n\tAttachedWheel: MyPack.wheel_basic'
    );

    // Armor file
    fs.addFile(
      '/test/Packs/MyPack/armor_vest.dynx',
      'Name: Vest\nModel: obj/vest.obj'
    );

    // Wheel file
    fs.addFile(
      '/test/Packs/MyPack/wheel_basic.dynx',
      'Name: Basic Wheel\nModel: obj/wheel.obj'
    );

    // Block file
    fs.addFile(
      '/test/Packs/MyPack/block_wall.dynx',
      'Name: Wall\nModel: obj/wall.obj'
    );

    // Unknown / pack_info
    fs.addFile(
      '/test/Packs/MyPack/pack_info.dynx',
      'PackName: MyPack\nCompatibleWithLoaderVersions: [1.0,1.1)\nPackVersion: 2.0.0\nDcFileVersion: 12.5.0'
    );
  });

  it('should detect vehicle files correctly', async () => {
    const parsed = await detect(dir, fs, logger);
    const vehicles = parsed[FileType.Vehicle] as DynamxFile[];
    expect(vehicles).toHaveLength(1);
    expect(vehicles[0].name).toBe('vehicle_sedan');
    expect(vehicles[0].type).toBe(FileType.Vehicle);
  });

  it('should detect armor files correctly', async () => {
    const parsed = await detect(dir, fs, logger);
    const armors = parsed[FileType.Armor] as DynamxFile[];
    expect(armors).toHaveLength(1);
    expect(armors[0].name).toBe('armor_vest');
    expect(armors[0].type).toBe(FileType.Armor);
  });

  it('should preserve file content in detected files', async () => {
    const parsed = await detect(dir, fs, logger);
    const vehicles = parsed[FileType.Vehicle] as DynamxFile[];
    expect(vehicles[0].content).toContain('Name: Sedan');
    expect(vehicles[0].content).toContain('Model: obj/sedan.obj');
  });

  it('should allow PackBuilder to create a pack from detected vehicles', async () => {
    const parsed = await detect(dir, fs, logger);
    const vehicles = parsed[FileType.Vehicle] as DynamxFile[];

    const builder = new PackBuilder();
    builder.setPackId('test01');
    builder.addElements(vehicles);
    const pack = builder.build();

    expect(pack.packId).toBe('test01');
    expect(pack.elements).toHaveLength(1);
    expect(pack.elements[0].name).toBe('vehicle_sedan');
  });

  it('should generate correct lang file content from detected files', async () => {
    const parsed = await detect(dir, fs, logger);
    const vehicles = parsed[FileType.Vehicle] as DynamxFile[];

    const builder = new PackBuilder();
    builder.setPackId('lang01');
    builder.addElements(vehicles);
    const pack = builder.build();

    const langContent = generateLangFileContent(pack, 'MyPack');
    expect(langContent).toContain('item.dynamxmod.mypack.vehicle_sedan.name=Sedan');
  });

  it('should generate default pack info when no pack_info exists in unknown files', async () => {
    const parsed = await detect(dir, fs, logger);
    // Remove pack_info from unknown files to test default generation
    parsed[FileType.Unknown] = [];

    const result = resolvePackInfo(parsed, 'MyPack');
    expect(result.content).toContain('PackName: MyPack');
    expect(result.content).toContain('CompatibleWithLoaderVersions:');
    expect(result.dir).toBe('MyPack/pack_info.dynx');
  });

  it('should find existing pack_info from unknown files', async () => {
    const parsed = await detect(dir, fs, logger);
    const result = resolvePackInfo(parsed, 'MyPack');
    expect(result.content).toContain('PackName: MyPack');
    expect(result.content).toContain('PackVersion: 2.0.0');
  });

  it('should support full flow: detect → build pack → generate lang → resolve pack info', async () => {
    const parsed = await detect(dir, fs, logger);

    // Build pack from all vehicle + armor elements
    const builder = new PackBuilder();
    builder.setPackId('full01');
    builder.addElements(parsed[FileType.Vehicle] as DynamxFile[]);
    builder.addElements(parsed[FileType.Armor] as DynamxFile[]);
    const pack = builder.build();

    expect(pack.elements).toHaveLength(2);

    const langContent = generateLangFileContent(pack, 'MyPack');
    expect(langContent).toContain('vehicle_sedan');
    expect(langContent).toContain('armor_vest');

    const packInfo = resolvePackInfo(parsed, 'MyPack');
    expect(packInfo.content).toBeTruthy();
  });

  it('should preserve dependencies for detected vehicle files', async () => {
    const parsed = await detect(dir, fs, logger);
    const vehicles = parsed[FileType.Vehicle] as DynamxFile[];
    const deps = vehicles[0].dependencies as string[];

    expect(deps).toContain('obj/sedan.obj');
    expect(deps).toContain('engine_v6');
    expect(deps).toContain('sounds_sport');
    expect(deps).toContain('wheel_basic');
  });

  it('should deduplicate elements when added to PackBuilder', async () => {
    const parsed = await detect(dir, fs, logger);
    const vehicles = parsed[FileType.Vehicle] as DynamxFile[];

    const builder = new PackBuilder();
    builder.addElements(vehicles);
    builder.addElements(vehicles); // add same elements again
    const pack = builder.build();

    expect(pack.elements).toHaveLength(1);
  });
});
