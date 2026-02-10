import chalk from 'chalk';
import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { ProtectionState } from './protectionState';
import { ItemPickState } from './itemPickState';
import { SELECTABLE_TYPES } from '../../../constants/fileTypes';
import { DynamxFile } from '../../../types';

export class SelectionState implements PackCreatorState {
  readonly name = 'selection';
  enter(context: PackCreatorContext): void {
    context.logger.raw('Type the number to add an element to your pack.');
    for (let i = 0; i < SELECTABLE_TYPES.length; i++) {
      const [, label] = SELECTABLE_TYPES[i];
      context.logger.raw(`${chalk.yellow(String(i + 1))} - ${label}`);
    }
    context.logger.raw(`${chalk.yellow('ok')} - Finish pack creation`);
  }
  handleInput(context: PackCreatorContext, input: string): void {
    const command = input.trim().toLowerCase();
    if (command === '') { this.enter(context); return; }
    if (command === 'ok') {
      if (context.builder.getElementCount() === 0) {
        context.logger.error('You must add at least one element to your pack.'); return;
      }
      context.logger.success(`You have a pack with ${context.builder.getElementCount()} elements.`);
      context.transitionTo(new ProtectionState()); return;
    }
    const index = parseInt(command, 10);
    if (isNaN(index) || index < 1 || index > SELECTABLE_TYPES.length) {
      context.logger.raw('Invalid selection.'); return;
    }
    const [fileType, label] = SELECTABLE_TYPES[index - 1];
    const fileList = context.files[fileType] as DynamxFile[];
    context.logger.success(`${label} selected.`);
    fileList.forEach((file, n) => {
      const displayName = file.dir.split('/').pop()?.replace(`${fileType}_`, '').replace('.dynx', '') ?? '';
      context.logger.raw(`${chalk.yellow(String(n))} - ${displayName}`);
    });
    context.transitionTo(new ItemPickState(fileType, label));
  }
}
