import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { runCli, formatResult } from "../cli.js";
import { SUPPORTED_CHAINS } from "../constants.js";

export function registerMintTools(server: McpServer): void {
  server.registerTool(
    "rare_mint_nft",
    {
      title: "Mint NFT",
      description: `Mint a new NFT on a deployed RARE Protocol contract.

Two minting modes:

MODE 1 — Local media upload (recommended):
  Provide image path (and optionally video path). The CLI uploads media to IPFS
  via SuperRare's filebase, builds metadata, and mints in one step.

MODE 2 — Pre-built metadata URI:
  If you've already pinned metadata to IPFS, provide the token_uri directly.

Args:
  - contract (string): NFT contract address (0x...) — from rare_deploy_contract
  - name (string, optional): Token name (required for MODE 1)
  - description (string, optional): Token description (required for MODE 1)
  - image (string, optional): Absolute local path to image file (MODE 1)
  - video (string, optional): Absolute local path to video file (MODE 1, optional)
  - token_uri (string, optional): Pre-built IPFS metadata URI (MODE 2)
  - tags (array, optional): List of tags e.g. ["art", "generative"]
  - attributes (array, optional): On-chain attributes e.g. ["Series=FRAME OF MIND", "Voice=Dual"]
  - to (string, optional): Recipient address. Defaults to your wallet.
  - royalty_receiver (string, optional): Royalty recipient address. Defaults to your wallet.
  - chain (string, optional): Chain to mint on. Default: sepolia.

Returns:
  - Token ID — save this for auction commands
  - Transaction hash
  - IPFS metadata URI

Note: Always include --tag art for SuperRare compatibility.`,
      inputSchema: z.object({
        contract: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .describe("NFT contract address (0x...)"),
        name: z
          .string()
          .min(1)
          .max(200)
          .optional()
          .describe("Token name (required for local media upload)"),
        description: z
          .string()
          .min(1)
          .optional()
          .describe("Token description (required for local media upload)"),
        image: z
          .string()
          .optional()
          .describe("Absolute path to image file (e.g. D:\\art\\piece.png)"),
        video: z
          .string()
          .optional()
          .describe(
            "Absolute path to video file (e.g. D:\\art\\piece.mp4) — optional"
          ),
        token_uri: z
          .string()
          .startsWith("ipfs://")
          .optional()
          .describe("Pre-built IPFS metadata URI (ipfs://Qm...) for MODE 2"),
        tags: z
          .array(z.string())
          .optional()
          .describe('Tags e.g. ["art", "generative", "techno"]'),
        attributes: z
          .array(z.string())
          .optional()
          .describe(
            'On-chain attributes e.g. ["Series=FRAME OF MIND", "Voice=Dual"]'
          ),
        to: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .optional()
          .describe("Recipient address (default: your configured wallet)"),
        royalty_receiver: z
          .string()
          .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address")
          .optional()
          .describe("Royalty recipient address (default: your configured wallet)"),
        chain: z
          .enum(SUPPORTED_CHAINS)
          .optional()
          .describe("Chain to mint on (default: sepolia)"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: true,
      },
    },
    async ({
      contract,
      name,
      description,
      image,
      video,
      token_uri,
      tags,
      attributes,
      to,
      royalty_receiver,
      chain,
    }) => {
      const args = ["mint", "--contract", contract];

      if (token_uri) {
        // MODE 2 — pre-built URI
        args.push("--token-uri", token_uri);
      } else {
        // MODE 1 — local media
        if (name) args.push("--name", name);
        if (description) args.push("--description", description);
        if (image) args.push("--image", image);
        if (video) args.push("--video", video);
        if (tags) tags.forEach((t) => args.push("--tag", t));
        if (attributes) attributes.forEach((a) => args.push("--attribute", a));
      }

      if (to) args.push("--to", to);
      if (royalty_receiver) args.push("--royalty-receiver", royalty_receiver);
      if (chain) args.push("--chain", chain);

      const result = await runCli(args);
      return {
        content: [{ type: "text", text: formatResult(result) }],
      };
    }
  );
}
