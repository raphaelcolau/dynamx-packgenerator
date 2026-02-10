import path from 'path';
import { FileType, TYPES_WITH_DYNX_DEPENDENCIES } from '../../constants/fileTypes';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { Logger } from '../../cli/output/logger';
import { DynamxFile, ParsedFiles, createEmptyParsedFiles } from '../../types';
import { detectFileType } from './fileTypeDetector';
import { parseDynxDependencies } from '../parser/dynxParser';
import { parseSoundDependencies, resolveAllObjFiles } from './dependencyParser';
import { logParsedFileSummary } from './detectorDisplay';

export async function detect(
  directory: string, fs: FileSystemPort, logger: Logger
): Promise<ParsedFiles> {
  const packsDir = path.join(directory, 'Packs');
  if (!fs.existsSync(packsDir)) {
    fs.mkdirSync(packsDir, { recursive: true });
    logger.info('Packs folder created. Put your packs in there.');
    return createEmptyParsedFiles();
  }

  const [objFiles, dynxFilePaths] = await Promise.all([
    resolveAllObjFiles(packsDir, fs, logger),
    fs.glob('**/*.dynx', { cwd: packsDir }),
  ]);

  const parsedFiles = createEmptyParsedFiles(objFiles);
  if (!dynxFilePaths || dynxFilePaths.length === 0) {
    logger.info('No files found.');
    return parsedFiles;
  }

  for (const filePath of dynxFilePaths) {
    const type = detectFileType(filePath);
    const content = await fs.readFile(path.join(packsDir, filePath));
    const normalizedDir = filePath.replaceAll('\\', '/');
    const lastSep = Math.max(filePath.lastIndexOf('\\'), filePath.lastIndexOf('/'));
    const lastDot = filePath.lastIndexOf('.dynx');
    const name = filePath.substring(lastSep + 1, lastDot);
    const dynxFile: DynamxFile = { type, name, dir: normalizedDir, content, dependencies: [] };
    (parsedFiles[type] as DynamxFile[]).push(dynxFile);
  }

  for (const type of TYPES_WITH_DYNX_DEPENDENCIES) {
    for (const file of parsedFiles[type] as DynamxFile[]) {
      file.dependencies = parseDynxDependencies(file.content);
    }
  }

  for (const file of parsedFiles[FileType.Sounds] as DynamxFile[]) {
    (file as DynamxFile).dependencies = await parseSoundDependencies(file, packsDir, fs, logger) as unknown as string[];
  }

  parsedFiles.total = computeTotal(parsedFiles);
  logParsedFileSummary(parsedFiles, logger);
  return parsedFiles;
}

function computeTotal(parsedFiles: ParsedFiles): number {
  let total = 0;
  for (const key of Object.values(FileType)) {
    const arr = parsedFiles[key];
    if (arr) total += (arr as unknown[]).length;
  }
  return total;
}
