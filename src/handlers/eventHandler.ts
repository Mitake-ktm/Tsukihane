import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';

export async function loadEvents(client: Client): Promise<void> {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }

        console.log(`📡 Loaded event: ${event.name}`);
    }

    console.log(`✅ Loaded ${eventFiles.length} events`);
}
