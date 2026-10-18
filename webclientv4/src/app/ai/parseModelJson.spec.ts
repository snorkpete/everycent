import { describe, it, expect } from 'vitest';
import { parseModelJson } from './parseModelJson';

describe('parseModelJson', () => {
  it('parses plain JSON', () => {
    expect(parseModelJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips markdown code fences around the JSON', () => {
    expect(parseModelJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseModelJson('```\n[1,2]\n```')).toEqual([1, 2]);
  });

  it('throws a readable error for invalid JSON', () => {
    expect(() => parseModelJson('not json')).toThrow(
      'The AI model returned a response that could not be read',
    );
  });
});
