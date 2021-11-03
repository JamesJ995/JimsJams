const { SlashCommandBuilder } = require("@discordjs/builders");
const ytdl = require("ytdl-core");
const fs = require("fs");
const urlExpression = new RegExp(
  /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play audio")
    .addStringOption((option) =>
      option.setName("input").setDescription("Enter a song name")
    ),
  async execute(interaction) {
    let music = interaction.options.getString("input");
    //const args = music.split(" ");

    if (music.match(urlExpression)) {
      let songInfo = await ytdl.getInfo(music);
      ytdl(music).pipe(fs.createWriteStream("video.mp4"));
      let format = ytdl.chooseFormat(songInfo.formats, { quality: "134" });
      let song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
      };
      interaction.reply({
        content: `you have selected: ${song.title} ${song.url}`,
      });
      console.log(song);
    } else {
      return;
    }
  },
};
