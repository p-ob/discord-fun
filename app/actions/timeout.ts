import { MessageEmbed, VoiceChannel } from "discord.js";
import { getGuild, getReilly, getYouTubeStream, randomItem } from "../common.js";
import Logger from "../logger.js";
import type { Guild, GuildMember, Client, Collection, Role, StreamDispatcher, Message } from "discord.js";

const YT_IDS = [
  "KaqC5FnvAEc" /* Trolling Saruman */,
  "nf670orHKcA" /* coconuts */,
  "0nlJuwO0GDs" /* Jinx */,
  "kKrtbUinWOU" /* AC Literal */,
  "eN7dYDYfvVg" /* I can swing my sword */,
  "XqZsoesa55w" /* Baby shark */,
  "tXZecmekaKw" /* Heads will roll */,
  "Jw5QXSeB6RI" /* Campfire Song Song */,
  "oWqAf4eex14" /* Jellyfish Jam */,
  "l_DfCFHOD9E" /* kazoo Halo */,
  "QH2-TGUlwu4" /* nyan cat */,
  "cE0wfjsybIQ" /* Crab Rave */,
  "1mrGdGMNsv0" /* Spookeh */,
  "tV5wmDhzgY8" /* Crab people */,
  "bfcZacwnVCk" /* Sea Shanty 2 X */,
  "rvrZJ5C_Nwg" /* AAAAAAAAA */,
  "UOxkGD8qRB4" /* K/DA Pop/Stars */,
  "hqbS7O9qIXE" /* Toss a coin */,
  "o7cCJqya7wc" /* Look at my horse */,
  "BEm0AjTbsac" /* Misty Mtns */,
  "BBGEG21CGo0" /* epic sax */,
  "ZZ5LpwO-An4" /* HEYYEYAAEYAAAEYAEYAA */,
  "I1188GO4p1E" /* Get Schwifty */,
];

const gifs_403 = [
  "https://tenor.com/view/you-have-no-power-here-lotr-the-lord-of-the-rings-gandalf-gif-17924404" /* You have no power here */,
  "https://tenor.com/view/grin-you-have-no-power-here-look-at-that-gif-11382585" /* Troy Chuckle */,
  "https://tenor.com/view/ah-ahahah-youdidntsaythemagicword-magicword-jurassicpark-gif-9628120" /* ah ah ah */,
  "https://tenor.com/view/nicetry-lawyer-harveyspecter-gif-4755413" /* Harvey Spectre */,
  "https://tenor.com/view/joaquin-phoenix-gladiator-thumbs-down-gif-13238004" /* Gladiator */,
  "https://tenor.com/view/inauguration-cnn2017-donald-trump-finger-wag-no-gif-7576946" /* Trump */,
];

const TIMEOUT_COMMAND = "!timeout";
const UNTIMEOUT_COMMAND = `${TIMEOUT_COMMAND} cancel`;

export default function configure(client: Client) {
  new TimeoutAction(client);
}

type UserTimeoutCache = {
  timedOut: boolean;
  originalVoiceChannel?: VoiceChannel;
  originalRoles?: Collection<string, Role>;
};

class TimeoutAction {
  private _client: Client;
  private _userStateLookup: { [userId: string]: UserTimeoutCache } = {};
  private _dispatcher?: StreamDispatcher;
  private _channel?: VoiceChannel;
  private _guild?: Guild;

  constructor(client: Client) {
    this._client = client;
    this._client.on("message", (msg) => {
      if (msg.content.startsWith(TIMEOUT_COMMAND)) {
        this._handleTimeoutCommand(msg);
      }
    });
  }

  async _handleTimeoutCommand(msg: Message) {
    if (msg.author.id === process.env.REILLY_ID) {
      msg.reply(`<@${msg.author.id}> can't put people into timeout.`);
      return;
    }

    const shouldEndTimeout = msg.content.startsWith(UNTIMEOUT_COMMAND);
    this._guild = this._guild ?? (await getGuild(this._client));
    if (!this._guild) {
      Logger.log("Guild not found");
      return;
    }
    let member: GuildMember;
    if (msg.mentions.users.first()) {
      const user = msg.mentions.users.first()!;
      member = await this._guild.members.fetch(user);
    } else {
      member = await getReilly(this._client, this._guild);
    }
    if (!member) {
      Logger.log("User not found");
      return;
    }

    if ([this._client.user?.id, process.env.GOD_ID].includes(member.id)) {
      const gif = randomItem(gifs_403);
      const embed = new MessageEmbed({
        url: gif,
      });
      await msg.reply(embed);
      return;
    }

    if (!member.voice?.channelID) {
      Logger.log("User not in voice chat");
      return;
    }
    this._channel =
      this._channel ?? (this._guild.channels.cache.find((x) => x.id === process.env.CHANNEL_ID) as VoiceChannel);
    if (!this._channel) {
      Logger.log("Voice channel not found");
      return;
    }

    let timeoutData = this._userStateLookup[member.id];
    if (!timeoutData) {
      timeoutData = {
        timedOut: true,
      };
      this._userStateLookup[member.id] = timeoutData;
    }

    if (timeoutData.timedOut && !shouldEndTimeout) {
      msg.reply(`<@${member.id}> has yet to finish his previous sentence.`);
      return;
    } else if (timeoutData.timedOut && shouldEndTimeout) {
      await this._endTimeout(member.id, msg);
      return;
    }

    timeoutData.originalRoles = member.roles.cache;
    timeoutData.originalVoiceChannel = member.voice.channel as VoiceChannel;

    timeoutData.timedOut = true;

    msg.reply(`<@${member.id}> has been sent on timeout.`);

    // we shouldn't connect the bot if someone else is currently enjoying the fun :)
    if (!this._dispatcher && this._channel instanceof VoiceChannel) {
      this._guild.voice?.channel?.leave();
      const connection = await this._channel.join();
      const ytId = randomItem(YT_IDS);
      this._dispatcher = connection.play(getYouTubeStream(ytId), {
        volume: 0.5,
      });

      this._dispatcher.on("finish", async () => {
        await this._endTimeout(member.id, msg);
        this._dispatcher?.destroy();
        this._dispatcher = undefined;
      });
    }
  }

  async _endTimeout(userId: string, msg: Message) {
    const userTimeoutData = this._userStateLookup[userId];
    const member = await this._guild!.members.fetch({
      user: userId,
      force: true,
    });
    try {
      (this._channel as VoiceChannel).leave();
    } catch (e) {
      Logger.error(e);
    }
    try {
      // restore the user's original roles
      if (userTimeoutData.originalRoles) {
        await member.roles.set(userTimeoutData.originalRoles);
      }
    } catch (err) {
      Logger.error(err);
    }

    try {
      // put the user back in where he belongs (if he is currently in a channel)
      const isStillConnected = !!member.voice?.channelID;
      if (isStillConnected && userTimeoutData.originalVoiceChannel) {
        await member.voice?.setChannel(userTimeoutData.originalVoiceChannel);
      }
    } catch (e) {
      Logger.error(e);
    }
    userTimeoutData.timedOut = false;
    msg.reply(`<@${member.id}> has served his sentence.`);
  }

  async _startTimeout(member: GuildMember) {
    await member.roles.set([process.env.REILLY_TIMEOUT_ROLE_ID!]);
    await member.voice.setChannel(this._channel!);
  }
}