import type { Config } from "../config.js";

// Node's fetch wraps low-level connection errors as `new Error("fetch failed")`
// with the real info on `.cause`. For connection refused, cause is an
// AggregateError with empty .message but a useful .code ("ECONNREFUSED") and
// per-address errors in .errors[]. This helper surfaces the useful bits.
function describeCause(cause: unknown): string {
  if (cause instanceof AggregateError) {
    const code = (cause as unknown as { code?: string }).code;
    if (code) return code;
    return cause.errors
      .map((e) => (e instanceof Error ? e.message : String(e)))
      .join("; ");
  }
  if (cause instanceof Error) {
    const code = (cause as unknown as { code?: string }).code;
    return code ? `${code} (${cause.message})` : cause.message;
  }
  return String(cause);
}

export class RailsClient {
  constructor(private readonly config: Config) {}

  async get<T>(
    path: string,
    params: Record<string, string> = {},
  ): Promise<T> {
    const url = new URL(path, this.config.railsApiUrl);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.railsApiTimeoutMs,
    );

    try {
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(
          `Rails returned ${response.status} ${response.statusText} for ` +
            `${url.pathname}${url.search}: ${body}`,
        );
      }

      return (await response.json()) as T;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        throw new Error(
          `Rails request timed out after ${this.config.railsApiTimeoutMs}ms: ` +
            `${url.pathname}${url.search}`,
        );
      }
      if (err instanceof Error && err.message === "fetch failed") {
        throw new Error(
          `Rails unreachable at ${this.config.railsApiUrl}: ${describeCause(err.cause)}`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
