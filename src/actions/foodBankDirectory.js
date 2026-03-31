/**
 * Food Bank Directory
 * In production: integrate with Feeding America API, WhyHunger, or similar
 * Demo: curated list of real food banks with simulated need scores
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DONATIONS_PATH = path.join(__dirname, "../../data/donations.json");

const FOOD_BANKS = [
  { id: "fb_001", name: "Houston Food Bank", city: "Houston", state: "TX", region: ["TX", "houston", "nationwide"], phone: "713-223-3700", email: "donations@houstonfoodbank.org", needScore: 9.2, website: "houstonfoodbank.org", peopleServedAnnually: 800000 },
  { id: "fb_002", name: "Feeding America Greater Chicago", city: "Chicago", state: "IL", region: ["IL", "chicago", "nationwide"], phone: "312-782-9800", email: "info@gcfd.org", needScore: 8.8, website: "gcfd.org", peopleServedAnnually: 700000 },
  { id: "fb_003", name: "Los Angeles Regional Food Bank", city: "Los Angeles", state: "CA", region: ["CA", "los angeles", "la", "nationwide"], phone: "323-234-3030", email: "info@lafoodbank.org", needScore: 8.5, website: "lafoodbank.org", peopleServedAnnually: 600000 },
  { id: "fb_004", name: "City Harvest", city: "New York", state: "NY", region: ["NY", "new york", "nyc", "nationwide"], phone: "646-412-0600", email: "info@cityharvest.org", needScore: 9.0, website: "cityharvest.org", peopleServedAnnually: 1200000 },
  { id: "fb_005", name: "Capital Area Food Bank", city: "Washington", state: "DC", region: ["DC", "washington", "nationwide"], phone: "202-526-5344", email: "info@capitalareafoodbank.org", needScore: 8.3, website: "capitalareafoodbank.org", peopleServedAnnually: 450000 },
  { id: "fb_006", name: "Second Harvest Food Bank of Middle Tennessee", city: "Nashville", state: "TN", region: ["TN", "nashville", "nationwide"], phone: "615-329-3491", email: "info@secondharvestmidtn.org", needScore: 8.1, website: "secondharvestmidtn.org", peopleServedAnnually: 250000 },
  { id: "fb_007", name: "St. Mary's Food Bank", city: "Phoenix", state: "AZ", region: ["AZ", "phoenix", "nationwide"], phone: "602-242-3663", email: "info@firstfoodbank.org", needScore: 8.7, website: "stmarysfoodbank.org", peopleServedAnnually: 350000 },
  { id: "fb_008", name: "Greater Boston Food Bank", city: "Boston", state: "MA", region: ["MA", "boston", "nationwide"], phone: "617-427-5200", email: "info@gbfb.org", needScore: 7.9, website: "gbfb.org", peopleServedAnnually: 140000 },
  { id: "fb_009", name: "Community Food Bank of Southern Arizona", city: "Tucson", state: "AZ", region: ["AZ", "tucson", "nationwide"], phone: "520-622-0525", email: "info@communityfoodbank.org", needScore: 8.9, website: "communityfoodbank.org", peopleServedAnnually: 200000 },
  { id: "fb_010", name: "Food Bank of the Rockies", city: "Denver", state: "CO", region: ["CO", "denver", "nationwide"], phone: "303-371-9250", email: "info@foodbankrockies.org", needScore: 7.8, website: "foodbankrockies.org", peopleServedAnnually: 175000 },
];

class FoodBankDirectory {
  constructor() {
    this._ensureDataDir();
  }

  _ensureDataDir() {
    const dir = path.dirname(DONATIONS_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DONATIONS_PATH)) {
      fs.writeFileSync(DONATIONS_PATH, JSON.stringify([], null, 2));
    }
  }

  search(region, limit = 5) {
    const query = region.toLowerCase();
    const matches = FOOD_BANKS.filter((bank) =>
      bank.region.some((r) => r.toLowerCase().includes(query)) ||
      query === "nationwide" ||
      bank.city.toLowerCase().includes(query) ||
      bank.state.toLowerCase() === query
    );

    // If no region match, return highest need nationally
    const results = matches.length > 0 ? matches : FOOD_BANKS;

    return results
      .sort((a, b) => b.needScore - a.needScore)
      .slice(0, limit)
      .map((bank) => ({
        id: bank.id,
        name: bank.name,
        city: bank.city,
        state: bank.state,
        needScore: bank.needScore,
        contact: bank.email,
        phone: bank.phone,
        website: bank.website,
        annualReach: bank.peopleServedAnnually,
        acceptsGiftCards: true,
      }));
  }

  getById(id) {
    return FOOD_BANKS.find((b) => b.id === id) || null;
  }

  recordDonation(donation) {
    const donations = this.getDonationHistory();
    donations.push(donation);
    fs.writeFileSync(DONATIONS_PATH, JSON.stringify(donations, null, 2));
  }

  getDonationHistory() {
    if (!fs.existsSync(DONATIONS_PATH)) return [];
    return JSON.parse(fs.readFileSync(DONATIONS_PATH, "utf8"));
  }
}

export const foodBankDirectory = new FoodBankDirectory();
export default foodBankDirectory;
