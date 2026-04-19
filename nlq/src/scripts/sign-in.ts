import { createHash, randomBytes } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { spawn } from "node:child_process";
import { chmod, mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const DEFAULT_GOOGLE_CLIENT_ID =
  "72227413355-cv90r8v9a63vb6kkv88t8ikkiig8vmmn.apps.googleusercontent.com";

// Google requires client_secret on token exchange even for Desktop app clients
// with PKCE. Per Google's own docs, it is "obviously not treated as a secret" for
// this client type — it's embedded in the distributed CLI, and security comes
// from PKCE, not from the secret being hidden.
const DEFAULT_GOOGLE_CLIENT_SECRET = "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";

type EnvName = "dev" | "prod";

const RAILS_URLS: Record<EnvName, string> = {
  dev: "http://localhost:3000",
  prod: "https://everycentapp.com",
};

const REDIRECT_PORT = 53682;
const REDIRECT_PATH = "/oauth2callback";
const REDIRECT_URI = `http://localhost:${REDIRECT_PORT}${REDIRECT_PATH}`;
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPES = ["openid", "email", "profile"];
const CREDENTIALS_DIR = join(homedir(), ".config", "everycent-mcp");

function credentialsPathFor(env: EnvName): string {
  return join(CREDENTIALS_DIR, `credentials-${env}`);
}

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function generatePkcePair(): { verifier: string; challenge: string } {
  const verifier = base64url(randomBytes(32));
  const challenge = base64url(createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function generateState(): string {
  return base64url(randomBytes(16));
}

function parseEnvArg(argv: string[]): EnvName {
  const idx = argv.indexOf("--env");
  if (idx === -1) return "dev";
  const value = argv[idx + 1];
  if (value !== "dev" && value !== "prod") {
    throw new Error(`--env must be "dev" or "prod", got: ${value ?? "(missing)"}`);
  }
  return value;
}

function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  const args = process.platform === "win32" ? ["", url] : [url];
  const child = spawn(cmd, args, {
    detached: true,
    stdio: "ignore",
    shell: process.platform === "win32",
  });
  child.unref();
}

type CallbackResult = { code: string };

function awaitCallback(expectedState: string): Promise<CallbackResult> {
  return new Promise((resolve, reject) => {
    const handleRequest = (req: IncomingMessage, res: ServerResponse): void => {
      if (!req.url) {
        res.writeHead(400).end();
        return;
      }
      const url = new URL(req.url, `http://localhost:${REDIRECT_PORT}`);
      if (url.pathname !== REDIRECT_PATH) {
        res.writeHead(404, { "Content-Type": "text/plain" }).end("Not found");
        return;
      }

      const error = url.searchParams.get("error");
      if (error) {
        res
          .writeHead(400, { "Content-Type": "text/html" })
          .end(`<h1>Sign-in failed</h1><p>${escapeHtml(error)}</p>`);
        server.close();
        reject(new Error(`Google returned error: ${error}`));
        return;
      }

      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      if (!code || !state) {
        res.writeHead(400, { "Content-Type": "text/plain" }).end("Missing code or state");
        server.close();
        reject(new Error("Callback missing code or state"));
        return;
      }
      if (state !== expectedState) {
        res.writeHead(400, { "Content-Type": "text/plain" }).end("State mismatch");
        server.close();
        reject(new Error("State mismatch in callback — possible CSRF or stale flow"));
        return;
      }

      res
        .writeHead(200, { "Content-Type": "text/html" })
        .end(
          `<!doctype html><meta charset="utf-8"><title>Signed in</title>` +
            `<body style="font-family:system-ui;padding:2rem;">` +
            `<h1>Signed in</h1>` +
            `<p>You can close this tab and return to the terminal.</p>` +
            `</body>`,
        );
      server.close();
      resolve({ code });
    };

    const server = createServer(handleRequest);
    server.on("error", (err) =>
      reject(new Error(`Local callback server failed: ${err.message}`)),
    );
    server.listen(REDIRECT_PORT, "127.0.0.1");
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function exchangeCodeForIdToken(
  code: string,
  verifier: string,
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: REDIRECT_URI,
    grant_type: "authorization_code",
    code_verifier: verifier,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token exchange failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { id_token?: string };
  if (!json.id_token) {
    throw new Error(`Google token response missing id_token: ${JSON.stringify(json)}`);
  }
  return json.id_token;
}

type DeviseHeaders = {
  accessToken: string;
  client: string;
  uid: string;
  expiry: string | null;
  tokenType: string | null;
};

async function tradeForDeviseHeaders(
  idToken: string,
  railsUrl: string,
): Promise<DeviseHeaders> {
  let res: Response;
  try {
    res = await fetch(`${railsUrl}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: idToken }),
    });
  } catch (err) {
    const cause =
      err instanceof Error && err.cause instanceof Error ? `: ${err.cause.message}` : "";
    throw new Error(
      `Rails ${railsUrl}/auth/google unreachable${cause}. Is the Rails server running?`,
    );
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Rails /auth/google rejected sign-in (${res.status}): ${text}`);
  }

  const accessToken = res.headers.get("access-token");
  const client = res.headers.get("client");
  const uid = res.headers.get("uid");
  if (!accessToken || !client || !uid) {
    throw new Error("Rails /auth/google response missing devise auth headers");
  }
  return {
    accessToken,
    client,
    uid,
    expiry: res.headers.get("expiry"),
    tokenType: res.headers.get("token-type"),
  };
}

async function saveCredentials(
  headers: DeviseHeaders,
  env: EnvName,
  railsUrl: string,
): Promise<string> {
  await mkdir(CREDENTIALS_DIR, { recursive: true });
  const path = credentialsPathFor(env);
  const payload = {
    env,
    rails_url: railsUrl,
    access_token: headers.accessToken,
    client: headers.client,
    uid: headers.uid,
    expiry: headers.expiry,
    token_type: headers.tokenType,
    saved_at: new Date().toISOString(),
  };
  await writeFile(path, JSON.stringify(payload, null, 2), { mode: 0o600 });
  await chmod(path, 0o600);
  return path;
}

async function main(): Promise<void> {
  const env = parseEnvArg(process.argv.slice(2));
  const railsUrl = process.env.RAILS_API_URL ?? RAILS_URLS[env];
  const clientId = process.env.GOOGLE_CLIENT_ID ?? DEFAULT_GOOGLE_CLIENT_ID;
  const clientSecret =
    process.env.GOOGLE_CLIENT_SECRET ?? DEFAULT_GOOGLE_CLIENT_SECRET;

  const { verifier, challenge } = generatePkcePair();
  const state = generateState();

  const authUrl = new URL(GOOGLE_AUTH_URL);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPES.join(" "));
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", challenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  console.log(`Environment: ${env}`);
  console.log(`Rails URL:   ${railsUrl}`);
  console.log(`Opening browser for Google sign-in...`);
  console.log(`If the browser doesn't open automatically, visit:\n  ${authUrl.toString()}\n`);

  const callbackPromise = awaitCallback(state);
  openBrowser(authUrl.toString());

  const { code } = await callbackPromise;
  console.log("Received Google callback. Exchanging code for ID token...");

  const idToken = await exchangeCodeForIdToken(code, verifier, clientId, clientSecret);
  console.log("Exchanging Google ID token for Rails devise session...");

  const headers = await tradeForDeviseHeaders(idToken, railsUrl);
  const path = await saveCredentials(headers, env, railsUrl);

  console.log(`\nSuccess. Credentials saved to:\n  ${path}`);
}

main().catch((err) => {
  console.error("Sign-in failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
