export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'analyze_overspending',
      description:
        'Analyze budget vs actual spending for a given month. Returns categories sorted by overspend amount. Scope: only categories with budget_role = spending (excludes annual_spending, transfer, savings, event — see system prompt for why). Excludes brought-forward credit card entries. Use this when the user asks about overspending, budget performance, or which categories went over budget.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description: 'The month to analyze in YYYY-MM format',
          },
        },
        required: ['period'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'analyze_overspending_by_allocation',
      description:
        'Analyze budget vs actual spending by individual allocation for a given month. Returns allocations sorted by overspend amount. Same scope as analyze_overspending: budget_role = spending only, brought-forward CC entries excluded. Use this when the user asks about specific spending items, individual budget line items, or wants more detail than category-level analysis.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description: 'The month to analyze in YYYY-MM format',
          },
          category: {
            type: 'string',
            description:
              'Filter by allocation category name. Use list_categories to see valid values.',
          },
        },
        required: ['period'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'list_categories',
      description:
        'List all allocation categories for the household. Each category groups related budget allocations and has a budget_role (spending|annual_spending|transfer|savings|event — see system prompt for semantics). Call this before using category filters to see valid category names.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];
