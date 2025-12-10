import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendChannelMessage } from '@/lib/discord';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { type, message, channelId } = await request.json();

        if (!message || !channelId) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        // Send the message using the bot token
        const success = await sendChannelMessage(channelId, message);

        if (!success) {
            return NextResponse.json({
                success: false,
                error: 'Failed to send message. Check if the bot has access to the channel.'
            }, { status: 500 });
        }

        // Log the notification (optional)
        console.log(`Notification sent to channel ${channelId} by ${(session.user as { id?: string })?.id}: ${type}`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
