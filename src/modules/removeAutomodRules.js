const {
  PermissionsBitField,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const axios = require("axios").default;

async function removeAutomodRules() {
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
  process.title = `${nuker.user.username} | [10 : REMOVE AUTOMOD RULES]`;

  let guild;

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
    PermissionsBitField.Flags.ManageGuild ||
      PermissionsBitField.Flags.Administrator
  );
  if (!deleteRolePerms) {
    return error("No ManageGuild permission.");
  }
  const headers = {
    Authorization: `Bot ${client.token}`,
    "Content-Type": "application/json",
  };

  try {
    const rulesToDelete = [];
    let fetchedRules = await axios.get(
      `https://discord.com/api/v10/guilds/${guild.id}/auto-moderation/rules`,
      {
        headers,
      }
    );

    if (fetchedRules.status == 200 && fetchedRules.statusText == "OK") {
      let rules = fetchedRules.data;

      if (rules.length == 0) {
        return error("No web hooks to spam in.");
      }
      const botRole = guild.members.me.roles.botRole;

      if (!botRole) {
        error(`Bot role not found.`);
        return;
      }
      //   await webHooks.filter((channel) => {
      //     if (channel.permissions && Array.isArray(channel.permissions)) {
      //       return channel.permissions.some(
      //         (permission) =>
      //           permission.id === nuker.user.id &&
      //           (permission.allow & 2048) === 2048
      //       );
      //     }
      //   });

      for (const ch of rules) {
        rulesToDelete.push(ch);
      }

      if (rulesToDelete.length == 0) return warning("No rules to delete.");

      debug(`Found ${rulesToDelete.length} rule(s) to delete.`);
      try {
        const deletePromises = [];
        rulesToDelete.forEach((rule) => {
          const deletePromise = axios.delete(
            `https://discord.com/api/v10/guilds/${guild.id}/auto-moderation/rules/${rule.id}`,
            { headers }
          );

          deletePromises.push(deletePromise);
        });

        // Use Promise.all to send all messages concurrently
        await Promise.all(deletePromises);

        await success(`Delete all guild rules.`);
      } catch (err) {
        error(`Error: ${err.message}`);
      }
    }
  } catch (err) {
    if (err.response) {
      error(
        `API Error Status: ${err.response.status}`,
        `./src/modules/removeAutomodRules.js`
      );
      error(`API Error Data: ${err.response.data}`);
    } else if (err.request) {
      error(
        "No response received from the server",
        `./src/modules/removeAutomodRules.js`
      );
    } else {
      error(
        `Error setting up the request: ${err.message}`,
        `./src/modules/removeAutomodRules.js`
      );
    }
  }
}

module.exports = {
  removeAutomodRules: removeAutomodRules,
};
