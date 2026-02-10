import { PackCreatorState } from './state';
import { PackCreatorContext } from '../packCreatorContext';
import { SelectionState } from './selectionState';
import { DynamxFile } from '../../../types';
import { FileType } from '../../../constants/fileTypes';

export class ItemPickState implements PackCreatorState {
  readonly name = 'itemPick';
  constructor(private readonly fileType: FileType, private readonly label: string) {}
  enter(context: PackCreatorContext): void {
    context.logger.raw(`\nType the number of the ${this.label.toLowerCase()} you want to add.`);
    context.logger.raw('Separate numbers with spaces or commas to add multiple items.');
    context.logger.raw('Press enter to go back.');
  }
  handleInput(context: PackCreatorContext, input: string): void {
    const command = input.trim();
    if (command === '') { context.transitionTo(new SelectionState()); return; }
    const indices = command.split(/[\s,]+/).map(s => parseInt(s, 10)).filter(n => !isNaN(n));
    const fileList = context.files[this.fileType] as DynamxFile[];
    for (const idx of indices) {
      if (idx >= 0 && idx < fileList.length) context.builder.addElement(fileList[idx]);
    }
    context.transitionTo(new SelectionState());
  }
}
