import {
	Client,
	Events,
	GatewayIntentBits,
} from "discord.js";

import type {
	ChatInputCommandInteraction,
	GuildMember,
	InteractionResponse
} from "discord.js";

import { joinVoiceChannel } from "@discordjs/voice";

import { Bot } from "./Bot";

import { token } from "./config.json";

import * as commands from "./commands";

const { Guilds, GuildVoiceStates, GuildMessages } = GatewayIntentBits;

const client = new Client({ intents: [Guilds, GuildVoiceStates, GuildMessages] });

type GuildID = string;
const botInstances: Map<GuildID, Bot> = new Map();

client.once(Events.ClientReady, async (client) => {
	console.log(`client is ready; logged in as ${client.user.tag}`);

	const guilds = await client.guilds.fetch();

	console.log('connected to the following servers:');

	for (const guild of guilds.values()) {
		console.log(`- "${guild.name}" (ID: ${guild.id})`);

		botInstances.set(guild.id, new Bot(guild.id));
	}
});

client.on(Events.GuildCreate, (guild) => {
	console.log(`invited to new server "${guild.name}" (ID: ${guild.id})`);

	botInstances.set(guild.id, new Bot(guild.id));
});

client.on(Events.GuildDelete, (guild) => {
	console.log(`no longer in server "${guild.name}" (ID: ${guild.id})`);

	botInstances.delete(guild.id);
})

client.login(token);

type CommandInteraction = ChatInputCommandInteraction;
type CommandResponse = Promise<InteractionResponse<boolean>>;
export type CommandHandler =
	(botInstance: Bot, interaction: CommandInteraction) => CommandResponse;

client.on(Events.InteractionCreate, (interaction) => {
	if (!interaction.isChatInputCommand()) {
		return;
	}

	const { commandName, guildId } = interaction;

	if (guildId === null) {
		interaction.reply("you must be in a server to use this bot");
		return;
	}

	const bot = botInstances.get(guildId) ?? null;

	const botAsGuildMember = interaction.guild?.members.me ?? null;

	if (bot === null || botAsGuildMember === null) {
		interaction.reply("this bot has not been invited to your server");
		return;
	}

	if (!(commandName in commands)) {
		const errorStr = `cannot execute command ${commandName}; no such command`;
		console.error(errorStr);
		interaction.reply({
			content: errorStr,
			ephemeral: true,
		});
		return;
	}

	const user = interaction.member as GuildMember;

	if (user.voice.channelId === null) {
		interaction.reply({
			content: `you must be in a voice channel to use this bot`,
			ephemeral: true,
		});
		return;
	}

	const botVoiceChannel = botAsGuildMember.voice.channel;

	if (botVoiceChannel !== null && user.voice.channelId !== botVoiceChannel.id) {
		interaction.reply({
			content: `the bot is busy in ${botVoiceChannel}`,
			ephemeral: true,
		});
	}

	if (botVoiceChannel === null) {
		joinVoiceChannel({
			channelId: user.voice.channelId,
			guildId: user.guild.id,
			adapterCreator: user.guild.voiceAdapterCreator,
		});
	}

	try {
		const execute = commands[commandName].execute as CommandHandler;
		execute(bot, interaction);
	} catch (error) {
		console.error({ bot, interaction });
		console.error(error);
		interaction.reply({
			content: `there was an error while executing command "${commandName}"`,
			ephemeral: true,
		});
	}
});
