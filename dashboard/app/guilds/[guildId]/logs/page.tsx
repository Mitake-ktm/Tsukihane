import Header from '@/components/layout/Header';
import connectDB from '@/lib/db';
import { ModLog, ServerLog, LogCategory, LogSeverity } from '@/lib/models';

interface LogsPageProps {
    params: Promise<{ guildId: string }>;
    searchParams: Promise<{ tab?: string; category?: string; severity?: string }>;
}

const categoryEmojis: Record<LogCategory, string> = {
    MESSAGE: '💬',
    CHANNEL: '📁',
    ROLE: '🏷️',
    MEMBER: '👤',
    VOICE: '🔊',
    GUILD: '🏠',
    EMOJI: '😀',
    THREAD: '🧵',
    MODERATION: '🔨',
    OTHER: '📋'
};

const severityColors: Record<LogSeverity, string> = {
    INFO: 'badge-info',
    WARNING: 'badge-warning',
    ERROR: 'badge-error',
    CRITICAL: 'badge-error'
};

export default async function LogsPage({ params, searchParams }: LogsPageProps) {
    const { guildId } = await params;
    const search = await searchParams;
    const activeTab = search.tab || 'server';
    const filterCategory = search.category as LogCategory | undefined;
    const filterSeverity = search.severity as LogSeverity | undefined;

    await connectDB();

    // Build server log query
    const serverLogQuery: Record<string, unknown> = { guildId };
    if (filterCategory) serverLogQuery.category = filterCategory;
    if (filterSeverity) serverLogQuery.severity = filterSeverity;

    // Fetch logs
    const [modLogs, serverLogs, serverStats, categoryStats] = await Promise.all([
        ModLog.find({ guildId }).sort({ createdAt: -1 }).limit(100).lean(),
        ServerLog.find(serverLogQuery).sort({ createdAt: -1 }).limit(100).lean(),
        getServerLogStats(guildId),
        getCategoryBreakdown(guildId)
    ]);

    // Get mod stats
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const modStatsWeek = await ModLog.aggregate([
        { $match: { guildId, createdAt: { $gt: weekAgo } } },
        { $group: { _id: '$action', count: { $sum: 1 } } }
    ]);
    const totalModActions = modStatsWeek.reduce((sum, s) => sum + s.count, 0);

    return (
        <>
            <Header title="Logs & Analytics" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Logs & Analytics</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    View server events and moderation history
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
                            <div className="stat-value">{serverStats.total}</div>
                            <div className="stat-label">Server Events (7d)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{totalModActions}</div>
                            <div className="stat-label">Mod Actions (7d)</div>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon error">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div className="stat-content">
                            <div className="stat-value">{serverStats.errors}</div>
                            <div className="stat-label">Errors/Critical (7d)</div>
                        </div>
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header">
                        <h3 className="card-title">Event Categories (7d)</h3>
                    </div>
                    <div className="card-body">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {categoryStats.map((stat) => (
                                <a
                                    key={stat.category}
                                    href={`?tab=server&category=${stat.category}`}
                                    className={`badge ${filterCategory === stat.category ? 'badge-primary' : 'badge-info'}`}
                                    style={{ padding: '0.5rem 1rem', textDecoration: 'none', cursor: 'pointer' }}
                                >
                                    {categoryEmojis[stat.category as LogCategory] || '📋'} {stat.category}: {stat.count}
                                </a>
                            ))}
                            {filterCategory && (
                                <a
                                    href="?tab=server"
                                    className="badge badge-warning"
                                    style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}
                                >
                                    ✕ Clear Filter
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <a
                        href="?tab=server"
                        className={`btn ${activeTab === 'server' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        📋 Server Events ({serverLogs.length})
                    </a>
                    <a
                        href="?tab=moderation"
                        className={`btn ${activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                        🔨 Moderation Logs ({modLogs.length})
                    </a>
                </div>

                {/* Logs Table */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            {activeTab === 'server' ? 'Server Event Logs' : 'Moderation Logs'}
                        </h3>
                        <span className="badge badge-info">
                            {activeTab === 'server' ? serverLogs.length : modLogs.length} entries
                        </span>
                    </div>
                    <div className="card-body" style={{ padding: 0 }}>
                        {activeTab === 'server' ? (
                            serverLogs.length === 0 ? (
                                <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>
                                    No server logs found
                                </p>
                            ) : (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Type</th>
                                                <th>Category</th>
                                                <th>Severity</th>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {serverLogs.map((log: any) => (
                                                <tr key={log._id.toString()}>
                                                    <td style={{ whiteSpace: 'nowrap' }}>
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                                                            {log.type}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {categoryEmojis[log.category as LogCategory] || '📋'} {log.category}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${severityColors[log.severity as LogSeverity] || 'badge-info'}`}>
                                                            {log.severity}
                                                        </span>
                                                    </td>
                                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {log.description || '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )
                        ) : (
                            modLogs.length === 0 ? (
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
                                            {modLogs.map((log: any) => (
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
                            )
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

async function getServerLogStats(guildId: string) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, errors] = await Promise.all([
        ServerLog.countDocuments({ guildId, createdAt: { $gt: weekAgo } }),
        ServerLog.countDocuments({ guildId, createdAt: { $gt: weekAgo }, severity: { $in: ['ERROR', 'CRITICAL'] } })
    ]);

    return { total, errors };
}

async function getCategoryBreakdown(guildId: string) {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const result = await ServerLog.aggregate([
        { $match: { guildId, createdAt: { $gt: weekAgo } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);

    return result.map(r => ({ category: r._id, count: r.count }));
}

function getBadgeClass(action: string): string {
    const upper = action.toUpperCase();
    if (['BAN', 'KICK'].includes(upper)) return 'badge-error';
    if (['WARN', 'MUTE', 'TIMEOUT', 'AUTO_DELETE'].includes(upper)) return 'badge-warning';
    if (['UNMUTE', 'UNBAN'].includes(upper)) return 'badge-success';
    return 'badge-info';
}
