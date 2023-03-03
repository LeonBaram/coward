import { ChatInputCommandInteraction, InteractionResponse, SlashCommandBuilder } from "discord.js";

import ytdl from "ytdl-core";
import { Bot } from "./Bot";

namespace Command {
  type Data = any;

  type Interaction = ChatInputCommandInteraction;

  type Response = Promise<InteractionResponse<boolean>>;

  type Handler =
    (botInstance: Bot, interaction: Interaction) => Response;

  export type Entry = {
    data: Data,
    execute: Handler,
  };
}

const commands: Record<string, Command.Entry> = {};

commands.play = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("add video to queue")
    .addStringOption((option) =>
      option.setName("url")
        .setDescription("url of youtube video")
        .setRequired(true)),

  execute(bot, interaction) {
    const reply = (content: string, ephemeral: boolean = true) =>
      interaction.reply({ content, ephemeral });

    const url = interaction.options.getString("url");

    if (url === null) {
      return reply(`the /play command requires a url`);
    }

    const urlIsValid = ytdl.validateURL(url);

    if (urlIsValid === false) {
      return reply(`could not get a valid video ID from this url: "${url}"`);
    }

    const { length } = bot.queue;

    bot.queue.push(url);

    if (length === 0) {
      return reply(`now playing audio from ${url}`);
    } else {
      return reply(`added ${url} to queue`);
    }
  }
};

export default commands;