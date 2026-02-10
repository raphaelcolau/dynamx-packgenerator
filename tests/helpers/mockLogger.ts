import { Logger } from '../../src/cli/output/logger';

export class MockLogger implements Logger {
  public messages: { level: string; message: string }[] = [];
  info(message: string): void { this.messages.push({ level: 'info', message }); }
  success(message: string): void { this.messages.push({ level: 'success', message }); }
  warn(message: string): void { this.messages.push({ level: 'warn', message }); }
  error(message: string): void { this.messages.push({ level: 'error', message }); }
  raw(message: string): void { this.messages.push({ level: 'raw', message }); }
  prompt(message: string): void { this.messages.push({ level: 'prompt', message }); }
  hasMessage(substring: string): boolean { return this.messages.some(m => m.message.includes(substring)); }
  getErrors(): string[] { return this.messages.filter(m => m.level === 'error').map(m => m.message); }
  clear(): void { this.messages = []; }
}
