import { PackCreatorState } from './states/state';
import { PackBuilder } from '../../core/pack/packBuilder';
import { ParsedFiles } from '../../types';
import { Logger } from '../output/logger';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { ArchiveServicePort } from '../../infrastructure/archive/archiveService';
import { ProtectServicePort } from '../../infrastructure/http/protectService';

export class PackCreatorContext {
  private currentState: PackCreatorState;
  public readonly builder: PackBuilder;
  public active: boolean = true;

  constructor(
    public readonly files: ParsedFiles,
    public readonly directory: string,
    public readonly logger: Logger,
    public readonly fs: FileSystemPort,
    public readonly archiveService: ArchiveServicePort,
    public readonly protectService: ProtectServicePort,
    initialState: PackCreatorState
  ) {
    this.builder = new PackBuilder();
    this.currentState = initialState;
    this.currentState.enter(this);
  }

  transitionTo(state: PackCreatorState): void {
    this.currentState = state;
    this.currentState.enter(this);
  }

  async handleInput(input: string): Promise<void> {
    if (input.toLowerCase() === '/exit') { this.active = false; this.logger.info('Exiting creator mode.'); return; }
    await this.currentState.handleInput(this, input);
  }

  getCurrentStateName(): string { return this.currentState.name; }
}
