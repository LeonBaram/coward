import {
	Client,
	Events,
	GatewayIntentBits,
	SlashCommandBuilder
} from "discord.js";
import type {
	ChatInputCommandInteraction,
	InteractionResponse
} from "discord.js";
import { token } from "./config.json";
import * as commands from "./commands";
import { Player } from "discord-player";

const { Guilds, GuildVoiceStates, GuildMessages } = GatewayIntentBits;

const client = new Client({ intents: [Guilds, GuildVoiceStates, GuildMessages] });
const player = new Player(client);

client.once(Events.ClientReady, (client) =>
	console.log(`client is ready; logged in as ${client.user.tag}`));

client.login(token);

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const { commandName } = interaction;

	if (!(commandName in commands)) {
		console.error(`cannot execute command ${commandName}; no such command`);
		return;
	}

	try {
		type Command = {
			data: SlashCommandBuilder,
			execute: (
				interaction: ChatInputCommandInteraction,
				player: Player
			) => Promise<InteractionResponse<boolean>>,
		};
		await (commands[commandName] as Command).execute(interaction, player);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: `there was an error while executing command "${commandName}"`,
			ephemeral: true,
		});
	}
});
