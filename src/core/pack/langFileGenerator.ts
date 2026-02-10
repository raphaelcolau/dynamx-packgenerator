import { Pack, DynamxFile } from '../../types';
import { parseDynxName, parseDynxVariants } from '../parser/dynxParser';

export function generateLangFileContent(pack: Pack, packFolderName: string): string {
  const lines: string[] = [];
  for (const element of pack.elements) {
    const fileName = getFileName(element);
    const itemName = `item.dynamxmod.${packFolderName.toLowerCase()}.${fileName.toLowerCase().replace('.dynx', '')}`;
    const displayName = parseDynxName(element.content);
    if (displayName) lines.push(`${itemName}.name=${displayName}`);
    const variants = parseDynxVariants(element.content);
    for (const color of variants) {
      lines.push(`${itemName}_${color.toLowerCase()}.name=${displayName} (${color})`);
    }
  }
  return lines.join('\n');
}

function getFileName(element: DynamxFile): string {
  const parts = element.dir.split('/');
  return parts[parts.length - 1];
}
