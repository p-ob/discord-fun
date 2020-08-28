import { Client, Guild, GuildMember } from "discord.js";

/**
 *
 * @param {Client} client
 * @returns {Promise<Guild>}
 */
export function getGuild(client) {
    return client.guilds.fetch(process.env.GUILD_ID, true);
}

/**
 *
 * @param {Guid} guild
 * @returns {Promise<GuildMember>}
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

/**
 *
 * @param {Number} timeMs
 * @returns {Promise<void>}
 */
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
