export function normalizePath(p: string): string { return p.replaceAll('\\', '/'); }
export function getFileName(filePath: string): string {
  const parts = normalizePath(filePath).split('/');
  return parts[parts.length - 1] ?? '';
}
export function getDirectory(filePath: string): string {
  const normalized = normalizePath(filePath);
  const lastSlash = normalized.lastIndexOf('/');
  return lastSlash >= 0 ? normalized.slice(0, lastSlash + 1) : '';
}
