import chalk from 'chalk';
import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { SelectionState } from './selectionState';

const PACK_NAME_REGEX = /^[a-zA-Z0-9]+$/;
const MAX_PACK_NAME_LENGTH = 10;

export class NameState implements PackCreatorState {
  readonly name = 'name';
  enter(_context: PackCreatorContext): void {}
  handleInput(context: PackCreatorContext, input: string): void {
    const command = input.trim();
    if (command === '') {
      context.logger.raw(`Pack name: ${context.builder.getPackId()}`);
    } else if (command.length > MAX_PACK_NAME_LENGTH) {
      context.logger.raw('Pack name too long. Max 10 characters.'); return;
    } else if (command.includes(' ')) {
      context.logger.raw('Pack name cannot contain spaces.'); return;
    } else if (!PACK_NAME_REGEX.test(command)) {
      context.logger.raw('Pack name must only contain letters and numbers.'); return;
    } else {
      context.logger.raw(`New pack name: ${chalk.green(command)}`);
      context.builder.setPackId(command);
    }
    context.transitionTo(new SelectionState());
  }
}
