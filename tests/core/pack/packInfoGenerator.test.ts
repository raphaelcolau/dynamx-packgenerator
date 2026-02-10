import { resolvePackInfo } from '../../../src/core/pack/packInfoGenerator';
import { FileType } from '../../../src/constants/fileTypes';
import { createEmptyParsedFiles, DynamxFile } from '../../../src/types';

describe('resolvePackInfo', () => {
  it('returns existing pack_info.dynx when found', () => {
    const parsedFiles = createEmptyParsedFiles();
    const packInfoFile: DynamxFile = {
      type: FileType.Unknown,
      name: 'pack_info',
      dir: 'mypack/pack_info.dynx',
      content: 'PackName: CustomPack\nPackVersion: 2.0.0',
      dependencies: [],
    };
    (parsedFiles[FileType.Unknown] as DynamxFile[]).push(packInfoFile);

    const result = resolvePackInfo(parsedFiles, 'MyPack');

    expect(result.content).toBe('PackName: CustomPack\nPackVersion: 2.0.0');
    expect(result.dir).toBe('mypack/pack_info.dynx');
  });

  it('generates default content when not found', () => {
    const parsedFiles = createEmptyParsedFiles();

    const result = resolvePackInfo(parsedFiles, 'MyPack');

    expect(result.content).toContain('PackName:');
    expect(result.content).toContain('CompatibleWithLoaderVersions:');
    expect(result.content).toContain('PackVersion:');
    expect(result.content).toContain('DcFileVersion:');
  });

  it('generated content includes pack folder name', () => {
    const parsedFiles = createEmptyParsedFiles();

    const result = resolvePackInfo(parsedFiles, 'AwesomePack');

    expect(result.content).toContain('PackName: AwesomePack');
  });

  it('generated dir uses packFolderName', () => {
    const parsedFiles = createEmptyParsedFiles();

    const result = resolvePackInfo(parsedFiles, 'AwesomePack');

    expect(result.dir).toBe('AwesomePack/pack_info.dynx');
  });

  it('returns correct content for existing file', () => {
    const parsedFiles = createEmptyParsedFiles();
    const customContent = 'PackName: Special\nCompatibleWithLoaderVersions: [1.0,2.0)\nPackVersion: 3.0.0\nDcFileVersion: 10.0.0';
    const packInfoFile: DynamxFile = {
      type: FileType.Unknown,
      name: 'pack_info',
      dir: 'special/pack_info.dynx',
      content: customContent,
      dependencies: [],
    };
    (parsedFiles[FileType.Unknown] as DynamxFile[]).push(packInfoFile);

    const result = resolvePackInfo(parsedFiles, 'AnyName');

    expect(result.content).toBe(customContent);
    expect(result.dir).toBe('special/pack_info.dynx');
  });
});
