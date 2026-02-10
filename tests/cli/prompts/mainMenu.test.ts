import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockFileSystem } from '../../helpers/mockFileSystem';
import { MockLogger } from '../../helpers/mockLogger';
import { createEmptyParsedFiles } from '../../../src/types';

vi.mock('@clack/prompts', () => ({
  select: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
  outro: vi.fn(),
  log: { success: vi.fn(), info: vi.fn() },
}));

vi.mock('../../../src/cli/prompts/packWizard', () => ({
  packWizard: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../src/cli/prompts/listPrompt', () => ({
  listPrompt: vi.fn().mockResolvedValue(undefined),
}));

import * as p from '@clack/prompts';
import { mainMenu } from '../../../src/cli/prompts/mainMenu';
import { packWizard } from '../../../src/cli/prompts/packWizard';
import { listPrompt } from '../../../src/cli/prompts/listPrompt';

function makeMockServices() {
  const fs = new MockFileSystem();
  const logger = new MockLogger();
  const archiveService = { createZip: vi.fn().mockResolvedValue(undefined) };
  const protectService = { protectPack: vi.fn().mockResolvedValue(null) };
  return { fs, logger, archiveService, protectService };
}

describe('mainMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls packWizard when create is selected', async () => {
    // First call: create, second call: exit (to break the loop)
    vi.mocked(p.select)
      .mockResolvedValueOnce('create')
      .mockResolvedValueOnce('exit');

    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();

    try {
      await mainMenu(files, '/test', fs, archiveService, protectService, logger);
    } catch { /* exit throws */ }

    expect(packWizard).toHaveBeenCalled();
    mockExit.mockRestore();
  });

  it('calls listPrompt when list is selected', async () => {
    vi.mocked(p.select)
      .mockResolvedValueOnce('list')
      .mockResolvedValueOnce('exit');

    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();

    try {
      await mainMenu(files, '/test', fs, archiveService, protectService, logger);
    } catch { /* exit throws */ }

    expect(listPrompt).toHaveBeenCalledWith(files);
    mockExit.mockRestore();
  });

  it('clears build folder when clear is selected', async () => {
    vi.mocked(p.select)
      .mockResolvedValueOnce('clear')
      .mockResolvedValueOnce('exit');

    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const { fs, logger, archiveService, protectService } = makeMockServices();
    fs.addDirectory('/test/builds');
    const files = createEmptyParsedFiles();

    try {
      await mainMenu(files, '/test', fs, archiveService, protectService, logger);
    } catch { /* exit throws */ }

    expect(p.log.success).toHaveBeenCalledWith(expect.stringContaining('cleared'));
    mockExit.mockRestore();
  });

  it('exits on cancel (Ctrl+C)', async () => {
    vi.mocked(p.select).mockResolvedValueOnce(Symbol('cancel'));
    vi.mocked(p.isCancel).mockReturnValueOnce(true);

    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();

    try {
      await mainMenu(files, '/test', fs, archiveService, protectService, logger);
    } catch { /* exit throws */ }

    expect(p.cancel).toHaveBeenCalled();
    mockExit.mockRestore();
  });
});
