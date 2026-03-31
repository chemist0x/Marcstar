/**
 * Beppe Dashboard Server
 * Serves the mission control UI and a REST API for live data
 */

import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import beppe from "../agent/beppe.js";
import { wallet } from "../wallet/wallet.js";
import { missionLog } from "../utils/missionLog.js";
import { foodBankDirectory } from "../actions/foodBankDirectory.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function startDashboard(port = 3000) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "public")));

  // API routes
  app.get("/api/status", (req, res) => {
    res.json(beppe.getStatus());
  });

  app.get("/api/wallet", (req, res) => {
    res.json({
      ...wallet.getSummary(),
      history: wallet.getTransactionHistory(20),
    });
  });

  app.get("/api/donations", (req, res) => {
    res.json(foodBankDirectory.getDonationHistory());
  });

  app.get("/api/mission-log", (req, res) => {
    res.json(missionLog.getLast(20));
  });

  app.post("/api/run-cycle", async (req, res) => {
    try {
      const result = await beppe.think(req.body.message);
      res.json({ success: true, result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.listen(port, () => {
    console.log(`\n🌐 Beppe Dashboard running at http://localhost:${port}\n`);
  });

  // Also start autonomous mode
  beppe.runAutonomously(60);

  return app;
}
