export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'analyze_overspending',
      description:
        'Analyze budget vs actual spending for a given month, one row per category. Rows are pre-sorted most-overspent-first; to find overspends, take rows where amount_remaining_cents < 0 (the magnitude is the overspend amount in cents). Scope: only categories with budget_role = spending (excludes annual_spending, transfer, savings, event — see system prompt for why). Excludes brought-forward credit card entries and placeholder allocations (budgeted <= 10 cents, i.e. funded from sink funds rather than current income). Use this when the user asks about overspending, budget performance, or which categories went over budget.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description: 'The month to analyze in YYYY-MM format, e.g. 2024-03',
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
        'Analyze budget vs actual spending by individual allocation for a given month, one row per allocation. Rows are pre-sorted most-overspent-first; overspends are rows where amount_remaining_cents < 0 (magnitude = overspend in cents). Same scope as analyze_overspending: budget_role = spending only; brought-forward CC entries and placeholder allocations (budgeted <= 10 cents) excluded. Month-suffix variants of the same allocation (e.g. "Car Insurance (Feb)" and "(Jul)") are merged into one row. Use this when the user asks about specific spending items, individual budget line items, or wants more detail than category-level analysis.',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            description: 'The month to analyze in YYYY-MM format, e.g. 2024-03',
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
