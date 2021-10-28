require('dotenv').config(); //initialize dotenv
const { Client, Intents } = require("discord.js");

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.on("ready", () => {
  console.log("Jim's Jam's Loaded!");
});

client.on("messageCreate", (message) => {
  if (message.content.startsWith("ping")) {
    message.channel.send("pong!");
  } else

    if (message.content.startsWith("foo")) {
      message.channel.send("bar!");
    }
});

client.login(process.env.TOKEN);


