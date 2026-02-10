import { FileSystemPort, GlobOptions } from '../../src/infrastructure/filesystem/fileSystemPort';
import { Readable, Writable } from 'stream';

export class MockFileSystem implements FileSystemPort {
  private files = new Map<string, string | Buffer>();
  private dirs = new Set<string>();

  addFile(filePath: string, content: string | Buffer): void {
    const normalized = filePath.replaceAll('\\', '/');
    this.files.set(normalized, content);
    // Also add parent directory
    const lastSlash = normalized.lastIndexOf('/');
    if (lastSlash >= 0) this.dirs.add(normalized.substring(0, lastSlash));
  }

  addDirectory(dirPath: string): void { this.dirs.add(dirPath.replaceAll('\\', '/')); }

  async readFile(filePath: string): Promise<string> {
    const normalized = filePath.replaceAll('\\', '/');
    const content = this.files.get(normalized);
    if (content === undefined) throw new Error(`ENOENT: ${normalized}`);
    return typeof content === 'string' ? content : content.toString('utf8');
  }

  async readFileBuffer(filePath: string): Promise<Buffer> {
    const normalized = filePath.replaceAll('\\', '/');
    const content = this.files.get(normalized);
    if (content === undefined) throw new Error(`ENOENT: ${normalized}`);
    return typeof content === 'string' ? Buffer.from(content) : content;
  }

  async writeFile(filePath: string, content: string | Buffer): Promise<void> {
    this.files.set(filePath.replaceAll('\\', '/'), content);
  }

  async exists(filePath: string): Promise<boolean> {
    const n = filePath.replaceAll('\\', '/');
    return this.files.has(n) || this.dirs.has(n);
  }

  existsSync(filePath: string): boolean {
    const n = filePath.replaceAll('\\', '/');
    return this.files.has(n) || this.dirs.has(n);
  }

  async mkdir(_dirPath: string): Promise<void> {
    this.dirs.add(_dirPath.replaceAll('\\', '/'));
  }

  mkdirSync(dirPath: string): void { this.dirs.add(dirPath.replaceAll('\\', '/')); }

  async readdir(dirPath: string): Promise<string[]> {
    const normalized = dirPath.replaceAll('\\', '/').replace(/\/$/, '');
    const results: string[] = [];
    for (const [key] of this.files) {
      if (key.startsWith(normalized + '/')) {
        const rest = key.slice(normalized.length + 1);
        const segment = rest.split('/')[0];
        if (segment && !results.includes(segment)) results.push(segment);
      }
    }
    for (const dir of this.dirs) {
      if (dir.startsWith(normalized + '/')) {
        const rest = dir.slice(normalized.length + 1);
        const segment = rest.split('/')[0];
        if (segment && !results.includes(segment)) results.push(segment);
      }
    }
    return results;
  }

  statSync(filePath: string): { isDirectory(): boolean } {
    const n = filePath.replaceAll('\\', '/');
    return { isDirectory: () => this.dirs.has(n) };
  }

  async glob(pattern: string, options?: GlobOptions): Promise<string[]> {
    const cwd = (options?.cwd ?? '').replaceAll('\\', '/').replace(/\/$/, '');
    const results: string[] = [];
    const ext = pattern.replace('**/*', '').replace('*', '');
    for (const [key] of this.files) {
      if (cwd && !key.startsWith(cwd + '/')) continue;
      const relativePath = cwd ? key.slice(cwd.length + 1) : key;
      if (ext && relativePath.endsWith(ext)) results.push(relativePath);
      else if (!ext) results.push(relativePath);
    }
    return results;
  }

  async rm(): Promise<void> { /* no-op in mock */ }

  createReadStream(filePath: string): NodeJS.ReadableStream {
    const content = this.files.get(filePath.replaceAll('\\', '/'));
    const stream = new Readable();
    stream.push(content ?? null);
    stream.push(null);
    return stream;
  }

  createWriteStream(_filePath: string): NodeJS.WritableStream {
    return new Writable({ write(_chunk, _enc, cb) { cb(); } });
  }
}
