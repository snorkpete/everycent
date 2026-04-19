import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export type McpEnv = "dev" | "prod";

export type DeviseCredentials = {
  env: McpEnv;
  railsUrl: string;
  accessToken: string;
  client: string;
  uid: string;
  expiry: string | null;
  tokenType: string | null;
};

function credentialsPathFor(env: McpEnv): string {
  return join(homedir(), ".config", "everycent-mcp", `credentials-${env}`);
}

function signInHint(env: McpEnv): string {
  return env === "prod"
    ? "npm run sign-in -- --env prod"
    : "npm run sign-in";
}

export async function loadCredentials(env: McpEnv): Promise<DeviseCredentials> {
  const path = credentialsPathFor(env);
  let raw: string;
  try {
    raw = await readFile(path, "utf8");
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    throw new Error(
      `No credentials for env '${env}' at ${path}. ` +
        `Run '${signInHint(env)}' to sign in. (${cause})`,
    );
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    throw new Error(`Credentials file at ${path} is not valid JSON: ${cause}`);
  }

  const requireStr = (key: string): string => {
    const v = parsed[key];
    if (typeof v !== "string" || !v) {
      throw new Error(`Credentials file at ${path} missing or empty '${key}'`);
    }
    return v;
  };

  const optionalStr = (key: string): string | null => {
    const v = parsed[key];
    return typeof v === "string" && v ? v : null;
  };

  return {
    env,
    railsUrl: requireStr("rails_url"),
    accessToken: requireStr("access_token"),
    client: requireStr("client"),
    uid: requireStr("uid"),
    expiry: optionalStr("expiry"),
    tokenType: optionalStr("token_type"),
  };
}
