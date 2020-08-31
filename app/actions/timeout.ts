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
  "UsnRQJxanVM" /* Dovahkiin */,
];

const gifs_403 = [
  "https://media1.giphy.com/media/XWXnf6hRiKBJS/giphy.gif" /* You have no power here */,
  "https://media.tenor.com/images/23c71973d91d01b2cec29e285cd71196/tenor.gif" /* Troy Chuckle */,
  "https://media1.tenor.com/images/138aed5d9c9056183cd874bc8dd31979/tenor.gif" /* ah ah ah */,
  "https://media1.tenor.com/images/a45e05b55e74a44fcff40d66592b3422/tenor.gif" /* Harvey Spectre */,
  "https://media1.tenor.com/images/f1c5cabe90250283d620ed62c603295f/tenor.gif" /* Gladiator */,
  "https://media1.tenor.com/images/adb9c5362d7df68690ad39014189b334/tenor.gif" /* Trump */,
  "https://media1.tenor.com/images/3595514258c97c4140953d8d97efc4a6/tenor.gif" /* Scooby */,
  "https://media1.tenor.com/images/5a798559927f7131ab19698cdc5b9203/tenor.gif" /* Colbert */,
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

  private async _handleTimeoutCommand(msg: Message) {
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
      const embed = new MessageEmbed();
      embed.setImage(gif);
      await msg.channel.send(`${msg.author}, `, embed);
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
        timedOut: false,
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
    await this._startTimeout(member, msg);
    timeoutData.timedOut = true;
  }

  private async _startTimeout(member: GuildMember, msg: Message) {
    await member.roles.set([process.env.REILLY_TIMEOUT_ROLE_ID!]);
    await member.voice.setChannel(this._channel!);

    msg.reply(`<@${member.id}> has been sent on timeout.`);

    if (!this._dispatcher && this._channel instanceof VoiceChannel) {
      this._guild!.voice?.channel?.leave();
      const connection = await this._channel.join();
      const ytId = randomItem(YT_IDS);
      this._dispatcher = connection.play(getYouTubeStream(ytId), {
        volume: 0.5,
      });

      this._dispatcher.on("finish", async () => {
        await this._endTimeout(member.id, msg);
      });
    }
  }

  private async _endTimeout(userId: string, msg: Message) {
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
      } else {
        // if we can't restore, at least pull the shame role off
        await member.roles.remove(process.env.REILLY_TIMEOUT_ROLE_ID!);
      }
    } catch (err) {
      Logger.error(err);
    }

    try {
      // put the user back in where they belong (if they are currently in a channel)
      const isStillConnected = !!member.voice?.channelID;
      if (isStillConnected && userTimeoutData.originalVoiceChannel) {
        await member.voice?.setChannel(userTimeoutData.originalVoiceChannel);
      }
    } catch (e) {
      Logger.error(e);
    }
    userTimeoutData.timedOut = false;
    msg.reply(`<@${member.id}> has served his sentence.`);
    if (!this._someoneElseInPurgatory(userId)) {
      this._dispatcher?.destroy();
      this._dispatcher = undefined;
    }
  }

  private _someoneElseInPurgatory(userId: string) {
    const keys = Object.keys(this._userStateLookup);
    let someoneElseInPurgatory = false;
    for (const k of keys) {
      if (k === userId) {
        continue;
      }
      someoneElseInPurgatory = this._userStateLookup[k].timedOut;
    }

    return someoneElseInPurgatory;
  }
}
