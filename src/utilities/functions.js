const chalk = require("chalk");
const prompt = require("prompt-sync")();
const gradient = require("gradient-string");

const pipe = chalk.dim(chalk.gray("|"));
const left = chalk.dim(chalk.gray("["));
const right = chalk.dim(chalk.gray("]"));

const { AlignmentEnum, AsciiTable3 } = require("ascii-table3");

// Modules
const { deleteAllChannels } = require("../modules/deleteAllChannels");
const { deleteAllRoles } = require("../modules/deleteAllRoles");
const { deleteAllEmojis } = require("../modules/deleteAllEmojis");
const { deleteAllInvites } = require("../modules/deleteAllInvites");
const { deleteAllWebhooks } = require("../modules/deleteAllWebhooks");
const { massCreateChannels } = require("../modules/massCreateChannels");
const { massCreateRoles } = require("../modules/massCreateRoles");
const { massSend } = require("../modules/massSend");
const { massSendWebhooks } = require("../modules/massSendWebhooks");
const { removeAutomodRules } = require("../modules/removeAutomodRules");
// const { } = require('../modules/')

function getDate() {
  const date = new Date();

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: true,
  };

  return new Intl.DateTimeFormat("en-US", options)
    .format(date)
    .replace(",", "");
}

function log(level, message, path) {
  const levels = {
    info: {
      icon: "?",
      color: chalk.white,
    },
    success: {
      icon: "$",
      color: chalk.green,
    },
    warning: {
      icon: "*",
      color: chalk.yellow,
    },
    error: {
      icon: "!",
      color: chalk.red,
    },
    debug: {
      icon: "i",
      color: chalk.cyan,
    },
  };

  const levelInfo = levels[level] || levels.info;

  const formattedDate = chalk.dim(chalk.white(`${left}${getDate()}${right}`));

  console.log(
    levelInfo.color(
      `${formattedDate} ${left}${levelInfo.icon}${right} ${pipe} ${chalk.bold(
        message
      )}${path ? ` ${pipe} ${path}` : ""}`
    )
  );
}

