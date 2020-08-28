import { Client } from "discord.js";

/**
 *
 * @param {Client} client
 */
export function getGuild() {
    return client.guilds.fetch(process.env.GUILD_ID, true);
}

/**
 *
 * @param {Client} client
 */
export async function getReilly(guild) {
    if (!guild) {
        guild = await getGuild();
    }
    if (!guild) {
        return;
    }
    const reillyMember = guild.members.cache.find(x => x.id === process.env.REILLY_ID);
    if (!reillyMember) {
        return;
    }
}

export function awaitTimeout(timeMs) {
    return new Promise((resolve, _reject) => {
        setTimeout(() => {
            resolve();
        }, timeMs)
    });
}

export function minutesToMilliseconds(minutes) {
    return minutes * 60 * 100;
}
