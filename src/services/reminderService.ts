import { Client, TextChannel } from 'discord.js';
import * as cron from 'node-cron';
import { Reminder } from '../database/models';
import { config } from '../config/config';

interface IReminder {
    id: string; // Mongoose ID
    userId: string;
    guildId: string;
    channelId?: string;
    message: string;
    remindAt: Date;
}

let client: Client;

export function initReminderService(botClient: Client): void {
    client = botClient;

    // Check reminders every minute
    cron.schedule('* * * * *', checkReminders);
    console.log('⏰ Reminder service initialized');
}

async function checkReminders(): Promise<void> {
    const now = new Date();

    const reminders = await Reminder.find({
        remindAt: { $lte: now },
        completed: false
    });

    for (const reminder of reminders) {
        // Cast to our interface or use model type
        await sendReminder(reminder as any);
        await markCompleted((reminder._id as any).toString());
    }
}

async function sendReminder(reminder: IReminder): Promise<void> {
    try {
        const user = await client.users.fetch(reminder.userId);

        if (reminder.channelId) {
            const channel = await client.channels.fetch(reminder.channelId) as TextChannel;
            if (channel) {
                await channel.send({
                    content: `🔔 Rappel pour ${user}: ${reminder.message}`,
                });
                return;
            }
        }

        // Fallback to DM
        await user.send({
            content: `🔔 **Rappel**: ${reminder.message}`,
        });
    } catch (error) {
        console.error(`Failed to send reminder ${reminder.id}:`, error);
    }
}

async function markCompleted(id: string): Promise<void> {
    await Reminder.findByIdAndUpdate(id, { completed: true });
}

export async function addReminder(
    userId: string,
    guildId: string,
    message: string,
    remindAt: Date,
    channelId?: string
): Promise<string> {
    const reminder = await Reminder.create({
        userId,
        guildId,
        channelId: channelId || undefined,
        message,
        remindAt
    });
    return (reminder._id as any).toString();
}

export async function getReminders(userId: string): Promise<IReminder[]> {
    const reminders = await Reminder.find({ userId, completed: false }).sort({ remindAt: 1 });
    return reminders.map(r => ({
        id: (r._id as any).toString(),
        userId: r.userId,
        guildId: r.guildId,
        channelId: r.channelId,
        message: r.message,
        remindAt: r.remindAt
    }));
}

export async function deleteReminder(id: string, userId: string): Promise<boolean> {
    const result = await Reminder.deleteOne({ _id: id, userId });
    return result.deletedCount > 0;
}
