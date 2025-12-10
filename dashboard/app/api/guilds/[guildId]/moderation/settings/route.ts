import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { GuildSettings } from '@/lib/models'; // Import Mongoose model

// Default settings matching the bot's config
const DEFAULT_SETTINGS = {
    antiSpam: {
        enabled: true,
        messageLimit: 5,
        timeWindow: 5000,
        duplicateLimit: 3,
    },
    capsDetection: {
        enabled: true,
        threshold: 0.7,
        minLength: 10,
    },
    raidShield: false,
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { guildId } = await params;
        await connectDB();

        const settings = await GuildSettings.findOne({ guildId }).lean();

        if (!settings) {
            return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
        }

        // Return mixed defaults with actual settings if needed, or just defaults as placeholder 
        // until we implement full settings stored in DB
        return NextResponse.json({
            success: true,
            data: {
                ...DEFAULT_SETTINGS,
                raidShield: settings.raidShieldEnabled ?? false
            }
        });
    } catch (error) {
        console.error('Error fetching moderation settings:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { guildId } = await params;
        const settings = await request.json();
        await connectDB();

        await GuildSettings.findOneAndUpdate(
            { guildId },
            {
                $set: {
                    raidShieldEnabled: settings.raidShield ? true : false
                }
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving moderation settings:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
