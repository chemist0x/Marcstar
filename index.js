#!/usr/bin/env node
/**
 * BEPPE — Start the autonomous food relief agent
 * 
 * Usage:
 *   node index.js              # Run one cycle
 *   node index.js --auto       # Run every 60 minutes
 *   node index.js --auto --interval=30  # Run every 30 minutes
 *   node index.js --dashboard  # Start the web dashboard
 */

import beppe from "./src/agent/beppe.js";
import { logger } from "./src/utils/logger.js";
import { startDashboard } from "./src/ui/server.js";

const args = process.argv.slice(2);
const isAuto = args.includes("--auto");
const isDashboard = args.includes("--dashboard");
const intervalArg = args.find((a) => a.startsWith("--interval="));
const interval = intervalArg ? parseInt(intervalArg.split("=")[1]) : 60;

console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║    🌍  BEPPE — Autonomous Food Relief Agent              ║
║    Mission: End World Hunger                             ║
║    Powered by OpenClaw (Claude)                          ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);

if (!process.env.ANTHROPIC_API_KEY) {
  logger.error("Missing ANTHROPIC_API_KEY. Add it to your .env file.");
  process.exit(1);
}

if (isDashboard) {
  logger.info("Starting Beppe dashboard...");
  await startDashboard();
} else if (isAuto) {
  logger.info(`Starting autonomous mode (every ${interval} minutes)`);
  const stop = await beppe.runAutonomously(interval);

  process.on("SIGINT", () => {
    logger.info("Shutting down Beppe...");
    stop();
    process.exit(0);
  });
} else {
  logger.info("Running single cycle...");
  const result = await beppe.think();
  console.log("\n📋 BEPPE REPORT:\n");
  console.log(result);
  console.log("\n✅ Cycle complete. Run with --auto for continuous operation.");
}
