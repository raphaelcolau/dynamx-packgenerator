export interface GlobOptions {
  cwd?: string;
}

export interface FileSystemPort {
  readFile(filePath: string, encoding?: BufferEncoding): Promise<string>;
  readFileBuffer(filePath: string): Promise<Buffer>;
  writeFile(filePath: string, content: string | Buffer): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  existsSync(filePath: string): boolean;
  mkdir(dirPath: string, options?: { recursive?: boolean }): Promise<void>;
  mkdirSync(dirPath: string, options?: { recursive?: boolean }): void;
  readdir(dirPath: string): Promise<string[]>;
  statSync(filePath: string): { isDirectory(): boolean };
  glob(pattern: string, options?: GlobOptions): Promise<string[]>;
  rm(dirPath: string, options?: { recursive?: boolean; force?: boolean }): Promise<void>;
  createReadStream(filePath: string): NodeJS.ReadableStream;
  createWriteStream(filePath: string): NodeJS.WritableStream;
}
