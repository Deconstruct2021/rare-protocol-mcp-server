import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runCli, formatResult } from "../cli.js";
import { SUPPORTED_CHAINS } from "../constants.js";

export function registerSearchTools(server: McpServer): void {
  // ── Search Tokens ────────────────────────────────────────────────────────
  server.registerTool(
    "rare_search_tokens",
    {
      title: "Search NFTs",
      description: `Search NFTs via the RARE Protocol API.

By default returns NFTs owned by your configured wallet.
Use query or owner to filter results.

Args:
  - query (string, optional): Text search across token names
  - owner (string, optional): Filter by owner wallet address (0x...)
  - mine (boolean, optional): Show only your own NFTs (default: true)
  - take (number, optional): Number of results to return (default: 10, max: 50)
  - cursor (number, optional): Pagination cursor for next page
  - chain (string, optional): Chain to search. Default: sepolia.

Returns:
  - List of NFTs with name, contract, token ID, and metadata`,
      inputSchema: z.object({
        query: z
          .string()
          .optional()
          .describe("Text search across token names"),
        owner: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/)
          .optional()
          .describe("Filter by owner address (0x...)"),
        mine: z
          .boolean()
          .optional()
          .describe("Show only your NFTs (default: true)"),
        take: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Number of results (default: 10, max: 50)"),
        cursor: z
          .number()
          .int()
          .optional()
          .describe("Pagination cursor"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain to search (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query, owner, mine, take, cursor, chain }) => {
      const args = ["search", "tokens"];
      if (query) args.push("--query", query);
      if (owner) args.push("--owner", owner);
      if (mine !== false) args.push("--mine");
      if (take) args.push("--take", String(take));
      if (cursor) args.push("--cursor", String(cursor));
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Search Auctions ──────────────────────────────────────────────────────
  server.registerTool(
    "rare_search_auctions",
    {
      title: "Search Auctions",
      description: `Search active and historical auctions via the RARE Protocol API.

Args:
  - state (string, optional): Filter by auction state: PENDING, RUNNING, SETTLED, UNSETTLED.
    Default returns PENDING and RUNNING auctions.
  - owner (string, optional): Filter by NFT owner address (0x...)
  - query (string, optional): Text search across auction names
  - take (number, optional): Number of results (default: 10, max: 50)
  - cursor (number, optional): Pagination cursor
  - chain (string, optional): Chain to search. Default: sepolia.

Returns:
  - List of auctions with contract, token ID, current bid, end time, and state`,
      inputSchema: z.object({
        state: z
          .enum(["PENDING", "RUNNING", "SETTLED", "UNSETTLED"])
          .optional()
          .describe(
            "Auction state filter (default: PENDING + RUNNING)"
          ),
        owner: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/)
          .optional()
          .describe("Filter by owner address (0x...)"),
        query: z
          .string()
          .optional()
          .describe("Text search"),
        take: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Number of results (default: 10, max: 50)"),
        cursor: z
          .number()
          .int()
          .optional()
          .describe("Pagination cursor"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain to search (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ state, owner, query, take, cursor, chain }) => {
      const args = ["search", "auctions"];
      if (state) args.push("--state", state);
      if (owner) args.push("--owner", owner);
      if (query) args.push("--query", query);
      if (take) args.push("--take", String(take));
      if (cursor) args.push("--cursor", String(cursor));
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Search Collections ───────────────────────────────────────────────────
  server.registerTool(
    "rare_search_collections",
    {
      title: "Search Collections",
      description: `Search NFT collections owned by your wallet via the RARE Protocol API.

Args:
  - query (string, optional): Text search across collection names
  - take (number, optional): Number of results (default: 10, max: 50)
  - cursor (number, optional): Pagination cursor
  - chain (string, optional): Chain to search. Default: sepolia.

Returns:
  - List of collections with contract address, name, symbol, and token count`,
      inputSchema: z.object({
        query: z
          .string()
          .optional()
          .describe("Text search across collection names"),
        take: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Number of results (default: 10, max: 50)"),
        cursor: z
          .number()
          .int()
          .optional()
          .describe("Pagination cursor"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain to search (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ query, take, cursor, chain }) => {
      const args = ["search", "collections"];
      if (query) args.push("--query", query);
      if (take) args.push("--take", String(take));
      if (cursor) args.push("--cursor", String(cursor));
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Status ───────────────────────────────────────────────────────────────
  server.registerTool(
    "rare_status",
    {
      title: "Query Contract / Token Status",
      description: `Query on-chain status of an NFT contract or specific token. Read-only, no gas.

Use this to inspect contract details and token metadata before transacting.

Args:
  - contract (string): NFT contract address (0x...)
  - token_id (number, optional): Specific token ID to inspect. Omit for contract-level info.
  - chain (string, optional): Chain. Default: sepolia.

Returns:
  - Contract name, symbol, owner, total supply
  - If token_id provided: token URI, owner address, metadata`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("NFT contract address (0x...)"),
        token_id: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Specific token ID to inspect (optional)"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ contract, token_id, chain }) => {
      const args = ["status", "--contract", contract];
      if (token_id) args.push("--token-id", String(token_id));
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );
}
