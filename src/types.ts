import {
    Collection,
    CommandInteraction,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    AutocompleteInteraction,
    PermissionsBitField,
    Client
} from 'discord.js';

export interface BotEvent {
    name: string;
    once?: boolean;
    execute: (...args: any[]) => Promise<void> | void;
}

export interface SlashCommand {
    command: SlashCommandBuilder | any; // using any for builder to avoid complex typing issues for now
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
    cooldown?: number; // in seconds
    permissions?: PermissionsBitField[]; // [] or undefined = everyone
}

export interface BotClient extends Client {
    commands: Collection<string, SlashCommand>;
    cooldowns: Collection<string, number>;
}
