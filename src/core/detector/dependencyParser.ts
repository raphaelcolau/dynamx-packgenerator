import path from 'path';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { Logger } from '../../cli/output/logger';
import { Dependency, ObjFile, DynamxFile } from '../../types';

export async function parseSoundDependencies(
  file: DynamxFile, packsDir: string, fs: FileSystemPort, logger: Logger
): Promise<Dependency[]> {
  const dependencies: Dependency[] = [];
  const lines = file.content.split('\n');
  const pathParts = file.dir.split('/');
  const pack = pathParts.length > 0 ? pathParts[0] : '';

  for (const line of lines) {
    if (line.includes('Sound:')) {
      const parts = line.trim().split(' ');
      if (parts.length > 1) {
        const soundName = parts[1].replace(/[\n\r]/g, '').trim();
        if (soundName) {
          const soundFile = soundName + '.ogg';
          const soundRelPath = `${pack}/assets/dynamxmod/sounds/${soundFile}`;
          if (dependencies.some(d => d.file === soundRelPath)) continue;
          try {
            const content = await fs.readFileBuffer(path.join(packsDir, pack, 'assets/dynamxmod/sounds', soundFile));
            dependencies.push({ file: soundRelPath, content, type: 'audio' });
          } catch (err: unknown) {
            const error = err as NodeJS.ErrnoException;
            logger.error(`${error.code ?? 'ERROR'}: ${error.message}`);
          }
        }
      }
    }
  }
  return dependencies;
}

const INLINE_SOUND_PATTERNS = ['HornSound:', 'SirenSound:'] as const;

export async function parseInlineSoundDependencies(
  file: DynamxFile, packsDir: string, fs: FileSystemPort, logger: Logger
): Promise<Dependency[]> {
  const dependencies: Dependency[] = [];
  const lines = file.content.split('\n');
  const pack = file.dir.split('/')[0] ?? '';

  for (const line of lines) {
    const trimmed = line.trim();
    for (const pattern of INLINE_SOUND_PATTERNS) {
      if (trimmed.startsWith(pattern)) {
        const soundPath = trimmed.slice(pattern.length).trim().replace(/[\n\r]/g, '');
        if (!soundPath) continue;
        const soundFile = soundPath + '.ogg';
        const soundRelPath = `${pack}/assets/dynamxmod/sounds/${soundFile}`;
        if (dependencies.some(d => d.file === soundRelPath)) continue;
        try {
          const content = await fs.readFileBuffer(path.join(packsDir, pack, 'assets/dynamxmod/sounds', soundFile));
          dependencies.push({ file: soundRelPath, content, type: 'audio' });
        } catch (err: unknown) {
          const error = err as NodeJS.ErrnoException;
          logger.error(`${error.code ?? 'ERROR'}: ${error.message}`);
        }
      }
    }
  }
  return dependencies;
}

export async function resolveAllObjFiles(
  packsDir: string, fs: FileSystemPort, logger: Logger
): Promise<ObjFile[]> {
  const files = await fs.glob('**/*.obj', { cwd: packsDir });
  const results: ObjFile[] = [];
  for (const file of files) {
    const content = await fs.readFile(path.join(packsDir, file));
    const dependencies = await resolveObjDependencies(file, packsDir, fs, logger);
    results.push({ file: file.replaceAll('\\', '/'), dependencies, content });
  }
  return results;
}

async function resolveObjDependencies(
  objPath: string, packsDir: string, fs: FileSystemPort, logger: Logger
): Promise<Dependency[]> {
  const dependencies: Dependency[] = [];
  const content = await fs.readFile(path.join(packsDir, objPath));
  const lines = content.split('\n');
  const dir = objPath.substring(0, objPath.lastIndexOf('\\')).replaceAll('\\', '/');
  const dirPrefix = dir ? dir + '/' : '';

  for (const line of lines) {
    if (line.includes('mtllib')) {
      const mtl = line.replace('mtllib', '').replaceAll(' ', '').replace(/[\n\r]/g, '');
      if (mtl.length >= 256) { logger.info('mtl file name is too long. Skipping.'); continue; }
      try {
        const mtlContent = await fs.readFile(path.join(packsDir, dirPrefix, mtl));
        dependencies.push({ file: dirPrefix + mtl, content: mtlContent, type: 'text' });
        for (const mtlLine of mtlContent.split('\n')) {
          if (mtlLine.includes('map_Kd')) {
            const texture = mtlLine.split(' ')[1]?.replace(/[\n\r]/g, '');
            if (texture) {
              try {
                const texContent = await fs.readFileBuffer(path.join(packsDir, dirPrefix, texture));
                dependencies.push({ file: dirPrefix + texture, content: texContent, type: 'image' });
              } catch (err: unknown) {
                const error = err as NodeJS.ErrnoException;
                logger.error(`${error.code ?? 'ERROR'}:${error.message}`);
              }
            }
          }
        }
      } catch (err: unknown) {
        const error = err as NodeJS.ErrnoException;
        logger.error(`${error.code ?? 'ERROR'}: ${error.message}`);
      }
    }
  }
  if (dependencies.length === 0) logger.info('No dependencies found.');
  const collisionFiles = await resolveCollisionFiles(dirPrefix, packsDir, fs);
  return [...dependencies, ...collisionFiles];
}

async function resolveCollisionFiles(dir: string, packsDir: string, fs: FileSystemPort): Promise<Dependency[]> {
  const dcFiles = await fs.glob('*.dc', { cwd: path.join(packsDir, dir) });
  const results: Dependency[] = [];
  for (const file of dcFiles) {
    const content = await fs.readFile(path.join(packsDir, dir, file));
    results.push({ file: dir + file, content, type: 'text' });
  }
  return results;
}
