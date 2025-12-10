import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { GuildSettings } from '@/lib/models';

// Default settings matching the bot's config
const DEFAULT_SETTINGS = {
    enabled: true,
    xpPerMessage: { min: 15, max: 25 },
    xpCooldown: 60000,
    announceInChannel: true,
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

        // In the future, these specific settings should be added to the GuildSettings schema
        // For now, we return default settings as the schema primarily covers moderation/general config
        // or we can store them in a 'modules' field if we update the schema.
        // Assuming for now we just want to ensure DB connection works and potentially read global config.

        const settings = await GuildSettings.findOne({ guildId }).lean();

        // Since the current GuildSettings schema doesn't explicitly have leveling settings fields 
        // (based on previous file content), we'll return defaults but mixed with any future stored config.
        // If you expanded GuildSettingsSchema to include leveling, fetch it here.

        return NextResponse.json({ success: true, data: DEFAULT_SETTINGS });
    } catch (error) {
        console.error('Error fetching leveling settings:', error);
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

        // When we update the Schema to support leveling settings, we would save them here.
        // For now, we just acknowledge the request to support the UI.
        // await connectDB();
        // await GuildSettings.findOneAndUpdate({ guildId }, { $set: { leveling: settings } }, { upsert: true });

        console.log('Mock saving leveling settings for guild:', guildId, settings);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving leveling settings:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
