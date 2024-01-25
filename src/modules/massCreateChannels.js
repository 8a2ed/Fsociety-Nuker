const {
  PermissionsBitField,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const axios = require("axios").default;

async function massCreateChannels() {
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
  process.title = `${nuker.user.username} | [6 : MASS CREATE CHANNELS]`;

  let guild;
  let channelsToCreate;
  let channelsName;

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
    PermissionsBitField.Flags.ManageChannels ||
      PermissionsBitField.Flags.Administrator
  );
  if (!deleteRolePerms) {
    return error("No ManageChannels permission.");
  }

  if (
    nuker.INFO.channelsName &&
    String(nuker.INFO.channelsName).length <= 32 &&
    String(nuker.INFO.channelsName).length > 0
  ) {
    channelsName = String(nuker.INFO.channelsName);

    debug(
      `Set the new channels name to: ${channelsName} (config)`,
      `./src/modules/massCreateChannels.js`
    );

    await sleep(1000);
  } else {
    const countQuestion = `Channels Name [1 : 32]: `;

    var inputQuestion = input(countQuestion);
    while (
      isNaN(inputQuestion) ||
      !inputQuestion ||
      String(inputQuestion).length >= 32 ||
      String(inputQuestion).length < 0
    ) {
      inputQuestion = input(countQuestion);
    }

    channelsName = String(inputQuestion);

    debug(
      `Set the new channels name to: ${channelsName} (manual)`,
      `./src/modules/massCreateChannels.js`
    );

    await sleep(1000);
  }

  if (
    nuker.INFO.channelsCount &&
    Number(parseInt(nuker.INFO.channelsCount)) <= 150 &&
    Number(parseInt(nuker.INFO.channelsCount)) > 0
  ) {
    channelsToCreate = Number(parseInt(nuker.INFO.channelsCount));

    debug(
      `Set new channels count to: ${channelsToCreate} (config)`,
      `./src/modules/massCreateChannels.js`
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

    channelsToCreate = Number(parseInt(inputQuestion));

    debug(
      `Set new channels count to: ${channelsToCreate} (manual)`,
      `./src/modules/massCreateChannels.js`
    );

    await sleep(1000);
  }
  //   const headers = {
  //     Authorization: `Bot ${client.token}`,
  //     "Content-Type": "application/json",
  //   };

  async function deleteChannelsRecursively(guildId, token) {
    const delay = 50;

    for (let index = 0; index < channelsToCreate; index++) {
      await massCreateChannels(guildId, token);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    success("Created channels successfully.");
  }
  async function massCreateChannels(guildId, token) {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        axios.post(
          `https://discord.com/api/v10/guilds/${guildId}/channels`,
          {
            name: channelsName || "fosicety",
            type: 0,
            topic: "Fsociety is diggin'",
            permission_overwrites: nuker.INFO.whitelisted.map((userId) => ({
              id: userId,
              type: 1,
              allow: 2147483647,
            })),
          },
          {
            headers: {
              Authorization: `Bot ${token}`,
              "content-type": "application/json",
            },
          }
        );

        success(`Created a channel.`);
        return;
      } catch (err) {
        if (err.response && err.response.status == 403) {
          warning(`Can't create a channel `);
          return;
        } else if (err.response && err.response.status === 429) {
          warning(`Rate limited. Retrying after ${2000 / 1000} seconds...`);
          retries++;
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.log(err);
          error(`Error creating a channel: ${err.message}`);
          return;
        }
      }
    }

    error(`Failed to create a after ${maxRetries} retries.`);
  }

  await deleteChannelsRecursively(guild.id, client.token);
}
module.exports = {
  massCreateChannels: massCreateChannels,
};
