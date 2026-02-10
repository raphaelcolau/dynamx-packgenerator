import { describe, it, expect, vi } from 'vitest';
import { HelpCommand } from '../../../src/cli/commands/helpCommand';
import { ListCommand } from '../../../src/cli/commands/listCommand';
import { ClearCommand } from '../../../src/cli/commands/clearCommand';
import { ExitCommand } from '../../../src/cli/commands/exitCommand';
import { CommandRegistry } from '../../../src/cli/commands/commandRegistry';
import { MockLogger } from '../../helpers/mockLogger';
import { MockFileSystem } from '../../helpers/mockFileSystem';
import { createEmptyParsedFiles } from '../../../src/types';
import { FileType } from '../../../src/constants/fileTypes';
import { DynamxFile } from '../../../src/types';

describe('HelpCommand', () => {
  it('has correct name', () => {
    const logger = new MockLogger();
    const registry = new CommandRegistry();
    const cmd = new HelpCommand(logger, registry);
    expect(cmd.name).toBe('/help');
  });

  it('lists all registered commands', () => {
    const logger = new MockLogger();
    const registry = new CommandRegistry();
    const cmd = new HelpCommand(logger, registry);
    registry.register(cmd);
    cmd.execute();
    expect(logger.messages.length).toBeGreaterThan(0);
    expect(logger.hasMessage('/help')).toBe(true);
  });
});

describe('ListCommand', () => {
  it('has correct name', () => {
    const logger = new MockLogger();
    const files = createEmptyParsedFiles();
    const cmd = new ListCommand(logger, () => files);
    expect(cmd.name).toBe('/list');
  });

  it('shows usage when no args given', () => {
    const logger = new MockLogger();
    const files = createEmptyParsedFiles();
    const cmd = new ListCommand(logger, () => files);
    cmd.execute();
    expect(logger.messages.length).toBeGreaterThan(0);
  });

  it('shows error for invalid type', () => {
    const logger = new MockLogger();
    const files = createEmptyParsedFiles();
    const cmd = new ListCommand(logger, () => files);
    cmd.execute('nonexistent');
    expect(logger.getErrors().length).toBeGreaterThan(0);
  });

  it('lists files of a valid type', () => {
    const logger = new MockLogger();
    const files = createEmptyParsedFiles();
    const vehicle: DynamxFile = { type: FileType.Vehicle, name: 'sedan', dir: 'pack/vehicle_sedan.dynx', content: '', dependencies: [] };
    (files[FileType.Vehicle] as DynamxFile[]).push(vehicle);
    const cmd = new ListCommand(logger, () => files);
    cmd.execute('vehicle');
    expect(logger.hasMessage('sedan')).toBe(true);
  });

  it('shows error when files not loaded', () => {
    const logger = new MockLogger();
    const cmd = new ListCommand(logger, () => undefined as any);
    cmd.execute();
    expect(logger.getErrors().length).toBeGreaterThan(0);
  });
});

describe('ClearCommand', () => {
  it('has correct name', () => {
    const logger = new MockLogger();
    const fs = new MockFileSystem();
    const cmd = new ClearCommand(logger, fs, () => '/test');
    expect(cmd.name).toBe('/clear');
  });

  it('clears build folder when it exists', async () => {
    const logger = new MockLogger();
    const fs = new MockFileSystem();
    fs.addDirectory('/test/builds');
    const cmd = new ClearCommand(logger, fs, () => '/test');
    await cmd.execute();
    expect(logger.hasMessage('cleared')).toBe(true);
  });
});

describe('ExitCommand', () => {
  it('has correct name', () => {
    const cmd = new ExitCommand();
    expect(cmd.name).toBe('/exit');
  });

  it('calls process.exit', () => {
    const cmd = new ExitCommand();
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    cmd.execute();
    expect(mockExit).toHaveBeenCalledWith(0);
    mockExit.mockRestore();
  });
});
