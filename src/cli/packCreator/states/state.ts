import { PackCreatorContext } from '../packCreatorContext';

export interface PackCreatorState {
  readonly name: string;
  enter(context: PackCreatorContext): void;
  handleInput(context: PackCreatorContext, input: string): void | Promise<void>;
}
