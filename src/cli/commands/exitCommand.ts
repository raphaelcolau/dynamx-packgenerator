import { Command } from './command';

export class ExitCommand implements Command {
  readonly name = '/exit';
  readonly description = 'Exit the application';
  execute(): void { process.exit(0); }
}
