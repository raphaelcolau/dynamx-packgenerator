import chalk from 'chalk';
import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { GenerateState } from './generateState';

export class GameDirState implements PackCreatorState {
  readonly name = 'gameDir';
  enter(context: PackCreatorContext): void { context.logger.success('Type the game root folder.'); }
  handleInput(context: PackCreatorContext, input: string): void {
    const dir = input.trim();
    context.builder.setGameDir(dir);
    context.logger.raw(`Game root folder set to ${chalk.yellow(dir)}`);
    context.transitionTo(new GenerateState());
  }
}
