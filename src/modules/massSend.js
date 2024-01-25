const {
  PermissionsBitField,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const axios = require("axios").default;

async function massSend() {
  const nuker = global.client;
  const {
    warning,
    debug,
    error,
    info,
    sleep,
    success,
    input,
    main,
  } = require("../utilities/functions");
  process.title = `${nuker.user.username} | [8 : MASS SEND]`;

  let guild;
  let spamMsg;
  let msgsCount;
  if (nuker.INFO.guildId && nuker.INFO.guildId.length > 0) {
    let fetchedGuild = await nuker.guilds.fetch(nuker.INFO.guildId);

    if (fetchedGuild) {
      guild = fetchedGuild;
    } else {
      return error(`Invalid guild id in config.json`);
    }
  } else {
    const guildIdQuestion = `Guild Id: `;

    var inputQuestion = input(guildIdQuestion);
    while (isNaN(inputQuestion) || !inputQuestion) {
      inputQuestion = input(guildIdQuestion);
    }

    let fetchedGuild = await nuker.guilds.fetch(inputQuestion);

    if (fetchedGuild) {
      guild = fetchedGuild;
    } else {
      return error(`Entered invalid guild id`);
    }
  }

  const deleteRolePerms = guild.members.me.permissions.has(
    PermissionsBitField.Flags.SendMessages ||
      PermissionsBitField.Flags.Administrator
  );
  if (!deleteRolePerms) {
    return error("No SendMessages permission.");
  }

  if (
    nuker.INFO.spamMsg &&
    String(nuker.INFO.spamMsg).length <= 1500 &&
    String(nuker.INFO.spamMsg).length > 0
  ) {
    spamMsg = String(nuker.INFO.spamMsg);

    debug(
      `Set the spam message to: ${spamMsg} (config)`,
      `./src/modules/massSend.js`
    );

    await sleep(1000);
  } else {
    const countQuestion = `Spam Message [1 : 1500]: `;

    var inputQuestion = input(countQuestion);
    while (
      isNaN(inputQuestion) ||
      !inputQuestion ||
      String(inputQuestion).length >= 1500 ||
      String(inputQuestion).length < 0
    ) {
      inputQuestion = input(countQuestion);
    }

    spamMsg = String(inputQuestion);

    debug(
      `Set the spam message to: ${spamMsg} (manual)`,
      `./src/modules/massSend.js`
    );

    await sleep(1000);
  }

  if (
    nuker.INFO.msgsCount &&
    Number(parseInt(nuker.INFO.msgsCount)) <= 150 &&
    Number(parseInt(nuker.INFO.msgsCount)) > 0
  ) {
    msgsCount = Number(parseInt(nuker.INFO.msgsCount));

    debug(
      `Set new spam count to: ${msgsCount} (config)`,
      `./src/modules/massSend.js`
    );

    await sleep(1000);
  } else {
    const countQuestion = `Set channels count [1 : 150]: `;

    var inputQuestion = input(countQuestion);
    while (
      isNaN(inputQuestion) ||
      !inputQuestion ||
      Number(parseInt(inputQuestion)) >= 150 ||
      Number(parseInt(inputQuestion)) < 0
    ) {
      inputQuestion = input(countQuestion);
    }

    spamMsg = Number(parseInt(inputQuestion));

    debug(
      `Set new spam count to: ${msgsCount} (manual)`,
      `./src/modules/massSend.js`
    );

    await sleep(1000);
  }

  const headers = {
    Authorization: `Bot ${client.token}`,
    "Content-Type": "application/json",
  };

  try {
    const channelsToSend = [];
    let fetchedRoles = await axios.get(
      `https://discord.com/api/v10/guilds/${guild.id}/channels`,
      {
        headers,
      }
    );

    if (fetchedRoles.status == 200 && fetchedRoles.statusText == "OK") {
      let channels = fetchedRoles.data;

      if (channels.length == 0) {
        await warning("No channels to spam in.");
      }
      const botRole = guild.members.me.roles.botRole;

      if (!botRole) {
        error(`Bot role not found.`);
        return;
      }
      await channels.filter((channel) => {
        if (channel.permissions && Array.isArray(channel.permissions)) {
          return channel.permissions.some(
            (permission) =>
              permission.id === nuker.user.id &&
              (permission.allow & 2048) === 2048
          );
        }
      });

      for (const ch of channels) {
        channelsToSend.push(ch);
      }
      debug(`Found ${channelsToSend.length} channel(s) to spam in.`);
      try {
        const messagePromises = [];
        channels.forEach((channel) => {
          for (let i = 0; i < msgsCount; i++) {
            const messagePromise = axios.post(
              `https://discord.com/api/v10/channels/${channel.id}/messages`,
              {
                content:
                  spamMsg ||
                  "||@everyone||\nFsociety! for nuking & sources | للاكواد والتهكير\nInv: discord.gg/uxyBuYcgNQ\nYT: https://www.youtube.com/channel/UCAo1iQzDnnQQwt7ftwjmjHA",
              },
              {
                headers,
              }
            );

            messagePromises.push(messagePromise);
          }
        });

        // Use Promise.all to send all messages concurrently
        await Promise.all(messagePromises);

        await success(`Messages sent ${msgsCount} times in all channels.`);
      } catch (err) {
        error(`Error: ${err.message}`);
      }
    }
  } catch (err) {
    if (err.response) {
      error(
        `API Error Status: ${err.response.status}`,
        `./src/modules/massSend.js`
      );
      error(`API Error Data: ${err.response.data}`);
    } else if (err.request) {
      error(
        "No response received from the server",
        `./src/modules/massSend.js`
      );
    } else {
      error(
        `Error setting up the request: ${err.message}`,
        `./src/modules/massSend.js`
      );
    }
  }
}

module.exports = {
  massSend: massSend,
};
