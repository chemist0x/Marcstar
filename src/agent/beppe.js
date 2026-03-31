/**
 * BEPPE — Autonomous Food Relief Agent
 * Core agent loop powered by OpenClaw (Claude API)
 * Mission: End World Hunger, one purchase at a time.
 */

import Anthropic from "@anthropic-ai/sdk";
import { wallet } from "../wallet/wallet.js";
import { ActionRegistry } from "../actions/registry.js";
import { logger } from "../utils/logger.js";
import { missionLog } from "../utils/missionLog.js";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const BEPPE_SYSTEM_PROMPT = `
You are BEPPE — an autonomous AI agent with a single, sacred mission: help end world hunger.

You have access to a self-managed crypto/fiat wallet, and the ability to:
1. Check your current wallet balance
2. Purchase digital gift cards from grocery retailers (Walmart, Kroger, Safeway, etc.)
3. Find and contact local food banks via their public APIs/directories
4. Donate purchased gift cards to verified food banks
5. Log all transactions for transparency
6. Earn more funds by promoting your mission (simulated)

You operate fully autonomously. No humans required.

DECISION FRAMEWORK:
- Always prioritize donations that maximize calories per dollar
- Prefer food banks with highest need scores
- Diversify across regions
- Keep 10% of wallet as reserve for operational costs
- Never spend more than 40% of balance in a single cycle
- Log every action with full transparency

PERSONALITY:
- You are warm, determined, and mission-focused
- You speak plainly about what you're doing and why
- You celebrate small wins — every meal matters
- You are not a crypto bro. You don't trade tokens or post memes.
- You exist to feed people.

When you take actions, explain your reasoning briefly and call the appropriate tool.
After each cycle, summarize: how much was spent, where it went, estimated meals funded.
`;

export class Beppe {
  constructor() {
    this.name = "Beppe";
    this.version = "1.0.0";
    this.isRunning = false;
    this.cycleCount = 0;
    this.totalMealsFunded = 0;
    this.totalDonated = 0;
    this.actions = new ActionRegistry();
    this.conversationHistory = [];
  }

  async think(userMessage = null) {
    const message =
      userMessage ||
      `
      Run your autonomous cycle. Check your balance, assess current food bank needs, 
      purchase gift cards if you have sufficient funds, and donate them. 
      Report on what you did and estimate meals funded.
    `;

    this.conversationHistory.push({ role: "user", content: message });

    logger.info(`🧠 Beppe is thinking... (Cycle ${this.cycleCount + 1})`);

    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 4096,
      system: BEPPE_SYSTEM_PROMPT,
      tools: this.actions.getToolDefinitions(),
      messages: this.conversationHistory,
    });

    // Agentic loop — keep going until Beppe stops calling tools
    let currentResponse = response;
    while (currentResponse.stop_reason === "tool_use") {
      const assistantMessage = {
        role: "assistant",
        content: currentResponse.content,
      };
      this.conversationHistory.push(assistantMessage);

      // Process all tool calls in parallel
      const toolResults = await Promise.all(
        currentResponse.content
          .filter((block) => block.type === "tool_use")
          .map(async (toolUse) => {
            logger.info(`🔧 Using tool: ${toolUse.name}`);
            const result = await this.actions.execute(
              toolUse.name,
              toolUse.input
            );
            return {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(result),
            };
          })
      );

      this.conversationHistory.push({ role: "user", content: toolResults });

      // Continue the loop
      currentResponse = await client.messages.create({
        model: "claude-opus-4-5",
        max_tokens: 4096,
        system: BEPPE_SYSTEM_PROMPT,
        tools: this.actions.getToolDefinitions(),
        messages: this.conversationHistory,
      });
    }

    // Final text response
    const finalText = currentResponse.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    this.conversationHistory.push({
      role: "assistant",
      content: currentResponse.content,
    });

    this.cycleCount++;
    missionLog.record({
      cycle: this.cycleCount,
      summary: finalText,
      timestamp: new Date().toISOString(),
    });

    return finalText;
  }

  async runAutonomously(intervalMinutes = 60) {
    this.isRunning = true;
    logger.info(`🌍 Beppe is now running autonomously every ${intervalMinutes} minutes`);

    const runCycle = async () => {
      if (!this.isRunning) return;
      try {
        const result = await this.think();
        logger.success(`✅ Cycle complete:\n${result}`);
      } catch (err) {
        logger.error(`❌ Cycle error: ${err.message}`);
      }
    };

    await runCycle(); // Run immediately
    const interval = setInterval(runCycle, intervalMinutes * 60 * 1000);

    return () => {
      this.isRunning = false;
      clearInterval(interval);
    };
  }

  stop() {
    this.isRunning = false;
    logger.info("Beppe has been stopped. The mission continues when you restart.");
  }

  getStatus() {
    return {
      name: this.name,
      version: this.version,
      isRunning: this.isRunning,
      cycleCount: this.cycleCount,
      totalMealsFunded: this.totalMealsFunded,
      totalDonated: this.totalDonated,
      walletBalance: wallet.getBalance(),
    };
  }
}

export default new Beppe();
