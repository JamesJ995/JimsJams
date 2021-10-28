// Require the necessary discord.js classes
const dotenv = require('dotenv')
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');


// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const readyDiscord = () => {
  return console.log('beep beep boop bop');
};

// When the client is ready, run this code (only once)
client.on('ready', readyDiscord);

// Login to Discord with your client's token
client.login(token);

console.log('Beep Boop');
