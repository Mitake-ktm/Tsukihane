import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchUserGuilds, filterManageableGuilds } from '@/lib/discord';
import Sidebar from '@/components/layout/Sidebar';
import { Guild } from '@/lib/types';

interface GuildLayoutProps {
    children: ReactNode;
    params: Promise<{ guildId: string }>;
}

async function getGuild(guildId: string): Promise<Guild | null> {
    const session = await getServerSession(authOptions);

    if (!session || !(session as { accessToken?: string }).accessToken) {
        return null;
    }

    const accessToken = (session as unknown as { accessToken: string }).accessToken;

    try {
        const guilds = await fetchUserGuilds(accessToken);
        const manageableGuilds = filterManageableGuilds(guilds);
        return manageableGuilds.find((g) => g.id === guildId) || null;
    } catch {
        return null;
    }
}

export default async function GuildLayout({ children, params }: GuildLayoutProps) {
    const { guildId } = await params;
    const guild = await getGuild(guildId);

    if (!guild) {
        notFound();
    }

    return (
        <div className="dashboard-layout">
            <Sidebar guild={guild} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
