import chalk from 'chalk';
import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { GameDirState } from './gameDirState';

export class HostState implements PackCreatorState {
  readonly name = 'host';
  enter(context: PackCreatorContext): void { context.logger.success('Type the host name (ex: myserver.com)'); }
  handleInput(context: PackCreatorContext, input: string): void {
    const host = input.trim();
    context.builder.setHost(host);
    context.logger.raw(`Host name set to ${chalk.yellow(host)}`);
    context.transitionTo(new GameDirState());
  }
}
