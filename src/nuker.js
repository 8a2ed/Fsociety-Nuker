const {
  warning,
  debug,
  error,
  info,
  sleep,
  success,
  input,
  main,
} = require("./utilities/functions");
const config = require("./config.json");

const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  ActivityType,
} = require("discord.js");
const gradient = require("gradient-string");

console.clear();
const nuker = new Client({
  intents: Object.keys(GatewayIntentBits)
    .filter((a) => isNaN(a))
    .map((a) => GatewayIntentBits[a]),
  partials: Object.keys(Partials)
    .filter((a) => isNaN(a))
    .map((a) => Partials[a]),
  presence: {
    status: "dnd",
  },
});

global.client = nuker;

const loadConfigQuestion = `Load config for ./src/config.json? [Y]es/[N]o/[E]xit`;

var inputQuestion = input(loadConfigQuestion);
while (
  inputQuestion.toLowerCase() !== "y" &&
  inputQuestion.toLowerCase() !== "n" &&
  inputQuestion.toLowerCase() !== "e"
) {
  inputQuestion = input(loadConfigQuestion);
}

if (inputQuestion.toLowerCase() === "e") {
  success(`Exiting...`);
  process.exit();
} else if (inputQuestion.toLowerCase() === "y") {
  try {
    nuker.INFO = config;
  } catch (error) {
    return error(`Failed to load config. | ${error}`, "src/nuker.js");
  }
} else {
  try {
    var tokenQuestion = input(`Bot token: `);
  } catch (err) {}
}

const token = nuker.INFO.token || input(`\nBot Token: `);
info(`Logging in...`);
nuker.login(token).catch(async (err) => {
  error(`Failed to login. | ${err}`, "src/nuker.js");
  error(`Exiting...`);
  await sleep(2000);
  require("process").exit(1);
});

nuker.on("ready", async () => {
  process.title = `${nuker.user.tag} | Currently in: ${nuker.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
  await success(`Logged in ${nuker.user.tag}!`);
  await sleep(3000);
  await main();
});
