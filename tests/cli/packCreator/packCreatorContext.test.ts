import { vi } from 'vitest';
import { PackCreatorContext } from '../../../src/cli/packCreator/packCreatorContext';
import { PackCreatorState } from '../../../src/cli/packCreator/states/state';
import { PackBuilder } from '../../../src/core/pack/packBuilder';
import { createEmptyParsedFiles } from '../../../src/types';
import { MockLogger } from '../../helpers/mockLogger';
import { MockFileSystem } from '../../helpers/mockFileSystem';
import { ArchiveServicePort } from '../../../src/infrastructure/archive/archiveService';
import { ProtectServicePort } from '../../../src/infrastructure/http/protectService';

function createMockState(name: string): PackCreatorState {
  return {
    name,
    enter: vi.fn(),
    handleInput: vi.fn(),
  };
}

function createMockArchiveService(): ArchiveServicePort {
  return { createZip: vi.fn() };
}

function createMockProtectService(): ProtectServicePort {
  return { protectPack: vi.fn() };
}

describe('PackCreatorContext', () => {
  let logger: MockLogger;
  let fs: MockFileSystem;
  let archiveService: ArchiveServicePort;
  let protectService: ProtectServicePort;

  beforeEach(() => {
    logger = new MockLogger();
    fs = new MockFileSystem();
    archiveService = createMockArchiveService();
    protectService = createMockProtectService();
  });

  it('should call initialState.enter() during construction', () => {
    const state = createMockState('init');
    new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );
    expect(state.enter).toHaveBeenCalledTimes(1);
  });

  it('should transition to a new state and call enter on it', () => {
    const initial = createMockState('initial');
    const next = createMockState('next');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, initial
    );

    ctx.transitionTo(next);
    expect(next.enter).toHaveBeenCalledTimes(1);
    expect(next.enter).toHaveBeenCalledWith(ctx);
  });

  it('should delegate handleInput to the current state', async () => {
    const state = createMockState('main');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );

    await ctx.handleInput('some input');
    expect(state.handleInput).toHaveBeenCalledWith(ctx, 'some input');
  });

  it('should set active to false when /exit is entered', async () => {
    const state = createMockState('main');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );

    await ctx.handleInput('/exit');
    expect(ctx.active).toBe(false);
  });

  it('should handle /EXIT case-insensitively', async () => {
    const state = createMockState('main');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );

    await ctx.handleInput('/EXIT');
    expect(ctx.active).toBe(false);
  });

  it('should return the current state name via getCurrentStateName', () => {
    const state = createMockState('myState');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );

    expect(ctx.getCurrentStateName()).toBe('myState');
  });

  it('should initialize builder as a PackBuilder instance', () => {
    const state = createMockState('init');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );

    expect(ctx.builder).toBeInstanceOf(PackBuilder);
  });

  it('should start with active set to true', () => {
    const state = createMockState('init');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );

    expect(ctx.active).toBe(true);
  });

  it('should update getCurrentStateName after transitionTo', () => {
    const initial = createMockState('first');
    const second = createMockState('second');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, initial
    );

    expect(ctx.getCurrentStateName()).toBe('first');
    ctx.transitionTo(second);
    expect(ctx.getCurrentStateName()).toBe('second');
  });

  it('should not delegate to state handleInput when /exit is entered', async () => {
    const state = createMockState('main');
    const ctx = new PackCreatorContext(
      createEmptyParsedFiles(), '/dir', logger, fs, archiveService, protectService, state
    );

    await ctx.handleInput('/exit');
    expect(state.handleInput).not.toHaveBeenCalled();
  });
});
