const { PermissionsBitField, ChannelType } = require("discord.js");
const axios = require("axios").default;

async function deleteAllChannels() {
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
  process.title = `${nuker.user.username} | [1 : DELETE CHANNELS]`;

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

  const deleteChannelPerms = guild.members.me.permissions.has(
    PermissionsBitField.Flags.ManageChannels ||
      PermissionsBitField.Flags.Administrator
  );
  if (!deleteChannelPerms) {
    return error("No MANAGE_CHANNELS permission.");
  }

  const headers = {
    Authorization: `Bot ${client.token}`,
    "Content-Type": "application/json",
  };
  let done = 0;

  async function delChannel(channelId) {
    let deleteResponse = await axios({
      method: "DELETE",
      url: `https://discord.com/api/v10/channels/${channelId}`,
      headers: headers,
    });

    if (deleteResponse.status == 200) {
      done++;
      return success(`Deleted channel (${channelId}) | Type: Channel.`);
    } else if (deleteResponse.status == 429) {
      warning(`Rate limited waiting 1 second...`);
      return await sleep(1000);
    } else {
      return error(
        `Failed to delete (${channelId}) | Status Code: ${deleteResponse.status}`
      );
    }
  }

  async function delCategory(categoryId) {
    let deleteResponse = await axios({
      method: "DELETE",
      url: `https://discord.com/api/v9/channels/${categoryId}`,
      headers: headers,
    });

    if (deleteResponse.status == 200) {
      done++;
      return success(`Deleted category (${categoryId})| Type: Category.`);
    } else if (deleteResponse.status == 429) {
      warning(`Rate limited waiting 1 second...`);
      return await sleep(1000);
    } else {
      return error(
        `Failed to delete (${categoryId}) | Status Code: ${deleteResponse.statusCode}`
      );
    }
  }

  let fetchedChannels = await axios({
    method: "GET",
    url: `https://discord.com/api/v9/guilds/${guild.id}/channels`,
    headers: headers,
  });

  if (fetchedChannels.status == 200 && fetchedChannels.statusText == "OK") {
    let channels_data = await fetchedChannels.data;

    if (channels_data.length == 0) return warning("No channels to delete.");
    let tasks = [];
    for (const channel of channels_data) {
      let channel_id = channel.id;
      let channel_type = channel.type;

      if (channel_type == 4) {
        tasks.push(delCategory(channel_id));
      } else {
        tasks.push(delChannel(channel_id));
      }
    }
    for (let index = done; index < tasks.length; index++) {
      await Promise.allSettled(tasks);
    }

    await success(`Deleted ${done} channels.`);
  }
}

module.exports = {
  deleteAllChannels: deleteAllChannels,
};
