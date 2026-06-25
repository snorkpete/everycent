import { describe, it, expect } from 'vitest';
import { TOOL_DEFINITIONS, getToolsForMode } from './toolDefinitions';

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

  describe('budget_accuracy', () => {
    const tool = TOOL_DEFINITIONS.find((t) => t.function.name === 'budget_accuracy');

    it('is present in the list', () => {
      expect(tool).toBeDefined();
    });

    it('has type "function"', () => {
      expect(tool?.type).toBe('function');
    });

    it('requires start_month', () => {
      expect(tool?.function.parameters.required).toContain('start_month');
    });

    it('requires end_month', () => {
      expect(tool?.function.parameters.required).toContain('end_month');
    });

    it('start_month parameter is a string type', () => {
      const prop = tool?.function.parameters.properties['start_month'];
      expect(prop?.type).toBe('string');
    });

    it('end_month parameter is a string type', () => {
      const prop = tool?.function.parameters.properties['end_month'];
      expect(prop?.type).toBe('string');
    });

    it('has an optional group_by parameter of string type', () => {
      const prop = tool?.function.parameters.properties['group_by'];
      expect(prop?.type).toBe('string');
    });

    it('does not require group_by', () => {
      expect(tool?.function.parameters.required).not.toContain('group_by');
    });

    it('has an optional sort_by parameter of string type', () => {
      const prop = tool?.function.parameters.properties['sort_by'];
      expect(prop?.type).toBe('string');
    });

    it('does not require sort_by', () => {
      expect(tool?.function.parameters.required).not.toContain('sort_by');
    });

    it('has an optional variable_only parameter of boolean type', () => {
      const prop = tool?.function.parameters.properties['variable_only'];
      expect(prop?.type).toBe('boolean');
    });

    it('does not require variable_only', () => {
      expect(tool?.function.parameters.required).not.toContain('variable_only');
    });
  });

  describe('out_of_budget_analysis', () => {
    const tool = TOOL_DEFINITIONS.find((t) => t.function.name === 'out_of_budget_analysis');

    it('is present in the list', () => {
      expect(tool).toBeDefined();
    });

    it('has type "function"', () => {
      expect(tool?.type).toBe('function');
    });

    it('requires start_month', () => {
      expect(tool?.function.parameters.required).toContain('start_month');
    });

    it('requires end_month', () => {
      expect(tool?.function.parameters.required).toContain('end_month');
    });

    it('start_month parameter is a string type', () => {
      const prop = tool?.function.parameters.properties['start_month'];
      expect(prop?.type).toBe('string');
    });

    it('end_month parameter is a string type', () => {
      const prop = tool?.function.parameters.properties['end_month'];
      expect(prop?.type).toBe('string');
    });

    it('has an optional group_by parameter of string type', () => {
      const prop = tool?.function.parameters.properties['group_by'];
      expect(prop?.type).toBe('string');
    });

    it('does not require group_by', () => {
      expect(tool?.function.parameters.required).not.toContain('group_by');
    });
  });

  describe('placeholder_allocation_analysis', () => {
    const tool = TOOL_DEFINITIONS.find(
      (t) => t.function.name === 'placeholder_allocation_analysis',
    );

    it('is present in the list', () => {
      expect(tool).toBeDefined();
    });

    it('has type "function"', () => {
      expect(tool?.type).toBe('function');
    });

    it('requires start_month', () => {
      expect(tool?.function.parameters.required).toContain('start_month');
    });

    it('requires end_month', () => {
      expect(tool?.function.parameters.required).toContain('end_month');
    });

    it('start_month parameter is a string type', () => {
      const prop = tool?.function.parameters.properties['start_month'];
      expect(prop?.type).toBe('string');
    });

    it('end_month parameter is a string type', () => {
      const prop = tool?.function.parameters.properties['end_month'];
      expect(prop?.type).toBe('string');
    });
  });

  describe('sink_fund_status', () => {
    const tool = TOOL_DEFINITIONS.find((t) => t.function.name === 'sink_fund_status');

    it('is present in the list', () => {
      expect(tool).toBeDefined();
    });

    it('has type "function"', () => {
      expect(tool?.type).toBe('function');
    });

    it('has no required parameters', () => {
      expect(tool?.function.parameters.required).toBeUndefined();
    });

    it('has an optional account parameter of string type', () => {
      const prop = tool?.function.parameters.properties['account'];
      expect(prop?.type).toBe('string');
    });

    it('has an optional include_closed parameter of boolean type', () => {
      const prop = tool?.function.parameters.properties['include_closed'];
      expect(prop?.type).toBe('boolean');
    });
  });
});

describe('getToolsForMode', () => {
  describe('nlq mode', () => {
    const tools = getToolsForMode('nlq');

    it('returns the 7 NLQ tools', () => {
      expect(tools).toHaveLength(7);
    });

    it('includes analyze_overspending', () => {
      expect(tools.some((t) => t.function.name === 'analyze_overspending')).toBe(true);
    });

    it('includes analyze_overspending_by_allocation', () => {
      expect(tools.some((t) => t.function.name === 'analyze_overspending_by_allocation')).toBe(
        true,
      );
    });

    it('includes list_categories', () => {
      expect(tools.some((t) => t.function.name === 'list_categories')).toBe(true);
    });

    it('includes budget_accuracy', () => {
      expect(tools.some((t) => t.function.name === 'budget_accuracy')).toBe(true);
    });

    it('includes out_of_budget_analysis', () => {
      expect(tools.some((t) => t.function.name === 'out_of_budget_analysis')).toBe(true);
    });

    it('includes placeholder_allocation_analysis', () => {
      expect(tools.some((t) => t.function.name === 'placeholder_allocation_analysis')).toBe(true);
    });

    it('includes sink_fund_status', () => {
      expect(tools.some((t) => t.function.name === 'sink_fund_status')).toBe(true);
    });

    it('does not include bug-report tools', () => {
      expect(tools.some((t) => t.function.name === 'search_bug_reports')).toBe(false);
      expect(tools.some((t) => t.function.name === 'create_bug_report')).toBe(false);
    });
  });

  describe('bug-report mode', () => {
    const tools = getToolsForMode('bug-report');

    it('returns exactly 2 tools', () => {
      expect(tools).toHaveLength(2);
    });

    it('does not include NLQ tools', () => {
      expect(tools.some((t) => t.function.name === 'analyze_overspending')).toBe(false);
      expect(tools.some((t) => t.function.name === 'budget_accuracy')).toBe(false);
    });

    describe('search_bug_reports', () => {
      const tool = getToolsForMode('bug-report').find(
        (t) => t.function.name === 'search_bug_reports',
      );

      it('is present', () => {
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

    describe('create_bug_report', () => {
      const tool = getToolsForMode('bug-report').find(
        (t) => t.function.name === 'create_bug_report',
      );

      it('is present', () => {
        expect(tool).toBeDefined();
      });

      it('has type "function"', () => {
        expect(tool?.type).toBe('function');
      });

      it('requires title', () => {
        expect(tool?.function.parameters.required).toContain('title');
      });

      it('requires description', () => {
        expect(tool?.function.parameters.required).toContain('description');
      });

      it('title parameter is a string type', () => {
        const prop = tool?.function.parameters.properties['title'];
        expect(prop?.type).toBe('string');
      });

      it('description parameter is a string type', () => {
        const prop = tool?.function.parameters.properties['description'];
        expect(prop?.type).toBe('string');
      });
    });
  });
});
