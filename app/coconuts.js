import { Client } from "discord.js";
import { getYouTubeStream } from "./common.js";

const SHORT_YT_ID = "pmyOHqgidYQ";
const LONG_YT_ID = "nf670orHKcA";

/**
 *
 * @param {Client} client
 */
export default function configure(client) {
  client.on("message", async (msg) => {
    if (msg.content.startsWith("!coconuts")) {
      let id;
      if (msg.content.includes("long")) {
        id = LONG_YT_ID;
      } else {
        id = SHORT_YT_ID;
      }
      const channel = msg.member.voice?.channel;
      if (channel) {
        const connection = await channel.join();
        const dispatcher = connection.play(getYouTubeStream(id), {
          volume: 0.5,
        });

        dispatcher.on("finish", () => {
          channel.leave();
          dispatcher.destroy();
        });
      }
    }
  });
}
