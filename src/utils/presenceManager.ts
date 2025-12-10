import { Client, ActivityType } from 'discord.js';
import { config } from '../config/config';

/**
 * Presence Manager for Tsukihane
 * Handles rotating status messages with Akai Sekai theme
 */
export class PresenceManager {
    private client: Client;
    private currentIndex: number = 0;
    private intervalId: ReturnType<typeof setInterval> | null = null;

    constructor(client: Client) {
        this.client = client;
    }

    /**
     * Start the presence rotation
     */
    start(): void {
        // Set initial presence
        this.updatePresence();

        // Start rotation
        this.intervalId = setInterval(() => {
            this.updatePresence();
        }, config.presence.rotationInterval);

        console.log('🔴 Presence Manager started - Akai Sekai theme active');
    }

    /**
     * Stop the presence rotation
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Presence Manager stopped');
        }
    }

    /**
     * Update the bot's presence to the next activity
     */
    private updatePresence(): void {
        const activities = config.presence.activities;

        if (activities.length === 0) {
            return;
        }

        const activity = activities[this.currentIndex];

        this.client.user?.setPresence({
            activities: [{
                name: activity.name,
                type: activity.type,
            }],
            status: 'online',
        });

        // Move to next activity
        this.currentIndex = (this.currentIndex + 1) % activities.length;
    }

    /**
     * Set a custom presence (temporary)
     */
    setCustomPresence(name: string, type: ActivityType = ActivityType.Playing): void {
        this.client.user?.setPresence({
            activities: [{ name, type }],
            status: 'online',
        });
    }

    /**
     * Get the current activity
     */
    getCurrentActivity(): { name: string; type: ActivityType } | null {
        const activities = config.presence.activities;
        if (activities.length === 0) return null;

        const index = this.currentIndex === 0
            ? activities.length - 1
            : this.currentIndex - 1;

        return activities[index];
    }
}

// Singleton instance
let presenceManager: PresenceManager | null = null;

/**
 * Initialize the presence manager
 */
export function initPresenceManager(client: Client): PresenceManager {
    presenceManager = new PresenceManager(client);
    return presenceManager;
}

/**
 * Get the presence manager instance
 */
export function getPresenceManager(): PresenceManager | null {
    return presenceManager;
}
