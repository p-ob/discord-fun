import { Client } from "discord.js";

const msgs = [
    "Halo sucks",
    "Psssst... Halo still sucks",
    "Halo = 💩",
    "Call of Duty has a better story than Halo",
    "GAYLOOOOOOOO",
    "Cortana's virtual tits were the only good part of Halo",
    "Halo 5 was the best Halo",
    "How could a company get 'Call of Duty in Space' so wrong??",
    "Why didn't they just cast the one ring into the fire? A 3 foot limp-dicked midget could do it, but not a 7-foot tall roided out soldier? K.",
    "Plot??? Bungie? Where it at?",
    "Warthogs are kinda fun tho.",
    "Reilly is still better at Halo than Rasta. I don't know if that's a good thing, though, tbh",
    "How can you make Halo: Combat Evolved and then fall so low...",
    "Only scrubs like Halo",
    "OMG NO BODY CARES ABOUT HALO",
    "♥"
];

/**
 *
 * @param {Client} client
 */
export default function configure(client) {
    let isPaused = false;
    client.on("message", async msg => {
        if (isPaused) {
            return;
        }
        if (msg.member.id === process.env.REILLY_ID) {
            const reply = msgs[Math.floor(Math.random() * items.length)];
            const p = msg.reply(reply);
            isPaused = true;
            const maxDelay = 10 * 60 * 100; // 10 min * 60 s/min * 100 ms/s
            const minDelay = 1 * 60 * 60; // 1 min * 60 s/min * 100 ms/s
            const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
            setTimeout(() => {
                isPaused = false;
            }, delay);
            await p;
        }
    });
}

