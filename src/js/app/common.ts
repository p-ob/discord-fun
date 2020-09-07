import ytdl from "ytdl-core";
import type { Guild, Client } from "discord.js";

export function getGuild(client: Client) {
  return client.guilds.fetch(process.env.GUILD_ID!);
}

export async function getReilly(client: Client, guild: Guild) {
  if (!guild) {
    guild = await getGuild(client);
  }
  if (!guild) {
    throw new Error("Guild is requird");
  }
  const reillyMember = await guild.members.fetch({
    user: process.env.REILLY_ID!,
    force: true,
  });
  return reillyMember;
}

export function awaitTimeout(timeMs: number) {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
}

export function minutesToMilliseconds(minutes: number) {
  return minutes * 60 * 1000; // 1 minute * 60 seconds / minute * 1000 milliseconds / second
}

export function getYouTubeStream(id: string) {
  return ytdl(`https://www.youtube.com/watch?v=${id}`, {
    filter: "audioonly",
  });
}

export function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
