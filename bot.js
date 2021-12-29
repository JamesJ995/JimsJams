const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents } = require('discord.js');
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
    const searchResult = await player
      .search(query, {
        requestedBy: interaction.user,
        searchEngine: QueryType.AUTO,
      })
      .then(console.log('nice'));
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

// require('dotenv').config(); //initialize dotenv
// const fs = require('fs');
// const { Client, Intents, Collection, VoiceChannel } = require('discord.js');
// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');
// const {
//   joinVoiceChannel,
//   createAudioPlayer,
//   createAudioResource,
//   entersState,
//   StreamType,
//   AudioPlayerStatus,
// } = require('@discordjs/voice');
// const TOKEN = process.env.TOKEN;
// const GUILD_ID = process.env.GUILD_ID;
// const { SlashCommandBuilder } = require('@discordjs/builders');
// const ytdl = require('ytdl-core');
// const { Player } = require('discord-player');

// const client = new Client({
//   intents: [
//     Intents.FLAGS.GUILDS,
//     Intents.FLAGS.GUILD_MESSAGES,
//     Intents.FLAGS.DIRECT_MESSAGES,
//     Intents.FLAGS.GUILD_VOICE_STATES,
//   ],
//   partials: [Intents.FLAGS.CHANNEL],
// });

// const commands = [];
// const commandFiles = fs
//   .readdirSync('./commands')
//   .filter((file) => file.endsWith('.js'));

// // Creating a collection for commands in client
// client.commands = new Collection();

// for (const file of commandFiles) {
//   const command = require(`./commands/${file}`);
//   commands.push(command.data.toJSON());
//   client.commands.set(command.data.name, command);
// }

// // When the client is ready, this only runs once
// client.once('ready', () => {
//   console.log('Jims Jams is Ready!');
//   // Registering the commands in the client
//   const CLIENT_ID = client.user.id;
//   const rest = new REST({
//     version: '9',
//   }).setToken(TOKEN);
//   (async () => {
//     try {
//       if (!GUILD_ID) {
//         await rest.put(Routes.applicationCommands(CLIENT_ID), {
//           body: commands,
//         });
//         console.log('Successfully registered application commands globally');
//       } else {
//         await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
//           body: commands,
//         });
//         console.log(
//           'Successfully registered application commands for Honking at Blizz'
//         );
//       }
//     } catch (error) {
//       if (error) console.error(error);
//     }
//   })();
// });

// client.on('interactionCreate', async (interaction) => {
//   if (!interaction.isCommand()) return;

//   if (interaction.commandName === 'play') {
//     if (!interaction.member.voice.channelId)
//       return await interaction.reply({
//         content: 'You are not in a voice channel!',
//         ephemeral: true,
//       });
//     if (
//       interaction.guild.me.voice.channelId &&
//       interaction.member.voice.channelId !==
//         interaction.guild.me.voice.channelId
//     )
//       return await interaction.reply({
//         content: 'You are not in my voice channel!',
//         ephemeral: true,
//       });
//     const query = interaction.options.get('query').value;
//     const queue = player.createQueue(interaction.guild, {
//       metadata: {
//         channel: interaction.channel,
//       },
//     });
//     // verify vc connection
//     try {
//       if (!queue.connection)
//         await queue.connect(interaction.member.voice.channel);
//     } catch {
//       queue.destroy();
//       return await interaction.reply({
//         content: 'Could not join your voice channel!',
//         ephemeral: true,
//       });
//     }
//     await interaction.deferReply();
//     const track = await player
//       .search(query, {
//         requestedBy: interaction.user,
//       })
//       .then((x) => x.tracks[0]);
//     if (!track)
//       return await interaction.followUp({
//         content: `❌ | Track **${query}** not found!`,
//       });

//     queue.play(track);

//     return await interaction.followUp({
//       content: `⏱️ | Loading track **${track.title}**!`,
//     });
//   }
// });

// client.login(TOKEN);
