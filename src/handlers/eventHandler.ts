import { Client } from 'discord.js';
import fs from 'fs';
import path from 'path';

export async function loadEvents(client: Client): Promise<void> {
    const eventsPath = path.join(__dirname, '..', 'events');

    // Recursive function to get all event files
    const getFiles = (dir: string): string[] => {
        const files: string[] = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                files.push(...getFiles(fullPath));
            } else if ((item.name.endsWith('.ts') || item.name.endsWith('.js')) &&
                !item.name.endsWith('.d.ts') &&
                !item.name.endsWith('.map')) {
                files.push(fullPath);
            }
        }
        return files;
    };

    const eventFiles = getFiles(eventsPath);
    let loadedCount = 0;

    for (const filePath of eventFiles) {
        const module = require(filePath);
        // Support both default export and named exports
        const events = module.default || module;

        // Convert to array if it's a single event object, or handle object with multiple named exports
        const eventList = [];
        if (Array.isArray(events)) {
            eventList.push(...events);
        } else if (events.name && events.execute) {
            eventList.push(events);
        } else {
            // Check for named exports that are arrays or event objects (like my new files might be)
            for (const key in events) {
                if (Array.isArray(events[key])) {
                    eventList.push(...events[key]);
                } else if (events[key].name && events[key].execute) {
                    eventList.push(events[key]);
                }
            }
        }

        for (const event of eventList) {
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
            console.log(`📡 Loaded event: ${event.name}`);
            loadedCount++;
        }
    }

    console.log(`✅ Loaded ${loadedCount} events from ${eventFiles.length} files`);
}
