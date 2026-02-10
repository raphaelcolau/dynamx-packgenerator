export function generatePackId(length: number = 6): string {
  return [...Array(length)].map(() => Math.random().toString(36).charAt(2)).join('');
}