function input(message) {
  return prompt(
    chalk.white(
      `${left}${getDate()}${right} ${left}>${right} ${pipe}${
        message ? ` ${message}` : ""
      } >>> `
    )
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const roundedStyle = {
  name: "rounded",
  borders: {
    top: {
      left: "┏",
      center: "━",
      right: "┓",
      colSeparator: "┳",
    },
    middle: {
      left: "┃",
      center: "━",
      right: "┃",
      colSeparator: "╋",
    },
    bottom: {
      left: "┗",
      center: "━",
      right: "┛",
      colSeparator: "┻",
    },
    data: {
      left: "┃",
      center: " ",
      right: "┃",
      colSeparator: "┃",
    },
  },
};

async function gradientText(text) {
  let gradientText = gradient(["#7129FF", "#7129FF"]);

  return gradientText(text);
}

async function main() {
  var table = new AsciiTable3("Available Options")
    .addStyle(roundedStyle)
    .setHeading(
      `${await gradientText(`#`)}`,
      `${await gradientText(`Option`)}`,
      `${await gradientText(`#`)}`,
      `${await gradientText(`Option`)}`,
      `${await gradientText(`#`)}`,
      `${await gradientText(`Option`)}`
    )
    .setHeadingAlign(AlignmentEnum.CENTER)
    .setStyle("rounded")
    .setAlignCenter()
    .setAlign(1, AlignmentEnum.CENTER)
    .setAlign(2, AlignmentEnum.CENTER)
    .setAlign(3, AlignmentEnum.CENTER)
    .setAlign(4, AlignmentEnum.CENTER)
    .setTitleAlignCenter()
    .setHeadingAlignCenter()
    .addRowMatrix([
      [
        `${left}1${right}`,
        `${await gradientText(`Delete All Channels`)}`,
        `${left}9${right}`,
        `${await gradientText(`Mass Send (Webhooks)`)}`,
        `${left}17${right}`,
        `${await gradientText(`Change Guild Info`)}`,
      ],
      [
        `${left}2${right}`,
        `${await gradientText(`Delete All Roles`)}`,
        `${left}10${right}`,
        `${await gradientText(`Remove Automod Rules`)}`,
        `${left}18${right}`,
        `${await gradientText(`Leave Guild`)}`,
      ],
      [
        `${left}3${right}`,
        `${await gradientText(`Delete All Emojis`)}`,
        `${left}11${right}`,
        `${await gradientText(`Grant Everyone Admin`)}`,
        `${left}19${right}`,
        `${await gradientText(`Prune Guild`)}`,
      ],
      [
        `${left}4${right}`,
        `${await gradientText(`Delete All Invites`)}`,
        `${left}12${right}`,
        `${await gradientText(`Nickname Everyone`)}`,
        `${left}20${right}`,
        `${await gradientText(`Give Admin Role`)}`,
      ],
      [
        `${left}5${right}`,
        `${await gradientText(`Delete All Webhooks`)}`,
        `${left}13${right}`,
        `${await gradientText(`Kick Everyone`)}`,
        `${left}21${right}`,
        `${await gradientText(`DM Members`)}`,
      ],
      [
        `${left}6${right}`,
        `${await gradientText(`Mass Create Channels`)}`,
        `${left}14${right}`,
        `${await gradientText(`Ban Everyone`)}`,
        `${left}21${right}`,
        `${await gradientText(`Mass Create Webhooks`)}`,
      ],
      [
        `${left}7${right}`,
        `${await gradientText(`Mass Create Roles`)}`,
        `${left}15${right}`,
        `${await gradientText(`Unban Everyone`)}`,
        `${left}22${right}`,
        `${chalk.bold.red(`. . . . . . . . . . . . .`)}`,
      ],
      [
        `${left}8${right}`,
        `${await gradientText(`Mass Send`)}`,
        `${left}16${right}`,
        `${await gradientText(`Set Bot Activity`)}`,
        `${left}23${right}`,
        `${chalk.bold.red(`. . . . . . . . . . . . .`)}`,
      ],
    ]);

  console.log(
    await gradientText(`\n\n
       ▄████████    ▄████████  ▄██████▄   ▄████████  ▄█     ▄████████     ███     ▄██   ▄   
      ███    ███   ███    ███ ███    ███ ███    ███ ███    ███    ███ ▀█████████▄ ███   ██▄ 
      ███    █▀    ███    █▀  ███    ███ ███    █▀  ███▌   ███    █▀     ▀███▀▀██ ███▄▄▄███ 
     ▄███▄▄▄       ███        ███    ███ ███        ███▌  ▄███▄▄▄         ███   ▀ ▀▀▀▀▀▀███ 
    ▀▀███▀▀▀     ▀███████████ ███    ███ ███        ███▌ ▀▀███▀▀▀         ███     ▄██   ███ 
      ███                 ███ ███    ███ ███    █▄  ███    ███    █▄      ███     ███   ███ 
      ███           ▄█    ███ ███    ███ ███    ███ ███    ███    ███     ███     ███   ███ 
      ███         ▄████████▀   ▀██████▀  ████████▀  █▀     ██████████    ▄████▀    ▀█████▀  \n
                               Discord: discord.gg/uxyBuYcgNQ
                                      Press (e) to exit.`)
  );
  console.log(`\n${table.toString()}`);

  let numbers = {
    1: "deleteAllChannels.js",
    2: "deleteAllRoles.js",
    3: "deleteAllEmojis.js",
    4: "deleteAllInvites.js",
    5: "deleteAllWebhooks.js",
    6: "massCreateChannels.js",
    7: "massCreateRoles.js",
    8: "massSendBot.js",
    9: "massSendWebhooks.js",
    10: "removeAutomodRules.js",
    11: "grantEveryoneAdmin.js",
    12: "nicknameEveryone.js",
    13: "kickEveryone.js",
    14: "banEveryone.js",
    15: "unbanEveryone.js",
    16: "setBotActivity.js",
    17: "changeGuildInfo.js",
    18: "leaveGuild.js",
    19: "pruneGuild.js",
    20: "giveAdminRole.js",
    21: "dmMembers.js",
  };
  const optionQuestion = `Enter an option`;

  var inputQuestion = input(optionQuestion);
  while (!numbers[Number(parseInt(inputQuestion))] && inputQuestion != "e") {
    inputQuestion = input(optionQuestion);
  }

  switch (inputQuestion) {
    case "1": {
      deleteAllChannels()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/deleteAllChannels.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }

    case "2": {
      deleteAllRoles()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/deleteAllRoles.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "3": {
      deleteAllEmojis()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/deleteAllEmojis.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "4": {
      deleteAllInvites()
        .then(async () => {
          await sleep(3000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/deleteAllInvites.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "5": {
      deleteAllWebhooks()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/deleteAllWebhooks.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "6": {
      massCreateChannels()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/massCreateChannels.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "7": {
      massCreateRoles()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/massCreateRoles.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "8": {
      massSend()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/massSend.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "9": {
      massSendWebhooks()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/massSendWebhooks.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "10": {
      removeAutomodRules()
        .then(async () => {
          await sleep(2000);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;
          main();
        })
        .catch(async (err) => {
          log("error", err, "src/modules/removeAutomodRules.js");
          await sleep(1500);
          process.title = `${global.client.user.tag} | Currently in: ${global.client.guilds.cache.size} Guild(s) | Fosicety Nuker.`;

          main();
        });

      break;
    }
    case "e": {
      console.log("Exiting... Dont forget to join our server!");
      await sleep(3000);
      require("process").exit(1);
    }

    default: {
      log("error", "This option is't valid.");
      await sleep(1500);
      main();
      break;
    }
  }
}
module.exports = {
  info: (message, path) => log("info", message, path),
  success: (message, path) => log("success", message, path),
  warning: (message, path) => log("warning", message, path),
  error: (message, path) => log("error", message, path),
  debug: (message, path) => log("debug", message, path),
  input,
  sleep,
  main,
};
