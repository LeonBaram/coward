import { getVoiceConnection } from "@discordjs/voice";
import { SlashCommandBuilder } from "discord.js";
import type {
  ChatInputCommandInteraction,
  RESTPostAPIChatInputApplicationCommandsJSONBody
} from "discord.js";

import ytdl from "ytdl-core";
import ytpl from "ytpl";
import { Bot } from "./Bot";
import { shuffle } from "./utils";

namespace Command {
  type Data = RESTPostAPIChatInputApplicationCommandsJSONBody;

  type Interaction = ChatInputCommandInteraction;

  // type Response = Promise<InteractionResponse<boolean>>;

  type Handler =
    (botInstance: Bot, interaction: Interaction) => void;

  export type Entry = {
    data: Data,
    execute: Handler,
  }
}

export const commands: Record<string, Command.Entry> = {
  add: {
    data: new SlashCommandBuilder()
      .setName("add")
      .setDescription("add one track to end of queue")
      .addStringOption((option) =>
        option.setName("url")
          .setDescription("youtube video url")
          .setRequired(true))
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      const url = interaction.options.getString("url");

      if (url === null) {
        reply(`the /add command needs a url`);
        return;
      }

      const urlIsValid = ytdl.validateURL(url);

      if (urlIsValid === false) {
        return reply(`could not get a valid video from this url: "${url}"`);
      }

      bot.trackUrls.push(url);

      if (bot.trackUrls.length === 1) {
        bot.playCurrentTrack();
        reply(`now playing audio from ${url}`);
      } else {
        reply(`added ${url} to queue`);
      }
    }
  },

  pause: {
    data: new SlashCommandBuilder()
      .setName("pause")
      .setDescription("pause current track")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      switch (bot.status) {
        case "playing": {
          bot.audioPlayer.pause();
          reply("paused");
          return;
        }
        case "paused": {
          reply("already paused");
          return;
        }
        case "idle": {
          reply("nothing to pause");
          return;
        }
      }
    },
  },

  unpause: {
    data: new SlashCommandBuilder()
      .setName("unpause")
      .setDescription("unpause current track")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      switch (bot.status) {
        case "playing": {
          reply("already unpaused");
          return;
        }
        case "paused": {
          bot.audioPlayer.unpause();
          reply("unpaused");
          return;
        }
        case "idle": {
          reply("nothing to unpause");
          return;
        }
      }
    },
  },

  clear: {
    data: new SlashCommandBuilder()
      .setName("clear")
      .setDescription("clear the queue")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      bot.trackUrls = [];
      bot.index = 0;
      bot.audioPlayer.stop();
      return reply("cleared queue");
    }
  },

  disconnect: {
    data: new SlashCommandBuilder()
      .setName("disconnect")
      .setDescription("disconnect bot from voice channel")
      .toJSON(),

    execute(_bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      const guild = interaction.guild ?? null;

      if (guild === null) {
        reply("nothing to disconnect from");
        return;
      }

      const connection = getVoiceConnection(guild.id) ?? null;

      if (connection === null) {
        reply("nothing to disconnect from");
        return;
      }

      const voiceChannel = guild.members.me?.voice.channel ?? null;

      if (voiceChannel === null) {
        reply("nothing to disconnect from");
        return;
      }

      connection.destroy();

      reply(`disconnected from ${voiceChannel}`);
      return;
    }
  },

  prev: {
    data: new SlashCommandBuilder()
      .setName("prev")
      .setDescription("go back to previous track in queue")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      bot.index -= 2;
      bot.audioPlayer.stop();

      const { currentUrl } = bot;

      if (currentUrl === null) {
        reply("no previous track");
        return;
      } else {
        reply(`playing previous track ${currentUrl}`);
        return;
      }
    }
  },

  next: {
    data: new SlashCommandBuilder()
      .setName("next")
      .setDescription("skip to next track in queue")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      bot.audioPlayer.stop();

      const { currentUrl } = bot;

      if (currentUrl === null) {
        reply("no next track");
        return;
      } else {
        reply(`playing next track ${currentUrl}`);
        return;
      }
    }
  },

  addplaylist: {
    data: new SlashCommandBuilder()
      .setName("addplaylist")
      .setDescription("add tracks from playlist to end of queue")
      .addStringOption((option) =>
        option.setName("url")
          .setDescription("url of youtube playlist")
          .setRequired(true))
      .toJSON(),

    async execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      const url = interaction.options.getString("url");

      if (url === null) {
        return reply(`the /playlist command requires a url`);
      }

      const urlIsValid = ytpl.validateID(url);

      if (urlIsValid === false) {
        return reply(`could not get a valid playlist from this url: "${url}"`);
      }

      const playlist = await ytpl(url);

      const playlistUrls = playlist.items.map((item) => item.url);

      bot.trackUrls.push(...playlistUrls);

      if (bot.trackUrls.length === playlistUrls.length) {
        reply(`now playing audio from playlist "${playlist.title}": ${url}`);
        return;
      } else {
        reply(`added videos from playlist "${playlist.title}" to queue: ${url}`);
        return;
      }
    }
  },

  shuffle: {
    data: new SlashCommandBuilder()
      .setName("shuffle")
      .setDescription("randomize the order of the queue")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      if (bot.trackUrls.length === 0) {
        reply("nothing to shuffle");
        return;
      }

      shuffle(bot.trackUrls);

      reply("shuffled queue");
      return;
    }
  },

  loop: {
    data: new SlashCommandBuilder()
      .setName("loop")
      .setDescription("tracks will automatically replay when finished")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      bot.loopCurrentTrack = true;

      reply("tracks will automatically replay when finished");
      return;
    }
  },

  unloop: {
    data: new SlashCommandBuilder()
      .setName("unloop")
      .setDescription("tracks won't automatically replay when finished")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      bot.loopCurrentTrack = false;

      reply("tracks won't automatically replay when finished");
      return;
    }
  },

  loopqueue: {
    data: new SlashCommandBuilder()
      .setName("loopqueue")
      .setDescription("queue will automatically restart when finished")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      bot.loopQueue = true;

      return reply("queue will automatically restart when finished");
    }
  },

  unloopqueue: {
    data: new SlashCommandBuilder()
      .setName("unloopqueue")
      .setDescription("queue won't automatically restart when finished")
      .toJSON(),

    execute(bot, interaction) {
      const reply = (content: string, ephemeral: boolean = true) =>
        interaction.reply({ content, ephemeral });

      bot.loopQueue = false;

      return reply("queue won't automatically restart when finished");
    }
  }
}
