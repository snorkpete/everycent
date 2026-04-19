import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

const server = await createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
