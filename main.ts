import {
	ChatInputCommandInteraction,
	Client,
	Events,
	GatewayIntentBits,
	SlashCommandBuilder
} from "discord.js";
import { token } from "./config.json";
import * as commands from "./commands";

const { Guilds, GuildVoiceStates, GuildMessages } = GatewayIntentBits;

const client = new Client({ intents: [Guilds, GuildVoiceStates, GuildMessages] });

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
			execute: (interaction: ChatInputCommandInteraction) => Promise<undefined>,
		};
		await (commands[commandName] as Command).execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({
			content: `there was an error while executing command "${commandName}"`,
			ephemeral: true,
		});
	}
});
