import { Client, Collection, GatewayIntentBits, Partials } from 'discord.js';
import { config as dotenvConfig } from 'dotenv';
import { connectDatabase } from './database/mongodb';
import { loadCommands, Command } from './handlers/commandHandler';
import { loadEvents } from './handlers/eventHandler';
import { initPresenceManager } from './utils/presenceManager';

// Load environment variables
dotenvConfig();

// Validate required environment variables
if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN is required in .env file');
    process.exit(1);
}

if (!process.env.CLIENT_ID) {
    console.error('❌ CLIENT_ID is required in .env file');
    process.exit(1);
}

// Create Discord client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ],
    partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
    ],
}) as Client & { commands: Collection<string, Command> };

// Initialize commands collection
client.commands = new Collection();

// Express server for optional Railway/Render health checks
import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Tsukihane is alive!');
});

// Main startup function
async function main(): Promise<void> {
    console.log('🚀 Démarrage du bot...\n');

    // Start HTTP server
    app.listen(PORT, () => {
        console.log(`🌐 Serveur HTTP écoute sur le port ${PORT}`);
    });

    // Connect to MongoDB
    await connectDatabase();

    // Load commands
    await loadCommands(client);

    // Load events
    await loadEvents(client);

    // Login to Discord
    await client.login(process.env.BOT_TOKEN);

    // Start rotating presence (Akai Sekai theme)
    const presenceManager = initPresenceManager(client);
    presenceManager.start();
}

// Handle errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Start the bot
main().catch(console.error);
