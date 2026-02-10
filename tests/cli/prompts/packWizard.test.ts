import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockFileSystem } from '../../helpers/mockFileSystem';
import { MockLogger } from '../../helpers/mockLogger';
import { FileType } from '../../../src/constants/fileTypes';
import { createEmptyParsedFiles, DynamxFile } from '../../../src/types';

vi.mock('@clack/prompts', () => ({
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn(),
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn(), message: vi.fn() })),
  isCancel: vi.fn(() => false),
  log: { step: vi.fn(), info: vi.fn(), warn: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

vi.mock('../../../src/core/pack/packGenerator', () => ({
  generatePack: vi.fn().mockResolvedValue('/test/builds/mypack/MyPack-mypack.dnxpack'),
}));

import * as p from '@clack/prompts';
import { packWizard } from '../../../src/cli/prompts/packWizard';
import { generatePack } from '../../../src/core/pack/packGenerator';

function makeMockServices() {
  const fs = new MockFileSystem();
  const logger = new MockLogger();
  const archiveService = { createZip: vi.fn().mockResolvedValue(undefined) };
  const protectService = { protectPack: vi.fn().mockResolvedValue('https://dl.example.com/pack.zip') };
  return { fs, logger, archiveService, protectService };
}

function makeVehicle(name: string): DynamxFile {
  return { type: FileType.Vehicle, name, dir: `pack/${name}.dynx`, content: `Name: ${name}`, dependencies: [] };
}

describe('packWizard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(generatePack).mockResolvedValue('/test/builds/mypack/MyPack-mypack.dnxpack');
  });

  it('returns early when pack name is cancelled', async () => {
    vi.mocked(p.text).mockResolvedValue(Symbol('cancel'));
    vi.mocked(p.isCancel).mockReturnValue(true);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(p.multiselect).not.toHaveBeenCalled();
  });

  it('warns when no selectable types have files', async () => {
    vi.mocked(p.text).mockResolvedValue('mypack');
    vi.mocked(p.isCancel).mockReturnValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(p.log.warn).toHaveBeenCalledWith(expect.stringContaining('No selectable files'));
  });

  it('prompts for file type selection when types have files', async () => {
    vi.mocked(p.text).mockResolvedValue('mypack');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])  // type selection
      .mockResolvedValueOnce([0]);                 // item selection
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(p.multiselect).toHaveBeenCalledTimes(2);
  });

  it('auto-includes single item types without prompting', async () => {
    vi.mocked(p.text).mockResolvedValue('mypack');
    vi.mocked(p.multiselect).mockResolvedValueOnce([FileType.Vehicle]); // type selection
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    // multiselect called once (type selection only, not item selection)
    expect(p.multiselect).toHaveBeenCalledTimes(1);
    expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining('Auto-included'));
  });

  it('prompts for protection host and gameDir when confirmed', async () => {
    vi.mocked(p.text)
      .mockResolvedValueOnce('mypack')       // pack name
      .mockResolvedValueOnce('myserver.com') // host
      .mockResolvedValueOnce('C:\\Games');    // gameDir
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(p.text).toHaveBeenCalledTimes(3);
  });

  it('does not prompt for host/gameDir when protection declined', async () => {
    vi.mocked(p.text).mockResolvedValueOnce('mypack');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(p.text).toHaveBeenCalledTimes(1); // only pack name
  });

  it('calls generatePack during generation', async () => {
    vi.mocked(p.text).mockResolvedValueOnce('mypack');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.isCancel).mockReturnValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(generatePack).toHaveBeenCalled();
  });

  it('handles generation errors gracefully', async () => {
    const mockSpinner = { start: vi.fn(), stop: vi.fn(), message: vi.fn() };
    vi.mocked(p.spinner).mockReturnValue(mockSpinner);
    vi.mocked(p.text).mockResolvedValueOnce('mypack');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm).mockResolvedValue(false);
    vi.mocked(p.isCancel).mockReturnValue(false);
    vi.mocked(generatePack).mockRejectedValueOnce(new Error('Generation failed'));

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(mockSpinner.stop).toHaveBeenCalledWith('Pack generation failed.');
    expect(p.log.error).toHaveBeenCalled();
  });

  // Back navigation tests

  it('goes back to pack name when type selection is cancelled', async () => {
    const cancelSymbol = Symbol('cancel');
    let textCallCount = 0;
    vi.mocked(p.text).mockImplementation(async () => {
      textCallCount++;
      return textCallCount <= 2 ? 'mypack' : cancelSymbol as unknown as string;
    });
    vi.mocked(p.isCancel).mockImplementation((value) => typeof value === 'symbol');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce(cancelSymbol as never)  // cancel type selection → back to pack name
      .mockResolvedValueOnce([FileType.Vehicle])      // re-do type selection
      .mockResolvedValueOnce([0]);                    // item selection
    vi.mocked(p.confirm).mockResolvedValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    // text called twice: initial pack name + re-prompted pack name after going back
    expect(p.text).toHaveBeenCalledTimes(2);
    expect(generatePack).toHaveBeenCalled();
  });

  it('goes back to type selection when item selection is cancelled', async () => {
    const cancelSymbol = Symbol('cancel');
    vi.mocked(p.text).mockResolvedValue('mypack');
    vi.mocked(p.isCancel).mockImplementation((value) => typeof value === 'symbol');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])      // type selection
      .mockResolvedValueOnce(cancelSymbol as never)   // cancel item selection → back to type
      .mockResolvedValueOnce([FileType.Vehicle])      // re-do type selection
      .mockResolvedValueOnce([0]);                    // item selection
    vi.mocked(p.confirm).mockResolvedValue(false);

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    // multiselect called 4 times: type, cancel item, re-type, item
    expect(p.multiselect).toHaveBeenCalledTimes(4);
    expect(generatePack).toHaveBeenCalled();
  });

  it('goes back to type selection when protection confirm is cancelled', async () => {
    const cancelSymbol = Symbol('cancel');
    vi.mocked(p.text).mockResolvedValue('mypack');
    vi.mocked(p.isCancel).mockImplementation((value) => typeof value === 'symbol');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])      // type selection
      .mockResolvedValueOnce([0])                     // item selection
      .mockResolvedValueOnce([FileType.Vehicle])      // re-do type selection after back
      .mockResolvedValueOnce([0]);                    // re-do item selection
    vi.mocked(p.confirm)
      .mockResolvedValueOnce(cancelSymbol as never)   // cancel protection → back to type
      .mockResolvedValueOnce(false);                  // decline protection on second pass

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(p.multiselect).toHaveBeenCalledTimes(4);
    expect(generatePack).toHaveBeenCalled();
  });

  it('goes back to protection confirm when hostname is cancelled', async () => {
    const cancelSymbol = Symbol('cancel');
    let textCallCount = 0;
    vi.mocked(p.text).mockImplementation(async () => {
      textCallCount++;
      if (textCallCount === 1) return 'mypack';           // pack name
      if (textCallCount === 2) return cancelSymbol as never; // cancel hostname → back to protection
      if (textCallCount === 3) return 'myserver.com';      // hostname on retry
      return 'C:\\Games';                                  // gameDir
    });
    vi.mocked(p.isCancel).mockImplementation((value) => typeof value === 'symbol');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm)
      .mockResolvedValueOnce(true)   // want protection
      .mockResolvedValueOnce(true);  // want protection again after going back

    const { fs, logger, archiveService, protectService } = makeMockServices();
    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(p.confirm).toHaveBeenCalledTimes(2);
    expect(generatePack).toHaveBeenCalled();
  });

  // Protection retry tests

  it('retries protection when it fails and user selects retry', async () => {
    vi.mocked(p.text)
      .mockResolvedValueOnce('mypack')
      .mockResolvedValueOnce('myserver.com')
      .mockResolvedValueOnce('C:\\Games');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);
    vi.mocked(p.select).mockResolvedValueOnce('retry'); // retry after failure

    const { fs, logger, archiveService, protectService } = makeMockServices();
    protectService.protectPack
      .mockResolvedValueOnce(null)                     // first attempt fails
      .mockResolvedValueOnce('https://dl.example.com'); // retry succeeds

    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(protectService.protectPack).toHaveBeenCalledTimes(2);
  });

  it('allows modifying hostname when protection fails', async () => {
    vi.mocked(p.text)
      .mockResolvedValueOnce('mypack')          // pack name
      .mockResolvedValueOnce('bad-host.com')     // initial hostname
      .mockResolvedValueOnce('C:\\Games')         // gameDir
      .mockResolvedValueOnce('good-host.com');   // modified hostname
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);
    vi.mocked(p.select).mockResolvedValueOnce('modify'); // modify hostname

    const { fs, logger, archiveService, protectService } = makeMockServices();
    protectService.protectPack
      .mockResolvedValueOnce(null)                     // first attempt fails
      .mockResolvedValueOnce('https://dl.example.com'); // succeeds with new host

    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(protectService.protectPack).toHaveBeenCalledTimes(2);
    expect(protectService.protectPack).toHaveBeenLastCalledWith(
      expect.any(String), 'good-host.com', 'C:\\Games', expect.any(String)
    );
  });

  it('skips protection when user selects skip after failure', async () => {
    vi.mocked(p.text)
      .mockResolvedValueOnce('mypack')
      .mockResolvedValueOnce('myserver.com')
      .mockResolvedValueOnce('C:\\Games');
    vi.mocked(p.multiselect)
      .mockResolvedValueOnce([FileType.Vehicle])
      .mockResolvedValueOnce([0]);
    vi.mocked(p.confirm).mockResolvedValue(true);
    vi.mocked(p.isCancel).mockReturnValue(false);
    vi.mocked(p.select).mockResolvedValueOnce('skip'); // skip after failure

    const { fs, logger, archiveService, protectService } = makeMockServices();
    protectService.protectPack.mockResolvedValueOnce(null); // fails

    const files = createEmptyParsedFiles();
    (files[FileType.Vehicle] as DynamxFile[]).push(makeVehicle('sedan'), makeVehicle('truck'));

    await packWizard(files, '/test', fs, archiveService, protectService, logger);
    expect(protectService.protectPack).toHaveBeenCalledTimes(1);
    expect(p.log.info).toHaveBeenCalledWith(expect.stringContaining('Protection skipped'));
  });
});
