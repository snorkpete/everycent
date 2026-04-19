import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadCredentials } from "./auth/credentials.js";
import { loadConfig } from "./config.js";
import { RailsClient } from "./rails/client.js";
import { registerAnalyzeOverspendingTool } from "./tools/analyzeOverspending.js";
import { registerPingTool } from "./tools/ping.js";

export async function createServer(): Promise<McpServer> {
  const config = loadConfig();
  const credentials = await loadCredentials(config.mcpEnv);
  const rails = new RailsClient(config, credentials);

  const server = new McpServer({
    name: "everycent-nlq",
    version: "0.0.1",
  });

  registerPingTool(server);
  registerAnalyzeOverspendingTool(server, rails);

  return server;
}
