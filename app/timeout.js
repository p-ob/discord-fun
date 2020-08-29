import { Client, VoiceChannel } from "discord.js";
import { getGuild, getReilly, getYouTubeStream, randomItem } from "./common.js";

const YT_IDS = [
  "KaqC5FnvAEc" /* Trolling Saruman */,
  "nf670orHKcA" /* coconuts */,
  "0nlJuwO0GDs" /* Jinx */,
  "kKrtbUinWOU" /* AC Literal */,
  "eN7dYDYfvVg" /* I can swing my sword */,
  "XqZsoesa55w" /* Baby shark */,
  "tXZecmekaKw" /* Heads will roll */,
  "Jw5QXSeB6RI" /* Campfire Song Song */,
  "oWqAf4eex14" /* Jellyfish Jam */,
];

const TIMEOUT_COMMAND = "!timeout";
const UNTIMEOUT_COMMAND = `${TIMEOUT_COMMAND} cancel`;

/**
 *
 * @param {Client} client
 */
export default function configure(client) {
  let IN_TIMEOUT = false;
  let OG_VOICE_CHANNEL = undefined;
  let OG_ROLES = [];
  client.on("message", async (msg) => {
    if (msg.member.id === process.env.REILLY_ID) {
      msg.reply(`<@${msg.member.id}> cannot put himself in timeout.`);
      return;
    }
    if (msg.content.startsWith(TIMEOUT_COMMAND)) {
      const shouldEndTimeout = msg.content.startsWith(UNTIMEOUT_COMMAND);
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

      const endTimeout = async () => {
        try {
          channel.leave();
        } catch (e) {
          console.error(e);
        }
        // restore Reilly's original roles
        await reillyMember.roles.set(OG_ROLES);

        try {
          // put Reilly back in where he belongs (if he is currently in a channel)
          const reillyUpdated = await getReilly(client, guild);
          const isStillConnected = !!reillyUpdated.voice?.channelID;
          if (isStillConnected) {
            await reillyMember.voice?.setChannel(OG_VOICE_CHANNEL);
          }
        } catch (e) {
          console.error(e);
        }
        IN_TIMEOUT = false;
        msg.reply(`<@${reillyMember.id}> has served his sentence.`);
      };

      if (IN_TIMEOUT && !shouldEndTimeout) {
        msg.reply(
          `<@${reillyMember.id}> has yet to finish his previous sentence.`
        );
        return;
      } else if (IN_TIMEOUT && shouldEndTimeout) {
        await endTimeout();
        return;
      }

      OG_ROLES = reillyMember.roles.cache;
      OG_VOICE_CHANNEL = reillyMember.voice.channel;

      IN_TIMEOUT = true;

      await reillyMember.roles.set([process.env.REILLY_TIMEOUT_ROLE_ID]);
      await reillyMember.voice.setChannel(channel);

      msg.reply(`<@${reillyMember.id}> has been sent on timeout.`);

      if (channel instanceof VoiceChannel) {
        guild.voice?.channel?.leave();
        const connection = await channel.join();
        const ytId = randomItem(YT_IDS);
        const dispatcher = connection.play(getYouTubeStream(ytId), {
          volume: 0.5,
        });

        dispatcher.on("finish", async () => {
          await endTimeout();
          dispatcher.destroy();
        });
      }
    }
  });
}
