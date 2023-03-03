import { REST, Routes } from "discord.js";
import { token, clientId } from "./config.json";
import * as commands from "./commands";

const commandData = Object.values(commands).map(command => command.data.toJSON());
const commandsRoute = Routes.applicationCommands(clientId);

const restApi = new REST({ version: "10" }).setToken(token);

restApi.put(commandsRoute, { body: commandData }).catch(console.error);
