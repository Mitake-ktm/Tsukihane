import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Blacklist } from '@/lib/models';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ guildId: string; wordId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { guildId, wordId } = await params;
        await connectDB();

        // Assuming wordId passed from frontend is the ObjectId
        const result = await Blacklist.deleteOne({ _id: wordId, guildId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Word not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting from blacklist:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
