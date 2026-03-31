const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

export const logger = {
  info: (msg, data = null) => {
    console.log(`${colors.cyan}[BEPPE]${colors.reset} ${msg}`);
    if (data) console.log(colors.gray, JSON.stringify(data, null, 2), colors.reset);
  },
  success: (msg) => console.log(`${colors.green}[BEPPE]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[BEPPE]${colors.reset} ${msg}`),
  error: (msg) => console.error(`${colors.red}[BEPPE ERROR]${colors.reset} ${msg}`),
};

export default logger;
