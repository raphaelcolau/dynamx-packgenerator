import {
  parseDynxDependencies,
  parseDynxName,
  parseDynxVariants,
} from '../../../src/core/parser/dynxParser';

describe('parseDynxDependencies', () => {
  it('extracts Model dependency', () => {
    const content = 'Model: obj/mymodel.obj';
    const result = parseDynxDependencies(content);
    expect(result).toEqual(['obj/mymodel.obj']);
  });

  it('extracts DefaultEngine dependency', () => {
    const content = 'DefaultEngine: MyPack.v8_engine';
    const result = parseDynxDependencies(content);
    expect(result).toEqual(['v8_engine']);
  });

  it('extracts DefaultSounds dependency', () => {
    const content = 'DefaultSounds: MyPack.sport_sounds';
    const result = parseDynxDependencies(content);
    expect(result).toEqual(['sport_sounds']);
  });

  it('extracts AttachedWheel dependency', () => {
    const content = '\tAttachedWheel: MyPack.wheel_standard';
    const result = parseDynxDependencies(content);
    expect(result).toEqual(['wheel_standard']);
  });

  it('extracts multiple dependencies from a full dynx file', () => {
    const content = [
      'Model: obj/car.obj',
      'DefaultEngine: Pack.engine_turbo',
      'DefaultSounds: Pack.sounds_racing',
      '\tAttachedWheel: Pack.wheel_sport',
    ].join('\n');
    const result = parseDynxDependencies(content);
    expect(result).toEqual(['obj/car.obj', 'engine_turbo', 'sounds_racing', 'wheel_sport']);
  });

  it('deduplicates dependencies', () => {
    const content = [
      'AttachedWheel: Pack.wheel_basic',
      'AttachedWheel: Pack.wheel_basic',
    ].join('\n');
    const result = parseDynxDependencies(content);
    expect(result).toEqual(['wheel_basic']);
  });

  it('returns empty array when there are no dependencies', () => {
    const content = 'Name: MyCar\nSomeOtherField: value';
    const result = parseDynxDependencies(content);
    expect(result).toEqual([]);
  });
});

describe('parseDynxName', () => {
  it('extracts name from content', () => {
    const content = 'Name: MyCoolCar\nModel: obj/car.obj';
    const result = parseDynxName(content);
    expect(result).toBe('MyCoolCar');
  });

  it('returns undefined when no name is present', () => {
    const content = 'Model: obj/car.obj\nDefaultEngine: Pack.engine';
    const result = parseDynxName(content);
    expect(result).toBeUndefined();
  });
});

describe('parseDynxVariants', () => {
  it('extracts variants from content', () => {
    const content = 'Name: MyCar\nVariants: red blue green';
    const result = parseDynxVariants(content);
    expect(result).toEqual(['red', 'blue', 'green']);
  });
});
