import { awaitTimeout, minutesToMilliseconds, getRandomItem } from "../common.js";
import Logger from "../logger.js";
import type { Client } from "discord.js";

const replies = [
  "Halo sucks",
  "Psssst... Halo still sucks",
  "Halo = 💩",
  "Call of Duty has a better story than Halo",
  "Halo 5 was the best Halo",
  "How could a company get 'Call of Duty in Space' so wrong??",
  "Why didn't they just cast the one ring into the fire? A 3 foot midget could do it, but not a 7-foot tall roided out soldier? K.",
  "Plot??? Bungie? Where it at?",
  "Warthogs are kinda fun tho.",
  "Reilly is still better at Halo than Rasta. I don't know if that's a good thing, though, tbh",
  "How can you make Halo: Combat Evolved and then fall so low...",
  "Only scrubs like Halo",
  "OMG NOBODY CARES ABOUT HALO",
  "Halo... not even wunce",
  "You're a poo face",
  "♥",
  "Facts: http://forums.bungie.org/halo/archive7.pl?read=177201",
  `Have you ever taken a dump so massive, that you turn around, stare in the toilet, and think "Wow... that came out of my butt."? Cuz Bungie has.`,
  "I've seen hentai with better plot than Halo",
];

export default function configure(client: Client) {
  let isPaused = false;
  client.on("message", async (msg) => {
    if (isPaused) {
      Logger.log("The troll is resting...");
      return;
    }
    if (msg.author.id === process.env.REILLY_ID) {
      const reply = getRandomItem(replies);
      msg.channel.startTyping(1);
      await awaitTimeout(2500);
      msg.channel.stopTyping(true);
      const p = msg.reply(reply);
      isPaused = true;
      const maxDelay = minutesToMilliseconds(20);
      const minDelay = minutesToMilliseconds(2);
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      setTimeout(() => {
        isPaused = false;
      }, delay);
      await p;
    }
  });
}
