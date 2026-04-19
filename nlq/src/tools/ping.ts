import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPingTool(server: McpServer): void {
  server.tool(
    "ping",
    "Returns 'pong'. A trivial tool used to verify that MCP wiring works end-to-end — from Claude Code, through the MCP server, and back.",
    {},
    async () => ({
      content: [{ type: "text", text: "pong" }],
    }),
  );
}
