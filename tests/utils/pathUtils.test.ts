import { normalizePath, getFileName, getDirectory } from '../../src/utils/pathUtils';

describe('normalizePath', () => {
  it('should replace backslashes with forward slashes', () => {
    expect(normalizePath('foo\\bar\\baz')).toBe('foo/bar/baz');
  });

  it('should preserve existing forward slashes', () => {
    expect(normalizePath('foo/bar/baz')).toBe('foo/bar/baz');
  });
});

describe('getFileName', () => {
  it('should return the last segment after the last slash', () => {
    expect(getFileName('path/to/file.txt')).toBe('file.txt');
  });

  it('should return the input when there is no separator', () => {
    expect(getFileName('file.txt')).toBe('file.txt');
  });
});

describe('getDirectory', () => {
  it('should return the directory path with trailing slash', () => {
    expect(getDirectory('path/to/file.txt')).toBe('path/to/');
  });
});
