import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAppDirectory } from '../../../src/infrastructure/filesystem/appDirectory';
import { MockFileSystem } from '../../helpers/mockFileSystem';
import { MockLogger } from '../../helpers/mockLogger';

describe('getAppDirectory', () => {
  let fs: MockFileSystem;
  let logger: MockLogger;
  const originalPlatform = process.platform;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    fs = new MockFileSystem();
    logger = new MockLogger();
  });

  afterEach(() => {
    Object.defineProperty(process, 'platform', { value: originalPlatform });
    process.env = { ...originalEnv };
  });

  it('returns path containing PackManager', () => {
    const dir = getAppDirectory(fs, logger);
    expect(dir).toContain('PackManager');
  });

  it('creates directory if it does not exist', () => {
    const dir = getAppDirectory(fs, logger);
    expect(logger.hasMessage('Folder created')).toBe(true);
  });

  it('detects existing directory', () => {
    // First call creates it
    const dir = getAppDirectory(fs, logger);
    logger.clear();
    // Make the dir exist in mock
    fs.addDirectory(dir);
    const dir2 = getAppDirectory(fs, logger);
    expect(logger.hasMessage('Folder detected')).toBe(true);
  });

  it('uses APPDATA on win32', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    process.env.APPDATA = 'C:\\Users\\Test\\AppData\\Roaming';
    const dir = getAppDirectory(fs, logger);
    expect(dir).toContain('Roaming');
  });

  it('handles missing APPDATA gracefully', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    delete process.env.APPDATA;
    const dir = getAppDirectory(fs, logger);
    expect(dir).toContain('PackManager');
  });
});
