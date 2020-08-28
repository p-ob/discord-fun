import { Client } from "discord.js";
/**
 *
 * @param {Client} client
 */
export default function configure(client) {
    client.on("voiceStateUpdate", async (oldVoiceState, newVoiceState) => {
        if (oldVoiceState.member.id === process.env.REILLY_ID) {
            console.log("And so it begins...");
            const joinedChannel = !oldVoiceState.channelID && newVoiceState.channelID;
            if (joinedChannel) {
                startClock(() => newVoiceState.member.voice.setSelfMute(true));
            }
        }
    });
}

function startClock(callback) {
    (function loop() {
        const maxDelay = 10 * 60 * 100; // 10 min * 60 s/min * 100 ms/s
        const minDelay = 1 * 60 * 60; // 1 min * 60 s/min * 100 ms/s
        const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
        console.log(`Prepare yourself... something gonna happen in ${delay}ms.`);
        setTimeout(function() {
            callback();
            loop();
        }, delay);
    }());
}