import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const TOOL_DESCRIPTION = `
Analyze budget vs actual spending in everycent for a given month.

Returns ALL categories with their budgeted and actual amounts, sorted by
overspend (biggest overspend first, within-budget categories last). All
amounts are in cents (integer). 'amount_remaining_cents' is budgeted
minus actual — negative values mean the category is over budget by that
amount, positive values mean the category is within budget with that
amount left.

Use this tool when the user asks about budget overruns, underspending,
where they are overspending, which categories stayed within budget, or
any budget-vs-actual comparison.

NOTE: Currently returns stub data for wiring verification; real analysis
logic is not yet connected.
`.trim();

const inputSchema = {
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "period must be in YYYY-MM format")
    .describe("Budget period to analyze, in YYYY-MM format (e.g. '2026-03')"),
};

const STUB_RESPONSE = {
  period: "2026-03",
  categories: [
    {
      category: "Recreation",
      budgeted_cents: 20000,
      actual_cents: 45200,
      amount_remaining_cents: -25200,
    },
    {
      category: "Food - Groceries",
      budgeted_cents: 60000,
      actual_cents: 73800,
      amount_remaining_cents: -13800,
    },
    {
      category: "Household Purchases",
      budgeted_cents: 15000,
      actual_cents: 21800,
      amount_remaining_cents: -6800,
    },
    {
      category: "Transport",
      budgeted_cents: 30000,
      actual_cents: 28500,
      amount_remaining_cents: 1500,
    },
    {
      category: "Utilities",
      budgeted_cents: 25000,
      actual_cents: 18200,
      amount_remaining_cents: 6800,
    },
  ],
};

export function registerAnalyzeOverspendingTool(server: McpServer): void {
  server.tool(
    "analyze_overspending",
    TOOL_DESCRIPTION,
    inputSchema,
    async ({ period }) => ({
      content: [
        {
          type: "text",
          text: JSON.stringify({ ...STUB_RESPONSE, period }, null, 2),
        },
      ],
    }),
  );
}
