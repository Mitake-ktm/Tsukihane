import Header from '@/components/layout/Header';
import connectDB from '@/lib/db';
import { ModLog } from '@/lib/models'; // Use shared models

interface LogsPageProps {
    params: Promise<{ guildId: string }>;
}

export default async function LogsPage({ params }: LogsPageProps) {
    const { guildId } = await params;
    await connectDB();

    // Fetch recent logs
    const logs = await ModLog.find({ guildId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();

    // Get stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const statsWeek = await ModLog.aggregate([
        { $match: { guildId, createdAt: { $gt: weekAgo } } },
        { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);

    const totalActions = statsWeek.reduce((sum, s) => sum + s.count, 0);

    return (
        <>
            <Header title="Logs & Analytics" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Logs & Analytics</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    View moderation history and server analytics
                </p>

                {/* Stats Overview */}
                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="stat-card">
                        <div className="stat-icon primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{totalActions}</div>
                            <div className="stat-label">Actions (7d)</div>
                        </div>
                    </div>
                    {statsWeek.slice(0, 3).map((stat) => (
                        <div key={stat._id} className="stat-card">
                            <div className="stat-icon warning">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">{stat.count}</div>
                                <div className="stat-label">{stat._id}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Logs Table */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Recent Moderation Logs</h3>
                        <span className="badge badge-info">{logs.length} entries</span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {logs.length === 0 ? (
                            <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>
                                No moderation logs found
                            </p>
                        ) : (
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Action</th>
                                            <th>User</th>
                                            <th>Moderator</th>
                                            <th>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log: any) => (
                                            <tr key={log._id.toString()}>
                                                <td style={{ whiteSpace: 'nowrap' }}>
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </td>
                                                <td>
                                                    <span className={`badge ${getBadgeClass(log.action)}`}>
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="font-mono" style={{ fontSize: '0.8rem' }}>
                                                    {log.userId}
                                                </td>
                                                <td className="font-mono" style={{ fontSize: '0.8rem' }}>
                                                    {log.moderatorId === 'SYSTEM' ? (
                                                        <span className="badge badge-info">SYSTEM</span>
                                                    ) : (
                                                        log.moderatorId
                                                    )}
                                                </td>
                                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {log.reason || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function getBadgeClass(action: string): string {
    const upper = action.toUpperCase();
    if (['BAN', 'KICK'].includes(upper)) return 'badge-error';
    if (['WARN', 'MUTE', 'TIMEOUT', 'AUTO_DELETE'].includes(upper)) return 'badge-warning';
    if (['UNMUTE', 'UNBAN'].includes(upper)) return 'badge-success';
    return 'badge-info';
}
