const { PermissionsBitField, ChannelType } = require("discord.js");
const axios = require("axios").default;

async function deleteAllRoles() {
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
  process.title = `${nuker.user.username} | [1 : DELETE ROLES]`;

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
    PermissionsBitField.Flags.ManageRoles ||
      PermissionsBitField.Flags.Administrator
  );
  if (!deleteRolePerms) {
    return error("No ManageRoles permission.");
  }
  const headers = {
    Authorization: `Bot ${client.token}`,
    "Content-Type": "application/json",
  };

  try {
    const rolesToDelete = [];
    let fetchedRoles = await axios({
      method: "GET",
      url: `https://discord.com/api/v10/guilds/${guild.id}/roles`,
      headers: headers,
    });

    if (fetchedRoles.status == 200 && fetchedRoles.statusText == "OK") {
      let roles_data = fetchedRoles.data;

      if (roles_data.length == 0) {
        return error("No roles to delete.");
      }
      const botRole = guild.members.me.roles.botRole;

      if (!botRole) {
        error(`Bot role not found.`);
        return;
      }
      await roles_data.filter(
        (role) =>
          role.id != botRole.id &&
          role.position < botRole.position &&
          role.id != guild.roles.everyone.id
      );

      for (const role of roles_data) {
        rolesToDelete.push(role);
      }

      if (rolesToDelete.length == 0) return warning("No roles to delete.");
      debug(`Found ${rolesToDelete.length} roles to delete.`);

      await deleteRolesRecursively(guild.id, client.token, rolesToDelete);

      async function deleteRolesRecursively(guildId, token, roles) {
        const delay = 250; // Adjust the delay based on your needs

        for (const role of roles) {
          await deleteRoleWithRetry(guildId, token, role);

          // Add a delay between deletions
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        success("All roles deleted successfully.");
      }

      async function deleteRoleWithRetry(guildId, token, role) {
        const maxRetries = 3; // Maximum number of retries
        let retries = 0;

        while (retries < maxRetries) {
          try {
            await axios.delete(
              `https://discord.com/api/v10/guilds/${guildId}/roles/${role.id}`,
              {
                headers: {
                  Authorization: `Bot ${token}`,
                },
              }
            );

            success(`Deleted role: ${role.name}`);
            return; // Successful deletion, exit the loop
          } catch (err) {
            if (err.response && err.response.status == 403) {
              warning(
                `Can't delete ${role.name} because of the position or its the bot role.`
              );
              return;
            } else if (err.response && err.response.status === 429) {
              warning(`Rate limited. Retrying after ${1000 / 1000} seconds...`);
              retries++;
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } else {
              error(`Error deleting role ${role.name}: ${err.message}`);
              return;
            }
          }
        }

        error(
          `Failed to delete role ${role.name} after ${maxRetries} retries.`
        );
      }
    }
  } catch (err) {
    if (err.response) {
      // The request was made, but the server responded with a status code outside of the 2xx range
      error(
        `API Error Status: ${err.response.status}`,
        `./src/modules/deleteAllRoles.js [Fetching roles]`
      );
      error(`API Error Data: ${err.response.data}`);
    } else if (err.request) {
      // The request was made but no response was received
      error(
        "No response received from the server",
        `./src/modules/deleteAllRoles.js [Fetching roles]`
      );
    } else {
      // Something happened in setting up the request that triggered an Error
      error(
        `Error setting up the request: ${err.message}`,
        `./src/modules/deleteAllRoles.js [Fetching roles]`
      );
    }
  }
}

module.exports = {
  deleteAllRoles: deleteAllRoles,
};
