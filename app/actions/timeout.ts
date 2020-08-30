import { VoiceChannel } from "discord.js";
import { getGuild, getReilly, getYouTubeStream, randomItem } from "../common.js";
import { Logger } from "../logger.js";
import type { GuildMember, Client, Collection, Role, StreamDispatcher } from "discord.js";

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
  "l_DfCFHOD9E" /* kazoo Halo */,
  "QH2-TGUlwu4" /* nyan cat */,
  "cE0wfjsybIQ" /* Crab Rave */,
  "1mrGdGMNsv0" /* Spookeh */,
  "tV5wmDhzgY8" /* Crab people */,
  "bfcZacwnVCk" /* Sea Shanty 2 X */,
  "rvrZJ5C_Nwg" /* AAAAAAAAA */,
  "UOxkGD8qRB4" /* K/DA Pop/Stars */,
  "hqbS7O9qIXE" /* Toss a coin */,
];

const TIMEOUT_COMMAND = "!timeout";
const UNTIMEOUT_COMMAND = `${TIMEOUT_COMMAND} cancel`;

export default function configure(client: Client) {
  const userTimeoutLookup: { [userId: string]: UserTimeoutCache } = {};
  let dispatcher: StreamDispatcher | undefined;

  client.on("message", async (msg) => {
    if (msg.author.id === process.env.REILLY_ID) {
      msg.reply(`<@${msg.author.id}> can't put people into timeout.`);
      return;
    }
    if (msg.content.startsWith(TIMEOUT_COMMAND)) {
      const shouldEndTimeout = msg.content.startsWith(UNTIMEOUT_COMMAND);

      const guild = await getGuild(client);
      if (!guild) {
        Logger.log("Guild not found");
        return;
      }
      let member: GuildMember;
      if (msg.mentions.users.first()) {
        const user = msg.mentions.users.first()!;
        member = await guild.members.fetch(user);
      } else {
        member = await getReilly(client, guild);
      }
      if (!member) {
        Logger.log("User not found");
        return;
      }

      if ([client.user?.id, process.env.GOD_ID].includes(member.id)) {
        msg.reply("You have no power here!");
        return;
      }

      if (!member.voice?.channelID) {
        Logger.log("User not in voice chat");
        return;
      }

      const channel = guild.channels.cache.find((x) => x.id === process.env.CHANNEL_ID);
      if (!channel) {
        Logger.log("Voice channel not found");
        return;
      }

      let timeoutData = userTimeoutLookup[member.id];
      if (!timeoutData) {
        timeoutData = {
          timedOut: true,
        };
        userTimeoutLookup[member.id] = timeoutData;
      }

      const endTimeout = async () => {
        try {
          (channel as VoiceChannel).leave();
        } catch (e) {
          Logger.error(e);
        }
        try {
          // restore the user's original roles
          if (timeoutData.originalRoles) {
            await member.roles.set(timeoutData.originalRoles);
          }
        } catch (err) {
          Logger.error(err);
        }

        try {
          // put the user back in where he belongs (if he is currently in a channel)
          const updatedMember = await guild.members.fetch({
            user: member.id,
            force: true,
          });
          const isStillConnected = !!updatedMember.voice?.channelID;
          if (isStillConnected && timeoutData.originalVoiceChannel) {
            await updatedMember.voice?.setChannel(timeoutData.originalVoiceChannel);
          }
        } catch (e) {
          Logger.error(e);
        }
        timeoutData.timedOut = false;
        msg.reply(`<@${member.id}> has served his sentence.`);
      };

      if (timeoutData.timedOut && !shouldEndTimeout) {
        msg.reply(`<@${member.id}> has yet to finish his previous sentence.`);
        return;
      } else if (timeoutData.timedOut && shouldEndTimeout) {
        await endTimeout();
        return;
      }

      timeoutData.originalRoles = member.roles.cache;
      timeoutData.originalVoiceChannel = member.voice.channel as VoiceChannel;

      timeoutData.timedOut = true;

      await member.roles.set([process.env.REILLY_TIMEOUT_ROLE_ID!]);
      await member.voice.setChannel(channel);

      msg.reply(`<@${member.id}> has been sent on timeout.`);

      // we shouldn't connect the bot if someone else is currently enjoying the fun :)
      if (!dispatcher && channel instanceof VoiceChannel) {
        guild.voice?.channel?.leave();
        const connection = await channel.join();
        const ytId = randomItem(YT_IDS);
        dispatcher = connection.play(getYouTubeStream(ytId), {
          volume: 0.5,
        });

        dispatcher.on("finish", async () => {
          await endTimeout();
          dispatcher?.destroy();
          dispatcher = undefined;
        });
      }
    }
  });
}

type UserTimeoutCache = {
  timedOut: boolean;
  originalVoiceChannel?: VoiceChannel;
  originalRoles?: Collection<string, Role>;
};
