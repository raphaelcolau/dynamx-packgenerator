import { PackBuilder } from '../../../src/core/pack/packBuilder';
import { FileType } from '../../../src/constants/fileTypes';
import { DynamxFile } from '../../../src/types';

function createDummyFile(name: string): DynamxFile {
  return {
    type: FileType.Vehicle,
    name,
    dir: `pack/${name}.dynx`,
    content: `Name: ${name}`,
    dependencies: [],
  };
}

describe('PackBuilder', () => {
  it('constructor generates a packId', () => {
    const builder = new PackBuilder();

    expect(builder.getPackId()).toBeDefined();
    expect(builder.getPackId()).toHaveLength(6);
  });

  it('setPackId changes the pack id', () => {
    const builder = new PackBuilder();
    builder.setPackId('custom');

    expect(builder.getPackId()).toBe('custom');
  });

  it('addElement adds a DynamxFile', () => {
    const builder = new PackBuilder();
    const file = createDummyFile('car');

    builder.addElement(file);

    expect(builder.getElementCount()).toBe(1);
  });

  it('addElement does not add duplicate', () => {
    const builder = new PackBuilder();
    const file = createDummyFile('car');

    builder.addElement(file).addElement(file);

    expect(builder.getElementCount()).toBe(1);
  });

  it('addElements adds multiple elements', () => {
    const builder = new PackBuilder();
    const files = [createDummyFile('car'), createDummyFile('truck')];

    builder.addElements(files);

    expect(builder.getElementCount()).toBe(2);
  });

  it('getElementCount returns correct count', () => {
    const builder = new PackBuilder();

    expect(builder.getElementCount()).toBe(0);

    builder.addElement(createDummyFile('a'));
    builder.addElement(createDummyFile('b'));
    builder.addElement(createDummyFile('c'));

    expect(builder.getElementCount()).toBe(3);
  });

  it('build returns a Pack object with all properties', () => {
    const builder = new PackBuilder();
    const file = createDummyFile('car');

    const pack = builder
      .setPackId('abc123')
      .addElement(file)
      .setProtected(true)
      .setHost('http://example.com')
      .setGameDir('/game')
      .build();

    expect(pack.packId).toBe('abc123');
    expect(pack.elements).toHaveLength(1);
    expect(pack.elements[0]).toEqual(file);
    expect(pack.isProtected).toBe(true);
    expect(pack.host).toBe('http://example.com');
    expect(pack.gameDir).toBe('/game');
  });

  it('build returns a copy of elements (not same reference)', () => {
    const builder = new PackBuilder();
    const file = createDummyFile('car');
    builder.addElement(file);

    const pack1 = builder.build();
    const pack2 = builder.build();

    expect(pack1.elements).toEqual(pack2.elements);
    expect(pack1.elements).not.toBe(pack2.elements);
  });
});
