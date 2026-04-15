import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerPingTool } from "./tools/ping.js";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "everycent-nlq",
    version: "0.0.1",
  });

  registerPingTool(server);

  return server;
}
