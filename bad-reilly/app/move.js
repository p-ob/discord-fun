import { Client } from "discord.js";
import { getGuild, getReilly } from "./common.js";

/**
 *
 * @param {Client} client
 */
export default function configure(client) {
    client.on("message", async msg => {
        if (msg.content.startsWith("!badreilly")) {
            const guild = await getGuild();
            if (!guild) {
                return;
            }
            const reillyMember = await getReilly(guild);
            if (!reillyMember) {
                return;
            }

            const channel = guild.channels.cache.find(x => x.id === process.env.CHANNEL_ID);
            if (!channel) {
                return;
            }
            reillyMember.voice.setChannel(channel);
        }
    });
}

