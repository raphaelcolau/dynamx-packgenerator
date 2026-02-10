import { CommandRegistry } from '../../../src/cli/commands/commandRegistry';
import { Command } from '../../../src/cli/commands/command';

function createMockCommand(name: string, description = 'mock'): Command {
  return { name, description, execute: () => {} };
}

describe('CommandRegistry', () => {
  let registry: CommandRegistry;

  beforeEach(() => {
    registry = new CommandRegistry();
  });

  it('should register and retrieve a command by name', () => {
    const cmd = createMockCommand('help');
    registry.register(cmd);
    expect(registry.get('help')).toBe(cmd);
  });

  it('should return undefined for an unknown command name', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('should findCommand with exact match and empty args', () => {
    const cmd = createMockCommand('build');
    registry.register(cmd);

    const result = registry.findCommand('build');
    expect(result).toBeDefined();
    expect(result!.command).toBe(cmd);
    expect(result!.args).toBe('');
  });

  it('should findCommand with prefix match and extract args', () => {
    const cmd = createMockCommand('pack');
    registry.register(cmd);

    const result = registry.findCommand('pack myArg --flag');
    expect(result).toBeDefined();
    expect(result!.command).toBe(cmd);
    expect(result!.args).toBe('myArg --flag');
  });

  it('should return undefined from findCommand when no command matches', () => {
    registry.register(createMockCommand('build'));
    expect(registry.findCommand('unknown input')).toBeUndefined();
  });

  it('should return all registered commands via getAll', () => {
    const cmd1 = createMockCommand('alpha');
    const cmd2 = createMockCommand('beta');
    registry.register(cmd1);
    registry.register(cmd2);

    const all = registry.getAll();
    expect(all).toHaveLength(2);
    expect(all).toContain(cmd1);
    expect(all).toContain(cmd2);
  });
});
