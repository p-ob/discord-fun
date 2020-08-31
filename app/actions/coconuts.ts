import { getYouTubeStream } from "../common.js";
import Logger from "../logger.js";
import type { Client } from "discord.js";

const SHORT_YT_ID = "pmyOHqgidYQ";
const LONG_YT_ID = "nf670orHKcA";

export default function configure(client: Client) {
  client.on("message", async (msg) => {
    if (msg.content.startsWith("!coconuts")) {
      let id;
      if (msg.content.includes("long")) {
        id = LONG_YT_ID;
      } else {
        id = SHORT_YT_ID;
      }
      const channel = msg.member?.voice?.channel;
      if (channel) {
        msg.guild?.voice?.channel?.leave();
        const connection = await channel.join();
        const dispatcher = connection.play(getYouTubeStream(id), {
          volume: 0.5,
        });

        dispatcher.on("finish", () => {
          channel.leave();
          dispatcher.destroy();
        });
      } else {
        Logger.log("A channel could not be found to connect to.");
      }
    }
  });
}
