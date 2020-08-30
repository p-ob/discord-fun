import type { Client } from "discord.js";

export default function configure(client: Client) {
  client.on("message", async (msg) => {
    if (msg.content.startsWith("!disconnect") && msg.author.id === process.env.GOD_ID) {
      msg.reply(`It's been an honor. o7`);
      client.destroy();
    }
  });
}
