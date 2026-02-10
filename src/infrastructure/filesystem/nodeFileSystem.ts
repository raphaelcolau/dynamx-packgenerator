import fs from 'fs';
import { glob as globLib } from 'glob';
import { FileSystemPort, GlobOptions } from './fileSystemPort';

export class NodeFileSystem implements FileSystemPort {
  async readFile(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
    return fs.promises.readFile(filePath, { encoding });
  }

  async readFileBuffer(filePath: string): Promise<Buffer> {
    return fs.promises.readFile(filePath);
  }

  async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    await fs.promises.writeFile(filePath, content);
  }

  async exists(filePath: string): Promise<boolean> {
    try { await fs.promises.access(filePath); return true; } catch { return false; }
  }

  existsSync(filePath: string): boolean { return fs.existsSync(filePath); }

  async mkdir(dirPath: string, options?: { recursive?: boolean }): Promise<void> {
    await fs.promises.mkdir(dirPath, options);
  }

  mkdirSync(dirPath: string, options?: { recursive?: boolean }): void {
    fs.mkdirSync(dirPath, options);
  }

  async readdir(dirPath: string): Promise<string[]> { return fs.promises.readdir(dirPath); }

  statSync(filePath: string): { isDirectory(): boolean } { return fs.statSync(filePath); }

  async glob(pattern: string, options?: GlobOptions): Promise<string[]> {
    return globLib(pattern, options ?? {});
  }

  async rm(dirPath: string, options?: { recursive?: boolean; force?: boolean }): Promise<void> {
    await fs.promises.rm(dirPath, options);
  }

  createReadStream(filePath: string): NodeJS.ReadableStream { return fs.createReadStream(filePath); }
  createWriteStream(filePath: string): NodeJS.WritableStream { return fs.createWriteStream(filePath); }
}
