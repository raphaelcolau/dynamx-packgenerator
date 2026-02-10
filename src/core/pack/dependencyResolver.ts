import path from 'path';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { Logger } from '../../cli/output/logger';
import { ParsedFiles, DynamxFile, ObjFile, Dependency } from '../../types';
import { FileType } from '../../constants/fileTypes';
import { detectDependencyType } from '../detector/fileTypeDetector';

export async function resolveDependency(
  files: ParsedFiles, dependency: string | Dependency, outputDir: string,
  fs: FileSystemPort, logger: Logger
): Promise<void> {
  const type = detectDependencyType(dependency);

  let dependencyFile: DynamxFile | ObjFile | Dependency | undefined;
  if (type === 'file') {
    dependencyFile = dependency as Dependency;
  } else if (typeof dependency === 'string') {
    const depFilename = type !== FileType.Obj ? dependency + '.dynx' : dependency;
    const fileList = files[type as FileType] as Array<DynamxFile | ObjFile>;
    dependencyFile = fileList?.find((f) => {
      const origin = 'file' in f ? (f as ObjFile).file : (f as DynamxFile).dir;
      return origin.endsWith(depFilename);
    });
  }

  if (!dependencyFile) {
    logger.error(`Dependency not found: ${String(dependency)}`);
    return;
  }

  const origin = 'file' in dependencyFile
    ? (dependencyFile as ObjFile | Dependency).file
    : (dependencyFile as DynamxFile).dir;
  const fileName = origin.split('/').pop() ?? '';
  const dir = origin.slice(0, origin.length - fileName.length);

  await fs.mkdir(path.join(outputDir, dir), { recursive: true });

  if (typeof dependency === 'object' && dependency !== null && (dependency as Dependency).type === 'image') {
    await fs.writeFile(path.join(outputDir, origin), (dependencyFile as Dependency).content);
    logger.success(`Created: ${path.join(outputDir, origin)}`);
  } else {
    const content = 'content' in dependencyFile ? dependencyFile.content : '';
    await fs.writeFile(path.join(outputDir, origin), content);
    logger.success(`Created: ${path.join(outputDir, origin)}`);

    if ('dependencies' in dependencyFile && Array.isArray(dependencyFile.dependencies)) {
      for (const subDep of dependencyFile.dependencies) {
        await resolveDependency(files, subDep as string | Dependency, outputDir, fs, logger);
      }
    }
  }
}
