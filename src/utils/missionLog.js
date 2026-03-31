import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_PATH = path.join(__dirname, "../../data/mission_log.json");

class MissionLog {
  constructor() {
    const dir = path.dirname(LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(LOG_PATH)) fs.writeFileSync(LOG_PATH, "[]");
  }

  record(entry) {
    const log = this.getAll();
    log.push(entry);
    fs.writeFileSync(LOG_PATH, JSON.stringify(log, null, 2));
  }

  getAll() {
    try {
      return JSON.parse(fs.readFileSync(LOG_PATH, "utf8"));
    } catch {
      return [];
    }
  }

  getLast(n = 10) {
    return this.getAll().slice(-n).reverse();
  }
}

export const missionLog = new MissionLog();
export default missionLog;
