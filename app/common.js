import { Client, Guild, GuildMember } from "discord.js";
import ytdl from "ytdl-core";
import { Readable } from "stream";

/**
 *
 * @param {Client} client
 * @returns {Promise<Guild>}
 */
export function getGuild(client) {
  return client.guilds.fetch(process.env.GUILD_ID, true);
}

/**
 *
 * @param {Client} client
 * @param {Guild} guild
 * @returns {Promise<GuildMember>}
 */
export async function getReilly(client, guild) {
  if (!guild) {
    guild = await getGuild(client);
  }
  if (!guild) {
    throw new Error("Guild is requird");
  }
  const reillyMember = await guild.members.fetch({
    user: process.env.REILLY_ID,
    cache: true,
  });
  return reillyMember;
}

/**
 *
 * @param {Number} timeMs
 * @returns {Promise<void>} A promise that resolves when timeMs has elapsed
 */
export function awaitTimeout(timeMs) {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
}

export function minutesToMilliseconds(minutes) {
  return minutes * 60 * 100;
}

/**
 *
 * @param {string} id - the unique id of the video
 *
 * @returns {Readable}
 */
export function getYouTubeStream(id) {
  return ytdl(`https://www.youtube.com/watch?v=${id}`, {
    filter: "audioonly",
  });
}

/**
 *
 * @param {Array} arr
 */
export function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
