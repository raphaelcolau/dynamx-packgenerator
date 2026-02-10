import archiver from 'archiver';
import { FileSystemPort } from '../filesystem/fileSystemPort';

export interface ArchiveServicePort {
  createZip(sourceDir: string, outputPath: string): Promise<void>;
}

export class ArchiverService implements ArchiveServicePort {
  constructor(private readonly fs: FileSystemPort) {}

  async createZip(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const output = this.fs.createWriteStream(outputPath);
      const archive = archiver('zip', { zlib: { level: 1 } });
      output.on('close', () => resolve());
      output.on('error', (err: Error) => reject(err));
      archive.on('error', (err: Error) => reject(err));
      archive.pipe(output as NodeJS.WritableStream);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}
