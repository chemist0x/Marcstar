/**
 * BEPPE Wallet — Self-managed financial layer
 * Handles balance tracking, transaction history, and spending limits
 * 
 * In production: integrate with Stripe, Coinbase Commerce, or similar
 * For demo: uses a local JSON ledger
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LEDGER_PATH = path.join(__dirname, "../../data/ledger.json");

const DEFAULT_LEDGER = {
  balance: 500.00, // Starting balance in USD (demo)
  currency: "USD",
  transactions: [],
  totalDonated: 0,
  totalEarned: 500.00,
  createdAt: new Date().toISOString(),
};

class Wallet {
  constructor() {
    this._ensureDataDir();
    this.ledger = this._loadLedger();
  }

  _ensureDataDir() {
    const dir = path.dirname(LEDGER_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  _loadLedger() {
    if (!fs.existsSync(LEDGER_PATH)) {
      fs.writeFileSync(LEDGER_PATH, JSON.stringify(DEFAULT_LEDGER, null, 2));
      return { ...DEFAULT_LEDGER };
    }
    return JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
  }

  _saveLedger() {
    fs.writeFileSync(LEDGER_PATH, JSON.stringify(this.ledger, null, 2));
  }

  getBalance() {
    return this.ledger.balance;
  }

  getSpendingLimit() {
    // Never spend more than 40% in one cycle, keep 10% reserve
    const reserve = this.ledger.balance * 0.1;
    const maxSpend = (this.ledger.balance - reserve) * 0.4;
    return Math.max(0, maxSpend);
  }

  canAfford(amount) {
    return this.ledger.balance - amount >= this.ledger.balance * 0.1;
  }

  debit(amount, description, recipient = null) {
    if (!this.canAfford(amount)) {
      throw new Error(`Insufficient funds. Balance: $${this.ledger.balance.toFixed(2)}, Requested: $${amount}`);
    }

    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "debit",
      amount,
      description,
      recipient,
      balanceBefore: this.ledger.balance,
      balanceAfter: this.ledger.balance - amount,
      timestamp: new Date().toISOString(),
    };

    this.ledger.balance -= amount;
    this.ledger.transactions.push(tx);

    if (recipient) {
      this.ledger.totalDonated += amount;
    }

    this._saveLedger();
    return tx;
  }

  credit(amount, description, source = null) {
    const tx = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: "credit",
      amount,
      description,
      source,
      balanceBefore: this.ledger.balance,
      balanceAfter: this.ledger.balance + amount,
      timestamp: new Date().toISOString(),
    };

    this.ledger.balance += amount;
    this.ledger.totalEarned += amount;
    this.ledger.transactions.push(tx);
    this._saveLedger();
    return tx;
  }

  getTransactionHistory(limit = 20) {
    return this.ledger.transactions.slice(-limit).reverse();
  }

  getSummary() {
    return {
      balance: this.ledger.balance,
      currency: this.ledger.currency,
      totalDonated: this.ledger.totalDonated,
      totalEarned: this.ledger.totalEarned,
      transactionCount: this.ledger.transactions.length,
      spendingLimit: this.getSpendingLimit(),
    };
  }
}

export const wallet = new Wallet();
export default wallet;
