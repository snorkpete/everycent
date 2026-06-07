import { getTokens } from '../../auth/authTokens';

const BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';

export async function executeTool(name: string, args: Record<string, unknown>): Promise<string> {
  if (name === 'analyze_overspending') {
    const period = typeof args['period'] === 'string' ? args['period'] : null;
    if (!period) {
      throw new Error('analyze_overspending: missing required parameter "period"');
    }
    const tokens = getTokens();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    for (const [key, value] of Object.entries(tokens)) {
      if (value !== null && value !== undefined) {
        headers[key] = value;
      }
    }

    const response = await fetch(
      `${BASE_URL}/mcp/overspending_analysis?period=${encodeURIComponent(period)}`,
      { headers },
    );

    if (!response.ok) {
      throw new Error(`analyze_overspending failed: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();
    return JSON.stringify(data);
  }

  if (name === 'analyze_overspending_by_allocation') {
    const period = typeof args['period'] === 'string' ? args['period'] : null;
    if (!period) {
      throw new Error('analyze_overspending_by_allocation: missing required parameter "period"');
    }
    const tokens = getTokens();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    for (const [key, value] of Object.entries(tokens)) {
      if (value !== null && value !== undefined) {
        headers[key] = value;
      }
    }

    let url = `${BASE_URL}/mcp/overspending_analysis_by_allocation?period=${encodeURIComponent(period)}`;
    if (typeof args['category'] === 'string') {
      url += `&category=${encodeURIComponent(args['category'])}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(
        `analyze_overspending_by_allocation failed: ${response.status} ${response.statusText}`,
      );
    }

    const data: unknown = await response.json();
    return JSON.stringify(data);
  }

  if (name === 'list_categories') {
    const tokens = getTokens();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    for (const [key, value] of Object.entries(tokens)) {
      if (value !== null && value !== undefined) {
        headers[key] = value;
      }
    }

    const response = await fetch(`${BASE_URL}/mcp/categories`, { headers });

    if (!response.ok) {
      throw new Error(`list_categories failed: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();
    return JSON.stringify(data);
  }

  if (name === 'budget_accuracy') {
    const startMonth = typeof args['start_month'] === 'string' ? args['start_month'] : null;
    if (!startMonth) {
      throw new Error('budget_accuracy: missing required parameter "start_month"');
    }
    const endMonth = typeof args['end_month'] === 'string' ? args['end_month'] : null;
    if (!endMonth) {
      throw new Error('budget_accuracy: missing required parameter "end_month"');
    }
    const tokens = getTokens();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    for (const [key, value] of Object.entries(tokens)) {
      if (value !== null && value !== undefined) {
        headers[key] = value;
      }
    }

    let url = `${BASE_URL}/mcp/budget_accuracy?start_month=${encodeURIComponent(startMonth)}&end_month=${encodeURIComponent(endMonth)}`;
    if (typeof args['group_by'] === 'string') {
      url += `&group_by=${encodeURIComponent(args['group_by'])}`;
    }
    if (typeof args['sort_by'] === 'string') {
      url += `&sort_by=${encodeURIComponent(args['sort_by'])}`;
    }
    if (typeof args['variable_only'] === 'boolean') {
      url += `&variable_only=${args['variable_only']}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`budget_accuracy failed: ${response.status} ${response.statusText}`);
    }

    const data: unknown = await response.json();
    return JSON.stringify(data);
  }

  throw new Error(`Unknown tool: ${name}`);
}
