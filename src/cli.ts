import { exec } from "child_process";
import { promisify } from "util";
import { RARE_CLI, MAX_OUTPUT_CHARS } from "./constants.js";

const execAsync = promisify(exec);

export interface CliResult {
  success: boolean;
  output: string;
  error?: string;
}

/**
 * Execute a rare CLI command and return structured output.
 * Uses shell execution for Windows .cmd compatibility.
 */
export async function runCli(args: string[]): Promise<CliResult> {
  try {
    // Quote args that contain spaces, build full command string
    const safeArgs = args.map((a) =>
      a.includes(" ") ? `"${a.replace(/"/g, '\\"')}"` : a
    );
    const cmd = `"${RARE_CLI}" ${safeArgs.join(" ")}`;

    const { stdout, stderr } = await execAsync(cmd, {
      timeout: 120_000, // 2 min timeout for on-chain operations
      maxBuffer: 1024 * 1024, // 1MB buffer
      shell: "cmd.exe",
    });

    const output = stdout.trim();
    const warning = stderr.trim();

    // Truncate if too long
    const truncated =
      output.length > MAX_OUTPUT_CHARS
        ? output.slice(0, MAX_OUTPUT_CHARS) + "\n...[truncated]"
        : output;

    // Include stderr warnings if present (rare-cli sometimes outputs info to stderr)
    const combined = warning
      ? `${truncated}\n\nNote: ${warning}`
      : truncated;

    return { success: true, output: combined };
  } catch (err: unknown) {
    if (err instanceof Error) {
      const execErr = err as Error & { stderr?: string };
      const msg = (execErr.stderr || execErr.message || "Unknown error").trim();
      return {
        success: false,
        output: "",
        error: msg,
      };
    }
    return {
      success: false,
      output: "",
      error: String(err),
    };
  }
}

/**
 * Format CLI result for MCP tool response.
 */
export function formatResult(result: CliResult): string {
  if (result.success) {
    return result.output || "Command completed successfully.";
  }
  return `Error: ${result.error}\n\nTip: Run rare_configure_show to verify your wallet and RPC are configured correctly.`;
}
