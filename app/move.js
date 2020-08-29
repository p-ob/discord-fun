import { Client, VoiceChannel } from "discord.js";
import { getGuild, getReilly, getYouTubeStream } from "./common.js";

const YT_ID = "nf670orHKcA";
/**
 *
 * @param {Client} client
 */
export default function configure(client) {
  let IN_TIMEOUT = false;
  let og_roles = [];
  client.on("message", async (msg) => {
    if (IN_TIMEOUT) {
      return;
    }
    if (msg.content.startsWith("!badreilly")) {
      const guild = await getGuild(client);
      if (!guild) {
        console.log("Guild not found");
        return;
      }
      const reillyMember = await getReilly(client, guild);
      if (!reillyMember) {
        console.log("Reilly not found");
        return;
      }

      if (!reillyMember.voice?.channelID) {
        console.log("Reilly not in voice chat");
        return;
      }

      const channel = guild.channels.cache.find(
        (x) => x.id === process.env.CHANNEL_ID
      );
      if (!channel) {
        console.log("Voice channel not found");
        return;
      }
      IN_TIMEOUT = true;
      og_roles = [...reillyMember.roles];

      await reillyMember.voice.setChannel(channel);
      await reillyMember.roles.set([process.env.REILLY_TIMEOUT_ROLE_ID]);

      msg.reply(`<@${reillyMember.id}> has been sent on timeout.`);

      if (channel instanceof VoiceChannel) {
        const connection = await channel.join();
        const dispatcher = connection.play(getYouTubeStream(YT_ID), {
          volume: 1.0,
        });

        dispatcher.on("finish", async () => {
          channel.leave();
          await reillyMember.roles.set(og_roles);
          IN_TIMEOUT = false;
          dispatcher.destroy();
        });
      }
    }
  });
}
