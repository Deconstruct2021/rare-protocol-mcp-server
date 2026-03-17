# rare-protocol-mcp-server

An MCP (Model Context Protocol) server that wraps the [RARE Protocol CLI](https://github.com/superrare/rare-cli), enabling any MCP-compatible AI client to deploy NFT contracts, mint tokens, and run auctions on SuperRare — directly from natural language.

Built for the [Synthesis Hackathon 2026](https://synthesis.md) — sponsored by SuperRare.

> **Note for Synthesis judges:** This server is ready to test. Install rare-cli, configure a Sepolia wallet, add this server to your MCP client, and ask it to deploy a contract and mint an NFT. The full lifecycle works end-to-end.

---

## What is this?

The RARE Protocol powers $300M+ in NFT sales on SuperRare. This MCP server exposes the entire protocol surface as structured AI tools — so agents can:

- Deploy branded ERC-721 collections on Ethereum
- Mint NFTs with IPFS media upload in one step
- Create, bid, settle, and cancel auctions
- Search tokens, auctions, and collections
- Query on-chain contract and token status

**Judges are AI agents. They can use this server to mint an NFT and run an auction during evaluation.**

---

## Prerequisites

Before installing this MCP server, complete these steps in order:

### Step 1 — Install Node.js 22+

Download from [nodejs.org](https://nodejs.org). Verify:

```bash
node --version   # must be v22.x or higher
```

### Step 2 — Install rare-cli globally

```bash
npm install -g @rareprotocol/rare-cli
```

Verify:

```bash
rare --help
```

### Step 3 — Configure your wallet

Import your existing private key (recommended: use a dedicated hot wallet, not your main wallet):

```bash
rare configure --chain sepolia --private-key 0xYOUR_PRIVATE_KEY --rpc-url https://YOUR_RPC_URL
rare configure --default-chain sepolia
```

Get a free RPC URL from [Alchemy](https://alchemy.com) or [Infura](https://infura.io) — public endpoints are rate-limited.

Get free Sepolia testnet ETH from [sepoliafaucet.com](https://sepoliafaucet.com).

Verify your setup:

```bash
rare configure --show
rare wallet address
```

### Step 4 — Install Claude Desktop or Claude Code

- **Claude Desktop**: Download from [claude.ai/download](https://claude.ai/download)
- **Claude Code**: `npm install -g @anthropic-ai/claude-code`

Once all four steps are complete, install this MCP server.

---

## Installation

```bash
git clone https://github.com/Deconstruct2021/rare-protocol-mcp-server
cd rare-protocol-mcp-server
npm install
npm run build
```

---

## Configuration

### Claude Desktop

Find your config file:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `C:\Users\YOU\AppData\Roaming\Claude\claude_desktop_config.json`

Add the `rare-protocol` entry:

```json
{
  "mcpServers": {
    "rare-protocol": {
      "command": "node",
      "args": ["/path/to/rare-protocol-mcp-server/dist/index.js"],
      "env": {
        "RARE_CLI_PATH": "/usr/local/bin/rare"
      }
    }
  }
}
```

**Windows users** — use full paths with double backslashes:

```json
{
  "mcpServers": {
    "rare-protocol": {
      "command": "node",
      "args": ["C:\\Users\\YOU\\rare-protocol-mcp-server\\dist\\index.js"],
      "env": {
        "RARE_CLI_PATH": "C:\\Users\\YOU\\AppData\\Roaming\\npm\\rare.cmd"
      }
    }
  }
}
```

Find your `RARE_CLI_PATH` by running:

```bash
where rare        # Windows
which rare        # macOS / Linux
```

Fully quit and restart Claude Desktop after saving the config.

### Claude Code

```bash
claude mcp add rare-protocol node /path/to/rare-protocol-mcp-server/dist/index.js
```

---

## Switching Between Sepolia and Mainnet

This server defaults to **Sepolia testnet** — safe for testing with no real funds at risk.

### To switch to mainnet permanently

```bash
rare configure --default-chain mainnet
rare configure --chain mainnet --rpc-url https://YOUR_MAINNET_RPC_URL
```

Get a mainnet RPC URL from [Alchemy](https://alchemy.com) — create a new app and select **Ethereum Mainnet**.

### To use mainnet for a single request

Just say "on mainnet" in your request and the agent will pass `--chain mainnet` automatically:

> "Deploy a collection called 'YOUR COLLECTION NAME' with symbol 'SYMBL' on mainnet"

### Important before going mainnet

- Make sure your wallet has real ETH for gas (0.1 ETH is enough for several operations)
- Always do a full test run on Sepolia first
- Double-check all parameters — on-chain transactions are irreversible

---

## Tools

| Tool | Description | Read-only |
|------|-------------|-----------|
| `rare_configure_show` | Show wallet and RPC config | ✓ |
| `rare_wallet_address` | Get configured wallet address | ✓ |
| `rare_deploy_contract` | Deploy ERC-721 collection | |
| `rare_import_contract` | Import existing contract into registry | |
| `rare_mint_nft` | Mint NFT with local media or IPFS URI | |
| `rare_auction_create` | Create reserve price auction | |
| `rare_auction_bid` | Place auction bid | |
| `rare_auction_settle` | Settle completed auction | |
| `rare_auction_cancel` | Cancel auction (no bids only) | |
| `rare_auction_status` | Check auction state | ✓ |
| `rare_search_tokens` | Search NFTs | ✓ |
| `rare_search_auctions` | Search auctions by state | ✓ |
| `rare_search_collections` | Search collections | ✓ |
| `rare_status` | Query contract/token on-chain status | ✓ |

---

## Example Agent Workflow

Ask any MCP-compatible AI client:

> "Deploy a new NFT collection called 'FRAME OF MIND' with symbol 'FOM' on Sepolia, mint a piece called 'Arrival' with the image at /art/arrival.png, then create a 24-hour auction with a 0.1 ETH reserve."

The agent will:
1. Call `rare_configure_show` — verify wallet and chain
2. Call `rare_deploy_contract` — get contract address
3. Call `rare_mint_nft` — get token ID
4. Call `rare_auction_create` — auction live on-chain

No code. No UI. Pure natural language to on-chain.

---

## Supported Chains

| Chain | Deploy + Auction | Wallet + Search |
|-------|-----------------|-----------------|
| mainnet | ✓ | ✓ |
| sepolia | ✓ | ✓ |
| base | | ✓ |
| base-sepolia | | ✓ |
| arbitrum | | ✓ |
| optimism | | ✓ |
| zora | | ✓ |

---

## Contract Addresses

| Contract | Mainnet | Sepolia |
|----------|---------|---------|
| Factory | `0xAe8E375a268Ed6442bEaC66C6254d6De5AeD4aB1` | `0x3c7526a0975156299ceef369b8ff3c01cc670523` |
| Auction | `0x6D7c44773C52D396F43c2D511B81aa168E9a7a42` | `0xC8Edc7049b233641ad3723D6C60019D1c8771612` |

---

## Security

- Private keys are stored in `~/.rare/config.json` — never in this server
- All destructive tools (mint, auction, deploy) require explicit agent invocation
- Always test on Sepolia before mainnet
- Never share your `~/.rare/config.json`
- Use a dedicated hot wallet — never your main wallet

---

## Development

```bash
npm run dev    # run with tsx (no build step)
npm run build  # compile TypeScript
npm start      # run compiled server
```

Test with MCP Inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

---

## Project Structure

```
src/
├── index.ts          # Server entry point
├── constants.ts      # Chain addresses, CLI path
├── cli.ts            # rare-cli execution utility
└── tools/
    ├── wallet.ts     # configure_show, wallet_address
    ├── deploy.ts     # deploy_contract, import_contract
    ├── mint.ts       # mint_nft
    ├── auction.ts    # auction_create/bid/settle/cancel/status
    └── search.ts     # search_tokens/auctions/collections, status
```

---

## Built by

[DECONSTRUCT LAB](https://superrare.com/deconstruct) — Generative audiovisual artist on SuperRare.

Built for the Synthesis Hackathon 2026.

---

## License

MIT
