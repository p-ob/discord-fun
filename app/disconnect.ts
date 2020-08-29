import type { Client } from "discord.js";

export default function configure(client: Client) {
  client.on("message", async (msg) => {
    if (msg.content.startsWith("!disconnect") && msg.member?.id === process.env.GOD_ID) {
      msg.reply(`<@${msg.member?.id}>, it's been an honor. o7`);
      client.destroy();
    }
  });
}
