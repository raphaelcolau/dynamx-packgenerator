import chalk from 'chalk';
import { Command } from './command';
import { Logger } from '../output/logger';

export class PackHelpCommand implements Command {
  readonly name = '/pack';
  readonly description = 'Help for pack commands';
  constructor(private readonly logger: Logger) {}
  execute(): void { this.logger.raw(`${chalk.blue('/pack create')} - Create a new pack`); }
}
