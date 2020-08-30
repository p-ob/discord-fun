import { awaitTimeout, minutesToMilliseconds, randomItem } from "../common";
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
];

export default function configure(client: Client) {
  let isPaused = false;
  client.on("message", async (msg) => {
    if (isPaused) {
      return;
    }
    if (msg.author.id === process.env.REILLY_ID) {
      const reply = randomItem(replies);
      await awaitTimeout(100);
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
