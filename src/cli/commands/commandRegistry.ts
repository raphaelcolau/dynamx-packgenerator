import { Command } from './command';

export class CommandRegistry {
  private commands = new Map<string, Command>();

  register(command: Command): void { this.commands.set(command.name, command); }
  get(name: string): Command | undefined { return this.commands.get(name); }

  findCommand(input: string): { command: Command; args: string } | undefined {
    const exact = this.commands.get(input);
    if (exact) return { command: exact, args: '' };
    for (const [name, command] of this.commands) {
      if (input.startsWith(name + ' ')) return { command, args: input.slice(name.length + 1).trim() };
    }
    return undefined;
  }

  getAll(): Command[] { return Array.from(this.commands.values()); }
}
