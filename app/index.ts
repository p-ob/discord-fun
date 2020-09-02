import { Client } from "discord.js";
import configureTimeoutCommand from "./actions/timeout.js";
import configureMute from "./actions/mute.js";
import configureChat from "./actions/chat.js";
import configureCoconuts from "./actions/coconuts.js";
import configureDisconnect from "./actions/disconnect.js";
import configureSpooky from "./actions/spooky.js";
import dotenv from "dotenv";
import Logger from "./logger.js";

dotenv.config();

const client = new Client();
client.on("ready", () => {
  configureTimeoutCommand(client);
  configureMute(client);
  configureChat(client);
  configureCoconuts(client);
  configureDisconnect(client);
  configureSpooky(client);

  Logger.log("<Insert JAWS music here>");
});

client.login(process.env.BOT_TOKEN);
