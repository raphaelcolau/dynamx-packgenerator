import path from 'path';
import { FileSystemPort } from '../../infrastructure/filesystem/fileSystemPort';
import { ArchiveServicePort } from '../../infrastructure/archive/archiveService';
import { ProtectServicePort } from '../../infrastructure/http/protectService';
import { Logger } from '../../cli/output/logger';
import { ParsedFiles, Pack } from '../../types';
import { resolveDependency } from './dependencyResolver';
import { generateLangFileContent } from './langFileGenerator';
import { resolvePackInfo } from './packInfoGenerator';
import { Dependency } from '../../types';

export async function generatePack(
  files: ParsedFiles, pack: Pack, directory: string,
  fs: FileSystemPort, archiveService: ArchiveServicePort,
  protectService: ProtectServicePort, logger: Logger
): Promise<void> {
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
  if (!packFolderName) { logger.error('No pack folder found in output directory.'); return; }

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

  if (pack.isProtected && pack.host && pack.gameDir) {
    await protectService.protectPack(archivePath, pack.host, pack.gameDir, pack.packId);
  } else {
    logger.success(`Pack created: ${archivePath}`);
  }
}
