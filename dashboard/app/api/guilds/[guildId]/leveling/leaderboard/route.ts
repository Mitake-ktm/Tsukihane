import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { User } from '@/lib/models';

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

        const leaderboard = await User.find({ guildId })
            .sort({ totalXp: -1 })
            .limit(50)
            .select('userId level totalXp')
            .lean();

        // Add rank
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            userId: entry.userId,
            level: entry.level,
            totalXp: entry.totalXp,
            rank: index + 1,
        }));

        return NextResponse.json({ success: true, data: rankedLeaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
