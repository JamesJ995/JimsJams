const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a youtube video"),
  async execute(interaction) {
    interaction.reply({ content: "Work in Progress" });
  },
};
