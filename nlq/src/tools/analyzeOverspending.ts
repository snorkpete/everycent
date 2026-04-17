import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { RailsClient } from "../rails/client.js";

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
`.trim();

const inputSchema = {
  period: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "period must be in YYYY-MM format")
    .describe("Budget period to analyze, in YYYY-MM format (e.g. '2026-03')"),
};

export function registerAnalyzeOverspendingTool(
  server: McpServer,
  rails: RailsClient,
): void {
  server.tool(
    "analyze_overspending",
    TOOL_DESCRIPTION,
    inputSchema,
    async ({ period }) => {
      try {
        const result = await rails.get("/mcp/overspending_analysis", {
          period,
        });
        return {
          content: [
            { type: "text", text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          content: [
            {
              type: "text",
              text: `Failed to analyze overspending: ${message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
