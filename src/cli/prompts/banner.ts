import * as p from '@clack/prompts';

export function showBanner(): void {
  console.clear();
  p.intro('DynamX Pack Manager v2.4.2');
}
