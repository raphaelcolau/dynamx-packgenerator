import chalk from 'chalk';
import { Command } from './command';
import { Logger } from '../output/logger';
import { CommandRegistry } from './commandRegistry';

export class HelpCommand implements Command {
  readonly name = '/help';
  readonly description = 'Show available commands';
  constructor(private readonly logger: Logger, private readonly registry: CommandRegistry) {}
  execute(): void {
    for (const cmd of this.registry.getAll()) {
      this.logger.raw(`${chalk.blue(cmd.name)} - ${cmd.description}`);
    }
  }
}
