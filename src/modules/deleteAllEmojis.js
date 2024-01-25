const { PermissionsBitField, ChannelType } = require("discord.js");
const axios = require("axios").default;

async function deleteAllEmojis() {
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
  process.title = `${nuker.user.username} | [3 : DELETE EMOJIS]`;

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
    PermissionsBitField.Flags.ManageGuildExpressions ||
      PermissionsBitField.Flags.Administrator
  );
  if (!deleteRolePerms) {
    return error("No ManageGuildExpressions permission.");
  }
  const headers = {
    Authorization: `Bot ${client.token}`,
    "Content-Type": "application/json",
  };

  const emojisToDelete = [];

  try {
    // Fetch all emojis
    const response = await axios.get(
      `https://discord.com/api/v10/guilds/${guild.id}/emojis`,
      {
        headers: {
          Authorization: `Bot ${client.token}`,
        },
      }
    );

    const emojis = response.data;

    for (const emoji of emojis) {
      emojisToDelete.push(emoji);
    }
    if (emojisToDelete.length == 0) warning("No emojis to delete.");

    debug(`Found ${emojisToDelete.length} emojis to delete.`);

    // Fetch all stickers
    const stickersResponse = await axios.get(
      `https://discord.com/api/v10/guilds/${guild.id}/stickers`,
      {
        headers: {
          Authorization: `Bot ${client.token}`,
        },
      }
    );

    const stickers = stickersResponse.data;

    for (const sticker of stickers) {
      emojisToDelete.push(sticker);
    }
    if (emojisToDelete.length == 0) warning("No stickers to delete.");

    debug(`Found ${emojisToDelete.length} stickers to delete.`);

    await deleteEmojisAndStickersRecursively(
      guild.id,
      client.token,
      emojisToDelete
    );
  } catch (error) {
    warning("Error fetching emojis and stickers:", error.message);
  }

  async function deleteEmojisAndStickersRecursively(guildId, token, emojis) {
    const delay = 400; // Adjust the delay based on your needs

    for (const emoji of emojis) {
      await deleteEmojiOrStickerWithRetry(guildId, token, emoji);

      // Add a delay between deletions
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    success("All emojis and stickers deleted successfully.");

    // Return to the UI or perform additional actions
  }

  async function deleteEmojiOrStickerWithRetry(guildId, token, emoji) {
    const maxRetries = 3; // Maximum number of retries
    let retries = 0;

    while (retries < maxRetries) {
      try {
        await axios.delete(
          `https://discord.com/api/v10/guilds/${guildId}/emojis/${emoji.id}`,
          {
            headers: {
              Authorization: `Bot ${token}`,
            },
          }
        );

        success(`Deleted emoji/sticker: ${emoji.name}`);
        return; // Successful deletion, exit the loop
      } catch (err) {
        if (err.response && err.response.status == 403) {
          warning(`Can't delete ${emoji.name}`);
          return;
        } else if (err.response && err.response.status === 429) {
          warning(`Rate limited. Retrying after ${3000 / 1000} seconds...`);
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          error(`Error deleting emoji/sticker  ${emoji.name}: ${err.message}`);
          return;
        }
      }
    }

    error(
      `Failed to delete emoji/sticker ${emoji.name} after ${maxRetries} retries.`
    );
  }
}
module.exports = {
  deleteAllEmojis: deleteAllEmojis,
};
