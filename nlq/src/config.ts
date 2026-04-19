import type { McpEnv } from "./auth/credentials.js";

export type Config = {
  mcpEnv: McpEnv;
  railsApiUrl: string;
  railsApiTimeoutMs: number;
};

const RAILS_URLS: Record<McpEnv, string> = {
  dev: "http://localhost:3000",
  prod: "https://everycentapp.com",
};

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

function parseMcpEnv(): McpEnv {
  const raw = process.env.MCP_ENV;
  if (!raw) return "dev";
  if (raw !== "dev" && raw !== "prod") {
    throw new Error(`MCP_ENV must be 'dev' or 'prod', got: ${raw}`);
  }
  return raw;
}

export function loadConfig(): Config {
  const mcpEnv = parseMcpEnv();
  return {
    mcpEnv,
    railsApiUrl: process.env.RAILS_API_URL ?? RAILS_URLS[mcpEnv],
    railsApiTimeoutMs: optionalIntEnv("RAILS_API_TIMEOUT_MS", 30_000),
  };
}
