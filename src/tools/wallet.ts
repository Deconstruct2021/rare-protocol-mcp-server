import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runCli, formatResult } from "../cli.js";
import { SUPPORTED_CHAINS } from "../constants.js";

export function registerWalletTools(server: McpServer): void {
  // ── Configure Show ──────────────────────────────────────────────────────
  server.registerTool(
    "rare_configure_show",
    {
      title: "Show RARE CLI Configuration",
      description: `Show the current rare-cli configuration including wallet address and RPC URLs.
Always call this first before any transaction to verify the wallet and chain are correctly configured.

Returns:
  - defaultChain: The active chain (e.g. "sepolia")
  - chains: Per-chain config with masked private key and RPC URL
  - wallet address per chain

Use this to verify setup before minting, deploying, or running auctions.`,
      inputSchema: z.object({}),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      const result = await runCli(["configure", "--show"]);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Wallet Address ───────────────────────────────────────────────────────
  server.registerTool(
    "rare_wallet_address",
    {
      title: "Get Wallet Address",
      description: `Get the configured wallet address for the current or specified chain.

Args:
  - chain (optional): Chain to check. Defaults to configured default chain.

Returns:
  - Ethereum wallet address (0x...)

Use this to confirm which wallet will sign transactions.`,
      inputSchema: z.object({
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain to check (default: configured default chain)"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async ({ chain }) => {
      const args = ["wallet", "address"];
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );
}
