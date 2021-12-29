const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents } = require('discord.js');
const keepActive = require('http');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});
const { Player, QueryType } = require('discord-player');
require('dotenv').config();
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

setInterval(function () {
  keepActive.get('https://jims-jams.herokuapp.com/');
}, 300000); // every 5 minutes (300000)

const commands = [
  {
    name: 'play',
    description: 'track: song name here',
    options: [
      {
        name: 'query',
        type: 3,
        description: 'Play a song from YouTube',
        required: true,
      },
    ],
  },
  {
    name: 'stop',
    description: 'stop the player',
  },
  {
    name: 'ping',
    description: 'ping the bot',
  },
];

ffmpeg_options = {
  options: '-vn',
  before_options: '-reconnect 1 -reconnect_streamed 1 -reconnect_delay_max 5',
};

const rest = new REST({ version: '9' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started refreshing application [/] commands.');

    await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
      body: commands,
    });

    console.log('Successfully reloaded application [/] commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Create a new Player (you don't need any API Key)
const player = new Player(client);

// add the trackStart event so when a song will be played this message will be sent
player.on('trackStart', (queue, track) =>
  queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`)
);

client.once('ready', () => {
  console.log("I'm ready !");
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  //PING COMMAND
  if (interaction.commandName === 'ping') {
    return interaction.reply({
      content: 'pong',
      ephemeral: true,
    });
  }
  // /play track:Despacito
  // will play "Despacito" in the voice channel
  if (interaction.commandName === 'play') {
    if (!interaction.member.voice.channelId)
      return await interaction.reply({
        content: 'You are not in a voice channel!',
        ephemeral: true,
      });
    if (
      interaction.guild.me.voice.channelId &&
      interaction.member.voice.channelId !==
        interaction.guild.me.voice.channelId
    )
      return await interaction.reply({
        content: 'You are not in my voice channel!',
        ephemeral: true,
      });
    const query = interaction.options.get('query').value;
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });

    // verify vc connection
    try {
      if (!queue.connection)
        await queue.connect(interaction.member.voice.channel);
    } catch {
      queue.destroy();
      return await interaction.reply({
        content: 'Could not join your voice channel!',
        ephemeral: true,
      });
    }

    await interaction.deferReply();
    const searchResult = await player.search(query, {
      requestedBy: interaction.user,
      searchEngine: QueryType.AUTO,
    });
    if (!searchResult)
      return await interaction.followUp({
        content: `❌ | Track **${query}** not found!`,
      });
    console.log(searchResult);
    searchResult.playlist;
    queue.play(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();

    return await interaction.followUp({
      content: `⏱️ | Loading track **${searchResult.tracks[0]}**!`,
    });
  }

  if (interaction.commandName === 'stop') {
    const queue = player.getQueue(interaction.guildId);
    queue.destroy();
    return interaction.reply({
      content: `🛑 | Track has been stopped!!`,
    });
  }
});

client.login(DISCORD_TOKEN);
