import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPingTool } from "./tools/ping.js";
import { registerAnalyzeOverspendingTool } from "./tools/analyzeOverspending.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "everycent-nlq",
    version: "0.0.1",
  });

  registerPingTool(server);
  registerAnalyzeOverspendingTool(server);

  return server;
}
