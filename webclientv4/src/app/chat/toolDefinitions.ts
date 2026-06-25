import type { ChatMode } from './chat.types';

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, { type: string; description?: string }>;
      required?: string[];
    };
  };
}

const NLQ_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
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
    type: 'function',
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
    type: 'function',
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
    type: 'function',
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
  {
    type: 'function',
    function: {
      name: 'out_of_budget_analysis',
      description:
        'Analyze how much the household relies on the Out-of-Budget / Sink Fund Transfers escape valve — the shock-absorber category that absorbs spending outside the normal budget. Also includes the "Over Budget Supplement" category (same mechanism, different label). Use this when the user asks about OOB spending, escape-valve reliance, or which months are worst for out-of-budget use. Response shape depends on group_by: "month" → one row per budget period in chronological order (fields: month, total_cents, total_display); "allocation_name" → recurring OOB items ranked by total spend DESC (fields: allocation_name, total_cents, total_display); "calendar_month" → seasonality — which calendar months of the year are worst on average, ranked by avg_monthly_cents DESC (fields: calendar_month, month_name, year_count, total_cents, total_display, avg_monthly_cents, avg_monthly_display). Monetary fields come in pairs: *_cents (exact integer, use for comparison/reasoning) and *_display (pre-formatted currency string — always present this to the user verbatim instead of doing arithmetic on the cents value). Exclusions: brought-forward credit card entries excluded; manual adjustments excluded; deposit-only transactions excluded (only withdrawal transactions counted).',
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
              'How to group results: "month" (chronological per budget period, default), "allocation_name" (recurring OOB items ranked by total), or "calendar_month" (seasonality — which months of the year are worst on average).',
          },
        },
        required: ['start_month', 'end_month'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'placeholder_allocation_analysis',
      description:
        "Analyze structural reliance on saved money — how much spending flows through 0.01 placeholder allocations (budgeted at 1–10 cents), which represent expenses funded from sink funds rather than the current month's income. This is the allocation-level complement to out_of_budget_analysis (which is the category-level view of the same mechanism). Placeholders are the SUBJECT of this tool — they are not excluded. Response shape: { monthly_summary: [...], top_placeholders: [...] }. monthly_summary rows (one per budget month, chronological): month, total_allocation_count, placeholder_count, placeholder_pct (% of allocations that are placeholders), spend_cents, spend_display (total spending through placeholders). top_placeholders rows (ranked by total spend DESC): allocation_name, category_name, months_appeared, total_spend_cents, total_spend_display. Monetary fields come in pairs: *_cents (exact integer, use for comparison/reasoning) and *_display (pre-formatted currency string — always present this to the user verbatim instead of doing arithmetic on the cents value). Exclusions: brought-forward credit card entries excluded from spend totals.",
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
        },
        required: ['start_month', 'end_month'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'sink_fund_status',
      description:
        'Report the current state of sink fund reserve allocations across all tiers (e.g. Sink Fund Account for near-term reserves, Long Term Sink Fund for months-out reserves, Emergency Fund Savings for break-glass reserves). Use this when the user asks about reserves, what they\'re saving for, how healthy savings are, or what\'s running low. Response: one row per sink fund allocation sorted by account name ASC, then allocation name ASC. Fields per row: name (allocation name), account (tier / bank account name), status ("open" or "closed"), target_cents, target_display (the savings target), funded_cents, funded_display (total money deposited in), spent_cents, spent_display (total withdrawn), remaining_cents, remaining_display (funded - spent = net current balance), is_overdrawn (boolean — true when remaining_cents < 0, meaning withdrawals exceed deposits). Negative remaining_cents signals an overdrawn allocation — always flag these explicitly to the user. Monetary fields come in pairs: *_cents (exact integer) and *_display (pre-formatted currency string — always present this to the user verbatim).',
      parameters: {
        type: 'object',
        properties: {
          account: {
            type: 'string',
            description:
              'Filter to a specific sink fund tier by exact account name. Omit to return all tiers (recommended first call — the account names in the results tell you what values are valid for filtering).',
          },
          include_closed: {
            type: 'boolean',
            description:
              'When true, include closed (completed or archived) allocations. Default: false (open allocations only).',
          },
        },
      },
    },
  },
];

const BUG_REPORT_TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'search_bug_reports',
      description:
        'Returns currently-open bug reports for the household so the assistant can check for duplicates before creating a new one.',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_bug_report',
      description: 'Creates a new bug report from the interview.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description:
              'A short one-line summary of what and where, e.g. "Budget total looks wrong on the Budgets screen"',
          },
          description: {
            type: 'string',
            description:
              'A clear plain-prose writeup pulling together everything learned (where, what happened, expected vs actual, when, reproduction notes), written for the developer who will read it later.',
          },
        },
        required: ['title', 'description'],
      },
    },
  },
];

export function getToolsForMode(mode: ChatMode): ToolDefinition[] {
  if (mode === 'bug-report') {
    return BUG_REPORT_TOOL_DEFINITIONS;
  }
  return NLQ_TOOL_DEFINITIONS;
}

// Keep backward-compatible export for existing specs
export const TOOL_DEFINITIONS = NLQ_TOOL_DEFINITIONS;
