import { generatePackId } from '../../src/utils/idGenerator';

describe('generatePackId', () => {
  it('should generate an id with default length of 6', () => {
    const id = generatePackId();
    expect(id).toHaveLength(6);
  });

  it('should generate an id with the specified custom length', () => {
    const id = generatePackId(10);
    expect(id).toHaveLength(10);
  });

  it('should generate unique ids on multiple calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generatePackId()));
    // With random alphanumeric IDs of length 6 across 20 calls, collisions are extremely unlikely
    expect(ids.size).toBeGreaterThan(1);
  });
});
