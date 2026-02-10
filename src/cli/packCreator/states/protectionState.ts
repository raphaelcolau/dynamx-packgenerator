import chalk from 'chalk';
import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { HostState } from './hostState';
import { GenerateState } from './generateState';

export class ProtectionState implements PackCreatorState {
  readonly name = 'protection';
  enter(context: PackCreatorContext): void {
    context.logger.raw(`Do you want to have your pack protected? ${chalk.yellow('(y/n)')}`);
  }
  handleInput(context: PackCreatorContext, input: string): void {
    const command = input.trim().toLowerCase();
    if (command === 'yes' || command === 'y') { context.builder.setProtected(true); context.transitionTo(new HostState()); }
    else if (command === 'no' || command === 'n') { context.builder.setProtected(false); context.transitionTo(new GenerateState()); }
    else { this.enter(context); }
  }
}
