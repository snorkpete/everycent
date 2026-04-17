export type Config = {
  railsApiUrl: string;
  railsApiTimeoutMs: number;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in the MCP server config (via the -e flag on 'claude mcp add') ` +
        `or your shell environment.`,
    );
  }
  return value;
}

function optionalIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(
      `Environment variable ${name} must be a positive integer, got: ${raw}`,
    );
  }
  return parsed;
}

export function loadConfig(): Config {
  return {
    railsApiUrl: requireEnv("RAILS_API_URL"),
    railsApiTimeoutMs: optionalIntEnv("RAILS_API_TIMEOUT_MS", 30_000),
  };
}
