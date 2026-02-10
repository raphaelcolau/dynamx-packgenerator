import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { generatePack } from '../../../core/pack/packGenerator';

export class GenerateState implements PackCreatorState {
  readonly name = 'generate';
  enter(context: PackCreatorContext): void {
    const pack = context.builder.build();
    if (!pack.isProtected) context.logger.raw('Your pack will be generated without protection.');
    generatePack(context.files, pack, context.directory, context.fs, context.archiveService, context.protectService, context.logger)
      .then(() => { context.active = false; })
      .catch((err) => { context.logger.error(`Pack generation failed: ${String(err)}`); context.active = false; });
  }
  handleInput(_context: PackCreatorContext, _input: string): void {}
}
