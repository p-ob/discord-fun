import { Client } from "discord.js";
import configureMoveCommand from "./move.js";
import configureMuteCommand from "./mute.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client();
client.on("ready", () => {
    configureMoveCommand(client);
    configureMuteCommand(client);
});


client.login(process.env.BOT_TOKEN);