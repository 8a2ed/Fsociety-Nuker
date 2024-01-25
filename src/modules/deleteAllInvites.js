const { PermissionsBitField, ChannelType } = require("discord.js");
const axios = require("axios").default;

async function deleteAllInvites() {
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
  process.title = `${nuker.user.username} | [4 : DELETE INVITES]`;

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

  await guild.invites.fetch();

  const invitesToDelete = [];

  try {
    // Fetch all emojis
    const response = await axios.get(
      `https://discord.com/api/v10/guilds/${guild.id}/invites`,
      {
        headers: {
          Authorization: `Bot ${client.token}`,
        },
      }
    );

    const inviteLinks = response.data;

    for (const link of inviteLinks) {
      invitesToDelete.push(link);
    }
    if (invitesToDelete.length == 0)
      return warning("No invite links to delete.");

    debug(`Found ${invitesToDelete.length} links to delete.`);

    await deleteInviteLinksRecursively(guild.id, client.token, invitesToDelete);
  } catch (error) {
    warning("Error fetching invite links:", error.message);
  }

  async function deleteInviteLinksRecursively(guildId, token, links) {
    const delay = 200; // Adjust the delay based on your needs

    for (const link of links) {
      await deleteInviteLinksWithRetry(guildId, token, link);

      // Add a delay between deletions
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    success("All invite links deleted successfully.");

    // Return to the UI or perform additional actions
  }

  async function deleteInviteLinksWithRetry(guildId, token, inviteLink) {
    const maxRetries = 3; // Maximum number of retries
    let retries = 0;

    while (retries < maxRetries) {
      try {
        await axios.delete(
          `https://discord.com/api/v10/invites/${inviteLink.code}`,
          {
            headers: {
              Authorization: `Bot ${token}`,
            },
          }
        );

        success(`Deleted link: discord.gg/${inviteLink.code}`);
        return; // Successful deletion, exit the loop
      } catch (err) {
        if (err.response && err.response.status == 403) {
          warning(`Can't delete discord.gg/${inviteLink.code}`);
          return;
        } else if (err.response && err.response.status === 429) {
          warning(`Rate limited. Retrying after ${1500 / 1000} seconds...`);
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 1500));
        } else {
          error(`Error deleting discord.gg/${inviteLink.code}: ${err.message}`);
          return;
        }
      }
    }

    error(
      `Failed to delete discord.gg/${inviteLink.code} after ${maxRetries} retries.`
    );
  }
}
module.exports = {
  deleteAllInvites: deleteAllInvites,
};
