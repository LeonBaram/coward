import { REST, Routes } from "discord.js";
import { token, clientId } from "./config.json";
import { commands } from "./commands";

const commandData = Object.values(commands).map(command => command.data);

const commandsRoute = Routes.applicationCommands(clientId);

const restApi = new REST({ version: "10" }).setToken(token);

restApi.put(commandsRoute, { body: commandData }).catch(console.error);
