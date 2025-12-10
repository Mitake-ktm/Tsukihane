import {
    Client,
    Collection,
    REST,
    Routes,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    PermissionResolvable,
} from 'discord.js';
import fs from 'fs';
import path from 'path';

export interface Command {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    permissions?: PermissionResolvable[];
    ownerOnly?: boolean;
}

export async function loadCommands(client: Client & { commands: Collection<string, Command> }): Promise<void> {
    client.commands = new Collection();
    const commands: object[] = [];

    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const stat = fs.statSync(folderPath);

        if (stat.isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                    console.log(`📁 Loaded command: ${command.data.name}`);
                } else {
                    console.warn(`⚠️ Command at ${filePath} is missing "data" or "execute" property`);
                }
            }
        }
    }

    console.log(`✅ Loaded ${client.commands.size} commands`);
}

export async function deployCommands(): Promise<void> {
    const commands: object[] = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const stat = fs.statSync(folderPath);

        if (stat.isDirectory()) {
            const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(folderPath, file);
                const command = require(filePath);

                if ('data' in command) {
                    commands.push(command.data.toJSON());
                }
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

    try {
        console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

        if (process.env.GUILD_ID) {
            // Guild commands (instant update, for development)
            await rest.put(
                Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID),
                { body: commands },
            );
            console.log(`✅ Successfully registered ${commands.length} guild commands.`);
        } else {
            // Global commands (can take up to 1 hour to update)
            await rest.put(
                Routes.applicationCommands(process.env.CLIENT_ID!),
                { body: commands },
            );
            console.log(`✅ Successfully registered ${commands.length} global commands.`);
        }
    } catch (error) {
        console.error('❌ Error deploying commands:', error);
    }
}
