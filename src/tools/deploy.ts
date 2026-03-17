import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runCli, formatResult } from "../cli.js";
import { SUPPORTED_CHAINS, FULL_SUPPORT_CHAINS, CONTRACT_ADDRESSES } from "../constants.js";

export function registerDeployTools(server: McpServer): void {
  // ── Deploy ERC-721 ───────────────────────────────────────────────────────
  server.registerTool(
    "rare_deploy_contract",
    {
      title: "Deploy NFT Collection Contract",
      description: `Deploy a new ERC-721 NFT collection contract via the RARE Protocol factory.

This deploys a SovereignBatchMint contract — your own branded NFT contract on Ethereum.
The contract is owned by your wallet and registered in the RARE Protocol registry.

Args:
  - name (string): Full name for the collection (e.g. "FRAME OF MIND")
  - symbol (string): Short ticker symbol (e.g. "FOM") — appears on Etherscan and OpenSea
  - max_tokens (number, optional): Maximum token supply. Omit for unlimited.
  - chain (string, optional): Chain to deploy on. Default: sepolia. Use mainnet for production.

Returns:
  - Contract address (0x...) — save this for minting
  - Transaction hash

Factory addresses:
  - Mainnet: ${CONTRACT_ADDRESSES.mainnet.factory}
  - Sepolia: ${CONTRACT_ADDRESSES.sepolia.factory}

Important: Always test on sepolia first. Mainnet deployment costs real ETH gas.`,
      inputSchema: z.object({
        name: z
          .string()
          .min(1)
          .max(100)
          .describe('Collection name (e.g. "FRAME OF MIND")'),
        symbol: z
          .string()
          .min(1)
          .max(10)
          .describe('Token symbol/ticker (e.g. "FOM")'),
        max_tokens: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Maximum token supply (optional, omit for unlimited)"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe(
            `Chain to deploy on. Deploy/auction only available on: ${FULL_SUPPORT_CHAINS.join(", ")}. Default: sepolia`
          ),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ name, symbol, max_tokens, chain }) => {
      const args = ["deploy", "erc721", name, symbol];
      if (max_tokens) args.push("--max-tokens", String(max_tokens));
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Import Contract ──────────────────────────────────────────────────────
  server.registerTool(
    "rare_import_contract",
    {
      title: "Import Existing ERC-721 Contract",
      description: `Import an existing ERC-721 contract into the RARE Protocol registry.

Use this if you already have a deployed NFT contract that you want to register
with the RARE Protocol so it can be used with auctions and marketplace features.

Args:
  - contract (string): The ERC-721 contract address to import (0x...)
  - chain (string, optional): Chain the contract is on. Default: sepolia.

Returns:
  - Confirmation of successful import
  - Transaction hash`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("ERC-721 contract address to import (0x...)"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain the contract is on (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ contract, chain }) => {
      const args = ["import", "erc721", "--contract", contract];
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );
}
