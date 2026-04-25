import { describe, it, expect } from 'vitest';
import { TOOL_DEFINITIONS } from './toolDefinitions';

describe('TOOL_DEFINITIONS', () => {
  it('exports an array with at least one tool', () => {
    expect(TOOL_DEFINITIONS.length).toBeGreaterThan(0);
  });

  describe('analyze_overspending', () => {
    const tool = TOOL_DEFINITIONS.find((t) => t.function.name === 'analyze_overspending');

    it('is present in the list', () => {
      expect(tool).toBeDefined();
    });

    it('has type "function"', () => {
      expect(tool?.type).toBe('function');
    });

    it('requires a period parameter', () => {
      expect(tool?.function.parameters.required).toContain('period');
    });

    it('period parameter is a string type', () => {
      const periodProp = tool?.function.parameters.properties['period'];
      expect(periodProp?.type).toBe('string');
    });
  });

  describe('analyze_overspending_by_allocation', () => {
    const tool = TOOL_DEFINITIONS.find(
      (t) => t.function.name === 'analyze_overspending_by_allocation',
    );

    it('is present in the list', () => {
      expect(tool).toBeDefined();
    });

    it('has type "function"', () => {
      expect(tool?.type).toBe('function');
    });

    it('requires a period parameter', () => {
      expect(tool?.function.parameters.required).toContain('period');
    });

    it('period parameter is a string type', () => {
      const periodProp = tool?.function.parameters.properties['period'];
      expect(periodProp?.type).toBe('string');
    });

    it('has an optional category parameter of string type', () => {
      const categoryProp = tool?.function.parameters.properties['category'];
      expect(categoryProp?.type).toBe('string');
    });

    it('does not require the category parameter', () => {
      expect(tool?.function.parameters.required).not.toContain('category');
    });
  });

  describe('list_categories', () => {
    const tool = TOOL_DEFINITIONS.find((t) => t.function.name === 'list_categories');

    it('is present in the list', () => {
      expect(tool).toBeDefined();
    });

    it('has type "function"', () => {
      expect(tool?.type).toBe('function');
    });

    it('has no required parameters', () => {
      expect(tool?.function.parameters.required).toBeUndefined();
    });

    it('has an empty properties object', () => {
      expect(tool?.function.parameters.properties).toEqual({});
    });
  });
});
