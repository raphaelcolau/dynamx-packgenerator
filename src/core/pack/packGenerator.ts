import path from 'path';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { ArchiveServicePort } from '../../infrastructure/archive/archiveService';
import { Logger } from '../../cli/output/logger';
import { ParsedFiles, Pack } from '../../types';
import { resolveDependency } from './dependencyResolver';
import { generateLangFileContent } from './langFileGenerator';
import { resolvePackInfo } from './packInfoGenerator';
import { Dependency } from '../../types';

export async function generatePack(
  files: ParsedFiles, pack: Pack, directory: string,
  fs: FileSystemPort, archiveService: ArchiveServicePort, logger: Logger
): Promise<string> {
  const outputDir = path.join(directory, 'builds', pack.packId) + '/';
  logger.success(`Pack output directory: ${outputDir}`);
  await fs.mkdir(outputDir, { recursive: true });

  for (const element of pack.elements) {
    const origin = element.dir;
    const fileName = origin.split('/').pop() ?? '';
    const dir = origin.slice(0, origin.length - fileName.length);

    for (const dep of element.dependencies) {
      await resolveDependency(files, dep as string | Dependency, outputDir, fs, logger);
    }

    await fs.mkdir(path.join(outputDir, dir), { recursive: true });
    await fs.writeFile(path.join(outputDir, origin), element.content);
  }

  const subdirs = (await fs.readdir(outputDir)).filter((item) =>
    fs.statSync(path.join(outputDir, item)).isDirectory()
  );
  const packFolderName = subdirs[0];
  if (!packFolderName) { throw new Error('No pack folder found in output directory.'); }

  const packInfo = resolvePackInfo(files, packFolderName);
  const packInfoDir = path.dirname(path.join(outputDir, packInfo.dir));
  await fs.mkdir(packInfoDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, packInfo.dir), packInfo.content);
  logger.success(`Created: ${path.join(outputDir, packInfo.dir)}`);

  const langContent = generateLangFileContent(pack, packFolderName);
  const langDir = path.join(outputDir, packFolderName, 'assets/dynamxmod/lang');
  await fs.mkdir(langDir, { recursive: true });
  await fs.writeFile(path.join(langDir, 'en_US.lang'), langContent);
  logger.success(`Created: ${path.join(langDir, 'en_US.lang')}`);

  const archiveName = `${packFolderName}-${pack.packId}.dnxpack`;
  const archivePath = path.join(outputDir, archiveName);
  await archiveService.createZip(path.join(outputDir, packFolderName), archivePath);
  logger.success(`Pack created: ${archivePath}`);

  return archivePath;
}
