import { Pack, DynamxFile } from '../../types';

export class PackBuilder {
  private packId: string;
  private elements: DynamxFile[] = [];
  private isProtected: boolean | undefined;
  private host?: string;
  private gameDir?: string;

  constructor() { this.packId = PackBuilder.generateId(); }

  static generateId(): string {
    return [...Array(6)].map(() => Math.random().toString(36).charAt(2)).join('');
  }

  setPackId(id: string): this { this.packId = id; return this; }
  addElement(element: DynamxFile): this {
    if (!this.elements.includes(element)) this.elements.push(element);
    return this;
  }
  addElements(elements: DynamxFile[]): this { for (const el of elements) this.addElement(el); return this; }
  getElementCount(): number { return this.elements.length; }
  setProtected(value: boolean): this { this.isProtected = value; return this; }
  setHost(host: string): this { this.host = host; return this; }
  setGameDir(dir: string): this { this.gameDir = dir; return this; }
  getPackId(): string { return this.packId; }

  build(): Pack {
    return {
      packId: this.packId,
      elements: [...this.elements],
      isProtected: this.isProtected,
      host: this.host,
      gameDir: this.gameDir,
    };
  }
}
