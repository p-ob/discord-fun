import { getYouTubeStream, randomItem } from "../common.js";
import Logger from "../logger.js";
import type { Client } from "discord.js";

const YT_IDS = ["NIpns4R9Ep4" /* slow remix */, "1mrGdGMNsv0" /* remix */, "1dSY6ZuXEY" /* OG */];

export default function configure(client: Client) {
  client.on("message", async (msg) => {
    if (msg.content.startsWith("!spooky") || msg.content.startsWith("!spookeh")) {
      const id = randomItem(YT_IDS);
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
