import { Player } from "discord-player";
import { SlashCommandBuilder } from "discord.js";
import type {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionResponse
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("add track to start of queue and play it, or unpause current track");

export const execute = async (
  interaction: ChatInputCommandInteraction,
  player: Player
): Promise<InteractionResponse<boolean>> => {
  if (!interaction.guild) {
    return interaction.reply({
      content: "you must be in a server to use this command",
      ephemeral: true,
    });
  }

  const user = interaction.member as GuildMember;

  if (!user.voice.channel) {
    return interaction.reply({
      content: "you must be in a voice chat to use this command",
      ephemeral: true,
    });
  }

  const botChannel = interaction.guild?.members.me?.voice.channel;

  if (botChannel && (botChannel.id !== user.voice.channel!.id)) {
    return interaction.reply({
      content: `already playing in "${botChannel.name}"`,
      ephemeral: true,
    });
  }

  const query = interaction.options.getString("query");

  if (query === null) {
    // unpause current track
  } else {
    const queue = player.createQueue(interaction.guild, {
      metadata: {
        channel: interaction.channel,
      },
    });
  }

  return interaction.reply(`playing track "bepis" in "joe mama"`);
};
