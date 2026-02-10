import chalk from 'chalk';
import { ParsedFiles } from '../types';
import { detect } from '../core/detector/detector';
import { CommandRegistry } from './commands/commandRegistry';
import { PackCreatorContext } from './packCreator/packCreatorContext';
import { InitState } from './packCreator/states/initState';
import { ConsoleLogger, Logger } from './output/logger';
import { FileSystemPort } from '../infrastructure/filesystem/fileSystemPort';
import { NodeFileSystem } from '../infrastructure/filesystem/nodeFileSystem';
import { ArchiverService } from '../infrastructure/archive/archiveService';
import { HttpProtectService } from '../infrastructure/http/protectService';
import { getAppDirectory } from '../infrastructure/filesystem/appDirectory';
import { HelpCommand } from './commands/helpCommand';
import { ListCommand } from './commands/listCommand';
import { ClearCommand } from './commands/clearCommand';
import { ExitCommand } from './commands/exitCommand';
import { PackHelpCommand } from './commands/packCommand';

export function stdinListener(): void {
  const logger: Logger = new ConsoleLogger();
  const fs: FileSystemPort = new NodeFileSystem();
  const archiveService = new ArchiverService(fs);
  const protectService = new HttpProtectService(fs, logger);

  let files: ParsedFiles | undefined;
  let directory: string = '';
  let creatorContext: PackCreatorContext | undefined;

  const registry = new CommandRegistry();
  registry.register(new HelpCommand(logger, registry));
  registry.register(new ListCommand(logger, () => files));
  registry.register(new ClearCommand(logger, fs, () => directory));
  registry.register(new ExitCommand());
  registry.register(new PackHelpCommand(logger));

  const processInput = async (input: string): Promise<void> => {
    const command = input.trim().toLowerCase();
    if (!files) {
      if (command === '' || command === 'l') {
        directory = command === 'l' ? './' : getAppDirectory(fs, logger);
        files = await detect(directory, fs, logger);
        logger.raw(`${chalk.green('/help')} to start\n`);
      }
      return;
    }
    if (creatorContext?.active) {
      await creatorContext.handleInput(input.trim());
      if (!creatorContext.active) creatorContext = undefined;
      return;
    }
    if (command.startsWith('/pack create')) {
      creatorContext = new PackCreatorContext(files, directory, logger, fs, archiveService, protectService, new InitState());
      return;
    }
    const match = registry.findCommand(command);
    if (match) { await match.command.execute(match.args || undefined); }
    else { logger.raw('Invalid command. Type /help to see available commands.'); }
  };

  logger.raw('\n\n');
  logger.raw(`Press ${chalk.green('ENTER')} to start with app folder as root directory.`);
  logger.raw(`Press ${chalk.green('L')} to start with local folder as root directory.`);

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', async (data: string) => {
    const input = data.trim();
    await processInput(input);
    logger.prompt('> ');
  });
  logger.prompt('> ');
}
