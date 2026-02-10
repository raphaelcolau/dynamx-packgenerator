import { generateLangFileContent } from '../../../src/core/pack/langFileGenerator';
import { FileType } from '../../../src/constants/fileTypes';
import { Pack, DynamxFile } from '../../../src/types';

function createPack(elements: DynamxFile[], packId = 'test01'): Pack {
  return { packId, elements, isProtected: undefined };
}

function createFile(dir: string, content: string): DynamxFile {
  return {
    type: FileType.Vehicle,
    name: 'test',
    dir,
    content,
    dependencies: [],
  };
}

describe('generateLangFileContent', () => {
  it('generates empty string for empty pack', () => {
    const pack = createPack([]);

    const result = generateLangFileContent(pack, 'MyPack');

    expect(result).toBe('');
  });

  it('generates correct lang entry for single element', () => {
    const file = createFile('pack/vehicle_car.dynx', 'Name: Sports Car');
    const pack = createPack([file]);

    const result = generateLangFileContent(pack, 'MyPack');

    expect(result).toContain('item.dynamxmod.mypack.vehicle_car.name=Sports Car');
  });

  it('includes display name from content', () => {
    const file = createFile('pack/vehicle_sedan.dynx', 'Name: Luxury Sedan');
    const pack = createPack([file]);

    const result = generateLangFileContent(pack, 'TestPack');

    expect(result).toContain('Luxury Sedan');
  });

  it('generates entries for variants', () => {
    const file = createFile(
      'pack/vehicle_car.dynx',
      'Name: Sports Car\nVariants: Red Blue Green'
    );
    const pack = createPack([file]);

    const result = generateLangFileContent(pack, 'MyPack');

    expect(result).toContain('item.dynamxmod.mypack.vehicle_car_red.name=Sports Car (Red)');
    expect(result).toContain('item.dynamxmod.mypack.vehicle_car_blue.name=Sports Car (Blue)');
    expect(result).toContain('item.dynamxmod.mypack.vehicle_car_green.name=Sports Car (Green)');
  });

  it('handles multiple elements', () => {
    const file1 = createFile('pack/vehicle_car.dynx', 'Name: Car');
    const file2 = createFile('pack/vehicle_truck.dynx', 'Name: Truck');
    const pack = createPack([file1, file2]);

    const result = generateLangFileContent(pack, 'MyPack');

    expect(result).toContain('vehicle_car');
    expect(result).toContain('vehicle_truck');
    expect(result).toContain('Car');
    expect(result).toContain('Truck');
  });

  it('lowercases pack folder name', () => {
    const file = createFile('pack/vehicle_car.dynx', 'Name: Car');
    const pack = createPack([file]);

    const result = generateLangFileContent(pack, 'MyPACK');

    expect(result).toContain('item.dynamxmod.mypack.');
    expect(result).not.toContain('MyPACK');
  });

  it('strips .dynx from filename', () => {
    const file = createFile('pack/vehicle_car.dynx', 'Name: Car');
    const pack = createPack([file]);

    const result = generateLangFileContent(pack, 'Pack');

    expect(result).toContain('item.dynamxmod.pack.vehicle_car.name=');
    expect(result).not.toContain('.dynx.name');
  });

  it('returns empty when name not found in content', () => {
    const file = createFile('pack/vehicle_car.dynx', 'Model: obj/car');
    const pack = createPack([file]);

    const result = generateLangFileContent(pack, 'MyPack');

    expect(result).toBe('');
  });
});
