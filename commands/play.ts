import { Player, QueryType } from "discord-player";
import { SlashCommandBuilder } from "discord.js";
import type {
  ChatInputCommandInteraction,
  GuildMember,
  InteractionResponse
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("play")
  .setDescription("play audio from youtube link")
  .addStringOption((option) =>
    option.setName("link")
      .setDescription("link to youtube video")
      .setRequired(true));

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

  const link = interaction.options.getString("link")!;

  const queue = player.createQueue(interaction.guild, {
    metadata: {
      channel: interaction.channel,
    },
    ytdlOptions: {
      filter: 'audioonly',
    },
  });

  try {
    if (!queue.connection) {
      await queue.connect(user.voice.channel);
    }
  } catch {
    queue.destroy();
    return interaction.reply(`could not join your voice channel`);
  }

  const track = await player.search(link, {
    requestedBy: interaction.user,
    searchEngine: QueryType.YOUTUBE_VIDEO,
  }).then(x => x.tracks[0]);

  if (!track) {
    return interaction.reply(`could not play audio from video at ${link}`);
  }

  queue.play(track);

  return interaction.reply(`playing audio from "${link}" in "${user.voice.channel}"`);
};
