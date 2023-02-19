import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("add track to start of queue and play it, or unpause current track");

export const execute = async (interaction: ChatInputCommandInteraction) => {
  await interaction.reply(`playing track "bepis" in "joe mama"`);
};
