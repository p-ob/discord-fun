import { Client } from "discord.js";
import configureMoveCommand from "./move.js";
import configureMute from "./mute.js";
import configureChat from "./chat.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client();
client.on("ready", () => {
    configureMoveCommand(client);
    configureMute(client);
    configureChat(client);

    console.log("<Insert JAWS music here>");
});


client.login(process.env.BOT_TOKEN);
