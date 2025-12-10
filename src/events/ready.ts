import { Events, Client } from 'discord.js';
import { connectDatabase } from '../database/mongodb';
import { initReminderService } from '../services/reminderService';
import { initLoggingService } from '../services/loggingService';

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: Client<true>): Promise<void> {
    console.log(`\n🤖 Bot connecté en tant que ${client.user.tag}`);
    console.log(`📊 Serveurs: ${client.guilds.cache.size}`);
    console.log(`👥 Utilisateurs: ${client.users.cache.size}`);

    // Initialize database
    await connectDatabase();

    // Initialize services
    initReminderService(client);
    initLoggingService(client);

    // Set bot status
    client.user.setPresence({
        activities: [{ name: '/help | Tsukihane', type: 0 }],
        status: 'online',
    });

    console.log('\n✅ Bot prêt !\n');
}
