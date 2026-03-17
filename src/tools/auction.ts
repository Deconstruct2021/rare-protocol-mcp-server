import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runCli, formatResult } from "../cli.js";
import { SUPPORTED_CHAINS, FULL_SUPPORT_CHAINS, CONTRACT_ADDRESSES } from "../constants.js";

export function registerAuctionTools(server: McpServer): void {
  // ── Auction Create ───────────────────────────────────────────────────────
  server.registerTool(
    "rare_auction_create",
    {
      title: "Create NFT Auction",
      description: `Create a reserve price auction for an NFT on the RARE Protocol.

The auction contract automatically handles NFT approval — no separate approve step needed.
Once a bid meets the reserve price, the auction timer starts (24hr default).

Args:
  - contract (string): NFT contract address (0x...)
  - token_id (number): Token ID to auction
  - starting_price (number): Reserve price in ETH (e.g. 0.5 for 0.5 ETH)
  - duration (number): Auction length in seconds (86400 = 24hr, 172800 = 48hr)
  - currency (string, optional): ERC-20 token address for non-ETH auctions. Omit for ETH.
  - chain (string, optional): Chain. Deploy/auction only on: ${FULL_SUPPORT_CHAINS.join(", ")}. Default: sepolia.

Returns:
  - Auction confirmation
  - Block number
  - Transaction hash

Auction contract addresses:
  - Mainnet: ${CONTRACT_ADDRESSES.mainnet.auction}
  - Sepolia: ${CONTRACT_ADDRESSES.sepolia.auction}

Lifecycle: create → (bids come in) → settle (after end time)
           or: create → cancel (if no bids placed)`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("NFT contract address (0x...)"),
        token_id: z
          .number()
          .int()
          .positive()
          .describe("Token ID to auction"),
        starting_price: z
          .number()
          .positive()
          .describe("Reserve price in ETH (e.g. 0.5)"),
        duration: z
          .number()
          .int()
          .positive()
          .describe("Duration in seconds (86400 = 24hr, 172800 = 48hr)"),
        currency: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .optional()
          .describe("ERC-20 currency address (omit for ETH)"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe(
            `Chain (deploy/auction only on mainnet/sepolia). Default: sepolia`
          ),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ contract, token_id, starting_price, duration, currency, chain }) => {
      const args = [
        "auction", "create",
        "--contract", contract,
        "--token-id", String(token_id),
        "--starting-price", String(starting_price),
        "--duration", String(duration),
      ];
      if (currency) args.push("--currency", currency);
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Auction Bid ──────────────────────────────────────────────────────────
  server.registerTool(
    "rare_auction_bid",
    {
      title: "Place Auction Bid",
      description: `Place a bid on a running RARE Protocol auction.

The bid must meet or exceed the reserve price to start the auction timer.
Once the timer starts, each new bid extends the auction by a small amount.

Args:
  - contract (string): NFT contract address (0x...)
  - token_id (number): Token ID of the auction
  - amount (number): Bid amount in ETH (e.g. 1.5)
  - currency (string, optional): ERC-20 token address for non-ETH bids. Omit for ETH.
  - chain (string, optional): Chain. Default: sepolia.

Returns:
  - Bid confirmation
  - Transaction hash

Note: Always check rare_auction_status first to see current bid and end time.`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("NFT contract address (0x...)"),
        token_id: z
          .number()
          .int()
          .positive()
          .describe("Token ID"),
        amount: z
          .number()
          .positive()
          .describe("Bid amount in ETH (e.g. 1.5)"),
        currency: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/)
          .optional()
          .describe("ERC-20 currency address (omit for ETH)"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ contract, token_id, amount, currency, chain }) => {
      const args = [
        "auction", "bid",
        "--contract", contract,
        "--token-id", String(token_id),
        "--amount", String(amount),
      ];
      if (currency) args.push("--currency", currency);
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Auction Settle ───────────────────────────────────────────────────────
  server.registerTool(
    "rare_auction_settle",
    {
      title: "Settle Completed Auction",
      description: `Settle a RARE Protocol auction after it has ended.

Must be called after the auction end time has passed.
Transfers the NFT to the winning bidder and ETH to the seller.
Always check rare_auction_status first to confirm the auction has ended.

Args:
  - contract (string): NFT contract address (0x...)
  - token_id (number): Token ID of the completed auction
  - chain (string, optional): Chain. Default: sepolia.

Returns:
  - Settlement confirmation
  - Transaction hash`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("NFT contract address (0x...)"),
        token_id: z
          .number()
          .int()
          .positive()
          .describe("Token ID"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async ({ contract, token_id, chain }) => {
      const args = [
        "auction", "settle",
        "--contract", contract,
        "--token-id", String(token_id),
      ];
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Auction Cancel ───────────────────────────────────────────────────────
  server.registerTool(
    "rare_auction_cancel",
    {
      title: "Cancel Auction",
      description: `Cancel a RARE Protocol auction. Only possible if no bids have been placed.

Once a bid is placed, the auction cannot be cancelled.
Always check rare_auction_status first to confirm no bids exist.

Args:
  - contract (string): NFT contract address (0x...)
  - token_id (number): Token ID of the auction to cancel
  - chain (string, optional): Chain. Default: sepolia.

Returns:
  - Cancellation confirmation
  - Transaction hash`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("NFT contract address (0x...)"),
        token_id: z
          .number()
          .int()
          .positive()
          .describe("Token ID"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({ contract, token_id, chain }) => {
      const args = [
        "auction", "cancel",
        "--contract", contract,
        "--token-id", String(token_id),
      ];
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );

  // ── Auction Status ───────────────────────────────────────────────────────
  server.registerTool(
    "rare_auction_status",
    {
      title: "Check Auction Status",
      description: `Get the current status of a RARE Protocol auction. Read-only, no gas required.

Always call this before settle or cancel to inspect current state.

Args:
  - contract (string): NFT contract address (0x...)
  - token_id (number): Token ID to check
  - chain (string, optional): Chain. Default: sepolia.

Returns:
  - Auction state (PENDING, RUNNING, SETTLED, CANCELLED)
  - Current bid amount and bidder
  - End time
  - Reserve price
  - Seller address`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("NFT contract address (0x...)"),
        token_id: z
          .number()
          .int()
          .positive()
          .describe("Token ID to check"),
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
      const args = [
        "auction", "status",
        "--contract", contract,
        "--token-id", String(token_id),
      ];
      if (chain) args.push("--chain", chain);
      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );
}
