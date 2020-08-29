import { Client } from "discord.js";
import InfiniteClock from "./infinite-clock.js";

/**
 *
 * @param {Client} client
 */
export default function configure(client) {
  const CLOCK_STATE = new InfiniteClock();
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
        CLOCK_STATE.run(() => {
          newVoiceState.member.voice.setSelfMute(true);
        });
      }
    }
  });
}