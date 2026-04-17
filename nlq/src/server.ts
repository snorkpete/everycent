import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadConfig } from "./config.js";
import { RailsClient } from "./rails/client.js";
import { registerPingTool } from "./tools/ping.js";
import { registerAnalyzeOverspendingTool } from "./tools/analyzeOverspending.js";

export function createServer(): McpServer {
  const config = loadConfig();
  const rails = new RailsClient(config);

  const server = new McpServer({
    name: "everycent-nlq",
    version: "0.0.1",
  });

  registerPingTool(server);
  registerAnalyzeOverspendingTool(server, rails);

  return server;
}
