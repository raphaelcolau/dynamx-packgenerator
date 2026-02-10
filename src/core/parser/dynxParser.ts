export function parseDynxDependencies(content: string): string[] {
  const dependencies: string[] = [];
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.replaceAll('\t', '');
    if (trimmed.startsWith('Model')) {
      const obj = trimmed.replace('Model:', '').replaceAll(' ', '');
      if (obj && !dependencies.includes(obj)) dependencies.push(obj);
    } else if (trimmed.startsWith('DefaultEngine')) {
      const parts = trimmed.replace('DefaultEngine:', '').replaceAll(' ', '').split('.');
      const engine = parts.length > 1 ? parts[1] : undefined;
      if (engine && !dependencies.includes(engine)) dependencies.push(engine);
    } else if (trimmed.startsWith('DefaultSounds')) {
      const parts = trimmed.replace('DefaultSounds:', '').replaceAll(' ', '').split('.');
      const sounds = parts.length > 1 ? parts[1] : undefined;
      if (sounds && !dependencies.includes(sounds)) dependencies.push(sounds);
    } else if (trimmed.includes('AttachedWheel')) {
      const parts = trimmed.replace('AttachedWheel:', '').replaceAll(' ', '').split('.');
      const wheel = parts.length > 1 ? parts[1] : undefined;
      if (wheel && !dependencies.includes(wheel)) dependencies.push(wheel);
    }
  }
  return dependencies;
}

export function parseDynxName(content: string): string | undefined {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('Name:')) {
      return line.replace('Name:', '').replace(/[\n\r]/g, '').trim();
    }
  }
  return undefined;
}

export function parseDynxVariants(content: string): string[] {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (line.includes('Variants:')) {
      return line.replace(/.*Variants:/, '').replace(/[\n\r]/g, '').trim().split(' ').filter(Boolean);
    }
  }
  return [];
}
