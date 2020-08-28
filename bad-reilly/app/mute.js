import { Client } from "discord.js";
import { minutesToMilliseconds } from "./common.js";


/**
 *
 * @param {Client} client
 */
export default function configure(client) {
    let CLOCK_STATE;
    client.on("voiceStateUpdate", async (oldVoiceState, newVoiceState) => {
        if (oldVoiceState.member.id === process.env.REILLY_ID) {
            console.log("And so it begins...");
            const joinedChannel = !oldVoiceState.channelID && newVoiceState.channelID;
            if (joinedChannel) {
                if (CLOCK_STATE) {
                    CLOCK_STATE.cancel = true;
                    await STATE.running;
                }
                CLOCK_STATE = startClock(() => newVoiceState.member.voice.setSelfMute(true));
            }
        }
    });
}

function startClock(callback) {
    const state = {
        running: undefined,
        cancel: false
    };
    async function clock(resolve) {
        while (!state.cancel) {
            state.running = true;
            const maxDelay = minutesToMilliseconds(10);
            const minDelay = minutesToMilliseconds(1);
            const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
            console.log(`Prepare yourself... something gonna happen in ${delay}ms.`);
            await awaitTimeout(delay);
            callback();
        }
        resolve();
    }
    state.running = new Promise(resolve => clock(resolve));
    return state;
}

function awaitTimeout(timeMs) {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve();
        }, timeMs)
    });
}
