import { REST, Routes } from "discord.js";
import { token, clientId, guildId } from "./config.json";
import * as commands from "./commands";

const commandData = Object.values(commands).map(command => command.data.toJSON());
const commandsRoute = Routes.applicationGuildCommands(clientId, guildId);

const restApi = new REST({ version: "10" }).setToken(token);

restApi.put(commandsRoute, { body: commandData }).catch(console.error);
