import { Client } from "discord.js";
import configureTimeoutCommand from "./timeout.js";
import configureMute from "./mute.js";
import configureChat from "./chat.js";
import configureCoconuts from "./coconuts.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client();
client.on("ready", () => {
  configureTimeoutCommand(client);
  configureMute(client);
  configureChat(client);
  configureCoconuts(client);

  console.log("<Insert JAWS music here>");
});

client.login(process.env.BOT_TOKEN);