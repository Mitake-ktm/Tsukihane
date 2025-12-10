import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchUserGuilds, filterManageableGuilds } from '@/lib/discord';
import connectDB from '@/lib/db';
import { User, ModLog, Warning } from '@/lib/models';
import Header from '@/components/layout/Header';
import { Guild, GuildStats } from '@/lib/types';
import { IModLog } from '@/lib/models'; // Import interface

interface OverviewPageProps {
    params: Promise<{ guildId: string }>;
}

async function getGuildData(guildId: string): Promise<{ guild: Guild; stats: GuildStats } | null> {
    const session = await getServerSession(authOptions);

    if (!session || !(session as { accessToken?: string }).accessToken) {
        return null;
    }

    const accessToken = (session as unknown as { accessToken: string }).accessToken;

    try {
        const guilds = await fetchUserGuilds(accessToken);
        const manageableGuilds = filterManageableGuilds(guilds);
        const guild = manageableGuilds.find((g) => g.id === guildId);

        if (!guild) return null;

        // Connect to database
        await connectDB();

        // Get stats from database
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const totalMembers = await User.countDocuments({ guildId });

        const modActions = await ModLog.countDocuments({
            guildId,
            createdAt: { $gt: weekAgo }
        });

        const warnings = await Warning.countDocuments({
            guildId,
            createdAt: { $gt: weekAgo }
        });

        const levelUps = await User.countDocuments({
            guildId,
            level: { $gt: 0 },
            updatedAt: { $gt: weekAgo }
        });

        const stats: GuildStats = {
            totalMembers: totalMembers,
            newMembersWeek: 0, // Would need Discord API for this
            totalMessages: 0, // Would need message tracking
            moderationActions: modActions + warnings,
            levelUps: levelUps,
            commandsUsed: 0, // Would need command tracking
        };

        return { guild, stats };
    } catch (error) {
        console.error("Error fetching guild data:", error);
        return null;
    }
}

export default async function GuildOverviewPage({ params }: OverviewPageProps) {
    const { guildId } = await params;
    const data = await getGuildData(guildId);

    if (!data) {
        return <div>Loading...</div>;
    }

    const { guild, stats } = data;

    return (
        <>
            <Header title="Overview" />
            <div className="page-content">
                <div style={{ marginBottom: '1.5rem' }}>
                    <h1 style={{ marginBottom: '0.5rem' }}>Welcome back! 👋</h1>
                    <p className="text-muted">Here&apos;s what&apos;s happening in {guild.name}</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.totalMembers.toLocaleString()}</div>
                            <div className="stat-label">Tracked Members</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.moderationActions}</div>
                            <div className="stat-label">Mod Actions (7d)</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon success">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{stats.levelUps}</div>
                            <div className="stat-label">Level Ups (7d)</div>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">Online</div>
                            <div className="stat-label">Bot Status</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <a href={`/guilds/${guildId}/moderation`} className="btn btn-secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Moderation Settings
                        </a>
                        <a href={`/guilds/${guildId}/leveling`} className="btn btn-secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            Leveling System
                        </a>
                        <a href={`/guilds/${guildId}/notifications`} className="btn btn-secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Send Notification
                        </a>
                        <a href={`/guilds/${guildId}/logs`} className="btn btn-secondary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                            </svg>
                            View Logs
                        </a>
                    </div>
                </div>

                {/* Recent Activity */}
                <div style={{ marginTop: '2rem' }}>
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Recent Moderation Activity</h3>
                        </div>
                        <div className="card-body">
                            <RecentModLogs guildId={guildId} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Server component to fetch recent mod logs
async function RecentModLogs({ guildId }: { guildId: string }) {
    await connectDB();

    // Explicitly type the result or cast it
    const logs = await ModLog.find({ guildId })
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(); // Use lean() for plain JS objects

    if (logs.length === 0) {
        return (
            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                No recent moderation activity
            </p>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        <th>Action</th>
                        <th>User ID</th>
                        <th>Reason</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map((log: any) => (
                        <tr key={log._id.toString()}>
                            <td>
                                <span className={`badge ${getActionBadgeClass(log.action)}`}>
                                    {log.action}
                                </span>
                            </td>
                            <td className="font-mono" style={{ fontSize: '0.8rem' }}>
                                {log.userId}
                            </td>
                            <td>{log.reason || '-'}</td>
                            <td>{new Date(log.createdAt).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function getActionBadgeClass(action: string): string {
    switch (action.toUpperCase()) {
        case 'BAN':
        case 'KICK':
            return 'badge-error';
        case 'WARN':
        case 'MUTE':
        case 'TIMEOUT':
            return 'badge-warning';
        case 'UNMUTE':
        case 'UNBAN':
            return 'badge-success';
        default:
            return 'badge-info';
    }
}
