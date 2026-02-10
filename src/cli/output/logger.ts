import chalk from 'chalk';

export interface Logger {
  info(message: string): void;
  success(message: string): void;
  warn(message: string): void;
  error(message: string): void;
  raw(message: string): void;
  prompt(message: string): void;
}

export class ConsoleLogger implements Logger {
  info(message: string): void { console.log(message); }
  success(message: string): void { console.log(chalk.green(message)); }
  warn(message: string): void { console.log(chalk.yellow(message)); }
  error(message: string): void { console.log(chalk.red('[ERROR] ') + message); }
  raw(message: string): void { console.log(message); }
  prompt(message: string): void { process.stdout.write(message); }
}
