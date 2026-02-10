import chalk from 'chalk';
import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { NameState } from './nameState';

export class InitState implements PackCreatorState {
  readonly name = 'init';
  enter(context: PackCreatorContext): void {
    context.logger.success('Creator mode activated. Type /exit to exit creator mode.');
    context.logger.raw(`Your pack id is: ${chalk.yellow(context.builder.getPackId())}`);
    context.logger.raw('Press enter to continue. Type your pack name to change it.');
  }
  handleInput(context: PackCreatorContext, _input: string): void {
    context.transitionTo(new NameState());
  }
}
