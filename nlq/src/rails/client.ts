import type { Config } from "../config.js";

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
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }
}
