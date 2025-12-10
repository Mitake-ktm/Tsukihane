import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Blacklist } from '@/lib/models'; // Assume this is exported from lib/models

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

        const words = await Blacklist.find({ guildId }).sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: words });
    } catch (error) {
        console.error('Error fetching blacklist:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ guildId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { guildId } = await params;
        const { word } = await request.json();

        if (!word || typeof word !== 'string') {
            return NextResponse.json({ success: false, error: 'Invalid word' }, { status: 400 });
        }

        await connectDB();
        const userId = (session.user as { id?: string })?.id || 'unknown';

        try {
            const newWord = await Blacklist.create({
                guildId,
                word: word.toLowerCase().trim(),
                addedBy: userId
            });
            return NextResponse.json({ success: true, data: newWord });
        } catch (err: any) {
            if (err.code === 11000) {
                return NextResponse.json({ success: false, error: 'Word already in blacklist' }, { status: 400 });
            }
            throw err;
        }

    } catch (error) {
        console.error('Error adding to blacklist:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
