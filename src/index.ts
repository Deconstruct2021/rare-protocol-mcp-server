#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerWalletTools } from "./tools/wallet.js";
import { registerDeployTools } from "./tools/deploy.js";
import { registerMintTools } from "./tools/mint.js";
import { registerAuctionTools } from "./tools/auction.js";
import { registerSearchTools } from "./tools/search.js";

const server = new McpServer({
  name: "rare-protocol-mcp-server",
  version: "0.1.0",
});

// Register all tool groups
registerWalletTools(server);
registerDeployTools(server);
registerMintTools(server);
registerAuctionTools(server);
registerSearchTools(server);

// Start stdio transport
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("RARE Protocol MCP server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
