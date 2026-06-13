import { isAxiosError } from 'axios';
import { mcpToolApi, type BudgetAccuracyParams } from './mcpToolApi';

// Pulls the LLM-recoverable message out of a failed tool request. The MCP query
// objects deliberately return `{ error: "<message>" }` bodies (e.g. reversed
// month ranges) so the model can self-correct — surface that message rather than
// a generic status line. Falls back to status/statusText, then the raw error.
function toolError(name: string, error: unknown): Error {
  if (isAxiosError(error)) {
    const data: unknown = error.response?.data;
    if (
      data !== null &&
      typeof data === 'object' &&
      'error' in data &&
      typeof data.error === 'string'
    ) {
      return new Error(`${name} failed: ${data.error}`);
    }
    if (error.response) {
      return new Error(`${name} failed: ${error.response.status} ${error.response.statusText}`);
    }
  }
  const message = error instanceof Error ? error.message : String(error);
  return new Error(`${name} failed: ${message}`);
}

function requireString({
  args,
  key,
  tool,
}: {
  args: Record<string, unknown>;
  key: string;
  tool: string;
}): string {
  const value = args[key];
  if (typeof value !== 'string') {
    throw new Error(`${tool}: missing required parameter "${key}"`);
  }
  return value;
}

async function call(name: string, fn: () => Promise<unknown>): Promise<string> {
  try {
    return JSON.stringify(await fn());
  } catch (error) {
    throw toolError(name, error);
  }
}

export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (name === 'analyze_overspending') {
    const period = requireString({ args, key: 'period', tool: name });
    return call(name, () => mcpToolApi.analyzeOverspending(period));
  }

  if (name === 'analyze_overspending_by_allocation') {
    const period = requireString({ args, key: 'period', tool: name });
    const category = typeof args['category'] === 'string' ? args['category'] : undefined;
    return call(name, () => mcpToolApi.analyzeOverspendingByAllocation(period, category));
  }

  if (name === 'list_categories') {
    return call(name, () => mcpToolApi.listCategories());
  }

  if (name === 'budget_accuracy') {
    const params: BudgetAccuracyParams = {
      start_month: requireString({ args, key: 'start_month', tool: name }),
      end_month: requireString({ args, key: 'end_month', tool: name }),
    };
    if (typeof args['group_by'] === 'string') {
      params.group_by = args['group_by'];
    }
    if (typeof args['sort_by'] === 'string') {
      params.sort_by = args['sort_by'];
    }
    if (typeof args['variable_only'] === 'boolean') {
      params.variable_only = args['variable_only'];
    }
    return call(name, () => mcpToolApi.budgetAccuracy(params));
  }

  throw new Error(`Unknown tool: ${name}`);
}
