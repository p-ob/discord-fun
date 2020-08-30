import { Client } from "discord.js";
import configureTimeoutCommand from "./actions/timeout";
import configureMute from "./actions/mute";
import configureChat from "./actions/chat";
import configureCoconuts from "./actions/coconuts";
import configureDisconnect from "./actions/disconnect";
import dotenv from "dotenv";

dotenv.config();

const client = new Client();
client.on("ready", () => {
  configureTimeoutCommand(client);
  configureMute(client);
  configureChat(client);
  configureCoconuts(client);
  configureDisconnect(client);

  console.log("<Insert JAWS music here>");
});

client.login(process.env.BOT_TOKEN);
