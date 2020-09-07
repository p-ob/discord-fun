import { getYouTubeStream, getAllVoiceChannels } from "../common.js";
import type { Client } from "discord.js";

const SHORT_YT_ID = "pmyOHqgidYQ";
const LONG_YT_ID = "nf670orHKcA";

export default function configure(client: Client) {
  client.on("message", async (msg) => {
    if (!msg.guild || !client.voice) {
      return;
    }
    if (msg.content.startsWith("!coconuts")) {
      let id;
      if (msg.content.includes("long")) {
        id = LONG_YT_ID;
      } else {
        id = SHORT_YT_ID;
      }

      const broadcast = client.voice.createBroadcast();
      const dispatcher = broadcast.play(getYouTubeStream(id), {
        volume: 1.0,
      });

      for (const channel of getAllVoiceChannels(msg.guild)) {
        const connection = await channel.join();
        connection.play(broadcast);
        broadcast.on("end", () => {
          channel.leave();
        });
        dispatcher.on("finish", () => {
          try {
            channel.leave();
          } catch {
            // left empty on purpose
          }
          dispatcher.destroy();
        });
      }

      dispatcher.on("finish", () => {
        dispatcher.destroy();
      });
    }
  });
}
