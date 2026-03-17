// Supported chains for rare-cli
export const SUPPORTED_CHAINS = [
  "mainnet",
  "sepolia",
  "base",
  "base-sepolia",
  "arbitrum",
  "arbitrum-sepolia",
  "optimism",
  "optimism-sepolia",
  "zora",
  "zora-sepolia",
] as const;

export type Chain = (typeof SUPPORTED_CHAINS)[number];

// Chains with full protocol support (deploy + auction)
export const FULL_SUPPORT_CHAINS = ["mainnet", "sepolia"] as const;

// Contract addresses
export const CONTRACT_ADDRESSES = {
  mainnet: {
    factory: "0xAe8E375a268Ed6442bEaC66C6254d6De5AeD4aB1",
    auction: "0x6D7c44773C52D396F43c2D511B81aa168E9a7a42",
  },
  sepolia: {
    factory: "0x3c7526a0975156299ceef369b8ff3c01cc670523",
    auction: "0xC8Edc7049b233641ad3723D6C60019D1c8771612",
  },
} as const;

// CLI binary — uses RARE_CLI_PATH env var if set, otherwise tries system PATH
// Windows users: set RARE_CLI_PATH=C:\Users\YOU\AppData\Roaming\npm\rare.cmd
export const RARE_CLI = process.env["RARE_CLI_PATH"] ?? "rare";

// Max output characters before truncation
export const MAX_OUTPUT_CHARS = 8000;
