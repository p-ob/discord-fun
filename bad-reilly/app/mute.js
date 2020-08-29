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
        if (CLOCK_STATE?.running) {
          // if Reilly jumps between channels a bunch... let's not worry about it
          if (CLOCK_STATE.cancellationRequested) {
            return;
          }
          await CLOCK_STATE.cancel();
        }
        CLOCK_STATE = startClock(() =>
          newVoiceState.member.voice.setSelfMute(true)
        );
      }
    }
  });
}

function startClock(callback) {
  let _cancel = false;
  let _cancellationRequested = false;
  let _runningPromise = undefined;
  let _running = false;
  const state = {
    get running() {
      return _running;
    },
    get completed() {
      return _runningPromise;
    },
    get cancelled() {
      return _cancel;
    },
    get cancellationRequested() {
      return _cancellationRequested;
    },
    cancel() {
      _cancellationRequested = true;
      _cancel = true;
      return _runningPromise;
    },
  };
  async function clock(resolve) {
    _running = true;
    while (!_cancel) {
      const maxDelay = minutesToMilliseconds(10);
      const minDelay = minutesToMilliseconds(1);
      const delay =
        Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      console.log(`Prepare yourself... something gonna happen in ${delay}ms.`);
      await awaitTimeout(delay);
      callback();
    }
    _cancellationRequested = false;
    _running = false;
    resolve();
  }
  _runningPromise = new Promise((resolve) => clock(resolve));
  return state;
}

function awaitTimeout(timeMs) {
  return new Promise((resolve, _reject) => {
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
}
