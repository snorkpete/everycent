export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'analyze_overspending',
      description:
        'Analyze budget vs actual spending for a given month, one row per category. Rows are pre-sorted most-overspent-first; to find overspends, take rows where amount_remaining_cents < 0 (the magnitude is the overspend amount in cents). Scope: only categories with budget_role = spending (excludes annual_spending, transfer, savings, event — see system prompt for why). Excludes brought-forward credit card entries and placeholder allocations (budgeted <= 10 cents, i.e. funded from sink funds rather than current income). Use this when the user asks about overspending, budget performance, or which categories went over budget. Monetary fields come in pairs: *_cents (exact integer, use for comparison/reasoning) and *_display (pre-formatted currency string, e.g. "€1,234.56" — always present this to the user verbatim instead of doing arithmetic on the cents value).',
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
        'Analyze budget vs actual spending by individual allocation for a given month, one row per allocation. Rows are pre-sorted most-overspent-first; overspends are rows where amount_remaining_cents < 0 (magnitude = overspend in cents). Same scope as analyze_overspending: budget_role = spending only; brought-forward CC entries and placeholder allocations (budgeted <= 10 cents) excluded. Month-suffix variants of the same allocation (e.g. "Car Insurance (Feb)" and "(Jul)") are merged into one row. Use this when the user asks about specific spending items, individual budget line items, or wants more detail than category-level analysis. Monetary fields come in pairs: *_cents (exact integer, use for comparison/reasoning) and *_display (pre-formatted currency string, e.g. "€1,234.56" — always present this to the user verbatim instead of doing arithmetic on the cents value).',
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
  {
    type: 'function' as const,
    function: {
      name: 'budget_accuracy',
      description:
        'Measure how accurately each allocation (or category) was budgeted across a range of months. Answers "What are we bad at predicting?" By default, rows are sorted worst-predicted first (highest median absolute %-off); pass sort_by to change the ordering. Response shape per row: group_label, group_by ("allocation"|"category"), months_counted, median_abs_pct_off, avg_abs_pct_off, pct_months_within_10 (% of months where actual was within 10% of budget), direction ("over"|"under" — derived from the net signed deviation, not the median), total_budgeted_cents, total_budgeted_display, total_actual_cents, total_actual_display, net_deviation_cents, net_deviation_display. Monetary fields come in pairs: *_cents (exact integer, use for comparison/reasoning) and *_display (pre-formatted currency string, e.g. "€1,234.56" — always present this to the user verbatim instead of doing arithmetic on the cents value). Exclusions: spending-role allocations only (budget_role = spending); brought-forward credit card entries excluded; placeholder allocations (budgeted <= 10 cents) excluded; individual months where the budgeted amount is <= €10 (1000 cents) are excluded from that group\'s stats — the group\'s other months still count. Month-suffix variants (e.g. "Car Insurance (Feb)") are merged when group_by = allocation. sort_by options: "pct_off" (highest median absolute %-off first, default), "overspend_amount" (largest net overspend first), "underspend_amount" (largest net underspend first).',
      parameters: {
        type: 'object',
        properties: {
          start_month: {
            type: 'string',
            description: 'Start of the month range in YYYY-MM format, e.g. 2024-01',
          },
          end_month: {
            type: 'string',
            description: 'End of the month range (inclusive) in YYYY-MM format, e.g. 2024-12',
          },
          group_by: {
            type: 'string',
            description:
              'Group results by "allocation" (individual budget line items, default) or "category" (allocation category).',
          },
          sort_by: {
            type: 'string',
            description:
              'Sort order: "pct_off" (highest median absolute %-off first, default), "overspend_amount" (largest net overspend first), or "underspend_amount" (largest net underspend first).',
          },
          variable_only: {
            type: 'boolean',
            description:
              'When true, restrict to variable allocations (is_fixed_amount = false). Useful for focusing on discretionary spending where prediction accuracy matters most.',
          },
        },
        required: ['start_month', 'end_month'],
      },
    },
  },
];
