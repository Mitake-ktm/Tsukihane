import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchUserGuilds, filterManageableGuilds } from '@/lib/discord';

// Bot guild IDs - in production, this would come from the database
// For now, we'll check if the bot is in the guild by querying Discord API
async function getBotGuilds(): Promise<string[]> {
    try {
        const response = await fetch('https://discord.com/api/v10/users/@me/guilds?limit=200', {
            headers: {
                Authorization: `Bot ${process.env.BOT_TOKEN}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch bot guilds');
            return [];
        }

        const guilds = await response.json();
        console.log(`[API] Fetched ${guilds.length} guilds for bot`);
        return guilds.map((g: { id: string }) => g.id);
    } catch (error) {
        console.error('Error fetching bot guilds:', error);
        return [];
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !(session as { accessToken?: string }).accessToken) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const accessToken = (session as unknown as { accessToken: string }).accessToken;

        // Fetch user's guilds
        const userGuilds = await fetchUserGuilds(accessToken);

        // Filter to guilds where user has manage permission
        const manageableGuilds = filterManageableGuilds(userGuilds);

        // Get guilds where bot is present
        const botGuildIds = await getBotGuilds();

        // Filter to guilds where both user can manage AND bot is present
        const availableGuilds = manageableGuilds.filter((guild) =>
            botGuildIds.includes(guild.id)
        );

        return NextResponse.json({
            success: true,
            data: availableGuilds,
        });
    } catch (error) {
        console.error('Error in /api/guilds:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
