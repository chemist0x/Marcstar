/**
 * BEPPE Action Registry
 * All tools available to Beppe's autonomous agent loop
 */

import { wallet } from "../wallet/wallet.js";
import { foodBankDirectory } from "./foodBankDirectory.js";
import { giftCardPurchaser } from "./giftCardPurchaser.js";
import { logger } from "../utils/logger.js";

export class ActionRegistry {
  getToolDefinitions() {
    return [
      {
        name: "check_wallet",
        description: "Check current wallet balance, spending limits, and recent transactions",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "find_food_banks",
        description: "Find food banks in a region sorted by need score. Returns name, location, contact, and current need level.",
        input_schema: {
          type: "object",
          properties: {
            region: {
              type: "string",
              description: "US state abbreviation or city name (e.g. 'TX', 'Chicago', 'nationwide')",
            },
            limit: {
              type: "number",
              description: "Max number of food banks to return (default 5)",
            },
          },
          required: ["region"],
        },
      },
      {
        name: "purchase_gift_card",
        description: "Purchase a digital grocery gift card from a retailer. Returns a gift card code.",
        input_schema: {
          type: "object",
          properties: {
            retailer: {
              type: "string",
              enum: ["walmart", "kroger", "safeway", "whole_foods", "target", "aldi"],
              description: "The grocery retailer to purchase from",
            },
            amount: {
              type: "number",
              description: "Dollar amount for the gift card (min $10, max $500)",
            },
          },
          required: ["retailer", "amount"],
        },
      },
      {
        name: "donate_gift_card",
        description: "Send a gift card code to a food bank via their donation portal or email",
        input_schema: {
          type: "object",
          properties: {
            food_bank_id: {
              type: "string",
              description: "The ID of the food bank from find_food_banks",
            },
            gift_card_code: {
              type: "string",
              description: "The gift card code to donate",
            },
            retailer: {
              type: "string",
              description: "The retailer the gift card is from",
            },
            amount: {
              type: "number",
              description: "Dollar value of the gift card",
            },
          },
          required: ["food_bank_id", "gift_card_code", "retailer", "amount"],
        },
      },
      {
        name: "get_mission_stats",
        description: "Get overall mission statistics: total donated, meals funded, food banks helped",
        input_schema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      {
        name: "simulate_earnings",
        description: "Simulate earning income through Beppe's revenue mechanisms (affiliate links, donations, grants). Credits the wallet.",
        input_schema: {
          type: "object",
          properties: {
            source: {
              type: "string",
              enum: ["affiliate", "public_donation", "grant", "staking_reward"],
              description: "The income source",
            },
          },
          required: ["source"],
        },
      },
    ];
  }

  async execute(toolName, input) {
    logger.info(`Executing: ${toolName}`, input);

    switch (toolName) {
      case "check_wallet":
        return this._checkWallet();
      case "find_food_banks":
        return this._findFoodBanks(input);
      case "purchase_gift_card":
        return this._purchaseGiftCard(input);
      case "donate_gift_card":
        return this._donateGiftCard(input);
      case "get_mission_stats":
        return this._getMissionStats();
      case "simulate_earnings":
        return this._simulateEarnings(input);
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async _checkWallet() {
    const summary = wallet.getSummary();
    const history = wallet.getTransactionHistory(5);
    return {
      success: true,
      wallet: summary,
      recentTransactions: history,
    };
  }

  async _findFoodBanks({ region, limit = 5 }) {
    const banks = foodBankDirectory.search(region, limit);
    return {
      success: true,
      region,
      foodBanks: banks,
      count: banks.length,
    };
  }

  async _purchaseGiftCard({ retailer, amount }) {
    if (amount < 10 || amount > 500) {
      return { success: false, error: "Amount must be between $10 and $500" };
    }

    if (!wallet.canAfford(amount)) {
      return {
        success: false,
        error: `Insufficient funds. Balance: $${wallet.getBalance().toFixed(2)}`,
      };
    }

    // Simulate gift card purchase
    const code = giftCardPurchaser.purchase(retailer, amount);
    const tx = wallet.debit(amount, `Gift card purchase: ${retailer} $${amount}`);

    logger.success(`💳 Purchased $${amount} ${retailer} gift card`);

    return {
      success: true,
      giftCard: {
        code,
        retailer,
        amount,
        transactionId: tx.id,
      },
      newBalance: wallet.getBalance(),
    };
  }

  async _donateGiftCard({ food_bank_id, gift_card_code, retailer, amount }) {
    const foodBank = foodBankDirectory.getById(food_bank_id);
    if (!foodBank) {
      return { success: false, error: `Food bank ${food_bank_id} not found` };
    }

    // Simulate donation delivery
    const estimatedMeals = Math.floor(amount / 2.5); // ~$2.50/meal average
    const donationRecord = {
      id: `don_${Date.now()}`,
      foodBankId: food_bank_id,
      foodBankName: foodBank.name,
      foodBankCity: foodBank.city,
      giftCardCode: gift_card_code,
      retailer,
      amount,
      estimatedMeals,
      deliveredAt: new Date().toISOString(),
      status: "delivered",
    };

    // Record in a donations log
    foodBankDirectory.recordDonation(donationRecord);

    logger.success(`🎁 Donated $${amount} ${retailer} gift card to ${foodBank.name}`);
    logger.success(`🍽️  Estimated ${estimatedMeals} meals funded`);

    return {
      success: true,
      donation: donationRecord,
      message: `Successfully donated $${amount} to ${foodBank.name} in ${foodBank.city}. Estimated ${estimatedMeals} meals funded.`,
    };
  }

  async _getMissionStats() {
    const walletSummary = wallet.getSummary();
    const donations = foodBankDirectory.getDonationHistory();
    const totalMeals = donations.reduce((sum, d) => sum + d.estimatedMeals, 0);
    const foodBanksHelped = new Set(donations.map((d) => d.foodBankId)).size;

    return {
      success: true,
      stats: {
        totalDonated: walletSummary.totalDonated,
        currentBalance: walletSummary.balance,
        totalMealsFunded: totalMeals,
        foodBanksHelped,
        donationCount: donations.length,
        missionStarted: "2025-01-01T00:00:00Z",
      },
    };
  }

  async _simulateEarnings({ source }) {
    const earningMap = {
      affiliate: { min: 5, max: 50 },
      public_donation: { min: 10, max: 200 },
      grant: { min: 100, max: 1000 },
      staking_reward: { min: 1, max: 20 },
    };

    const range = earningMap[source];
    const amount = +(Math.random() * (range.max - range.min) + range.min).toFixed(2);
    const tx = wallet.credit(amount, `Income: ${source}`, source);

    return {
      success: true,
      earned: amount,
      source,
      transactionId: tx.id,
      newBalance: wallet.getBalance(),
    };
  }
}
