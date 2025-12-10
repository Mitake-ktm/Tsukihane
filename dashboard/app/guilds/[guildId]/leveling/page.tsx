'use client';

import { useState, useEffect, use } from 'react';
import Header from '@/components/layout/Header';

interface LeaderboardEntry {
    userId: string;
    level: number;
    totalXp: number;
    rank: number;
}

interface LevelingSettings {
    enabled: boolean;
    xpPerMessage: { min: number; max: number };
    xpCooldown: number;
    announceInChannel: boolean;
}

interface LevelingPageProps {
    params: Promise<{ guildId: string }>;
}

export default function LevelingPage({ params }: LevelingPageProps) {
    const { guildId } = use(params);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<LevelingSettings>({
        enabled: true,
        xpPerMessage: { min: 15, max: 25 },
        xpCooldown: 60000,
        announceInChannel: true,
    });

    useEffect(() => {
        fetchData();
    }, [guildId]);

    const fetchData = async () => {
        try {
            const [leaderboardRes, settingsRes] = await Promise.all([
                fetch(`/api/guilds/${guildId}/leveling/leaderboard`),
                fetch(`/api/guilds/${guildId}/leveling/settings`),
            ]);

            const leaderboardData = await leaderboardRes.json();
            const settingsData = await settingsRes.json();

            if (leaderboardData.success) {
                setLeaderboard(leaderboardData.data);
            }
            if (settingsData.success && settingsData.data) {
                setSettings(settingsData.data);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await fetch(`/api/guilds/${guildId}/leveling/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        } finally {
            setSaving(false);
        }
    };

    const getRankBadge = (rank: number) => {
        if (rank === 1) return { emoji: '🥇', color: '#ffd700' };
        if (rank === 2) return { emoji: '🥈', color: '#c0c0c0' };
        if (rank === 3) return { emoji: '🥉', color: '#cd7f32' };
        return { emoji: '', color: 'var(--text-muted)' };
    };

    return (
        <>
            <Header title="Leveling" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Leveling System</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Configure XP, levels, and rank rewards
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* XP Settings */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">XP Settings</h3>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.enabled}
                                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Min XP per Message</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.xpPerMessage.min}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                xpPerMessage: { ...settings.xpPerMessage, min: parseInt(e.target.value) || 15 },
                                            })
                                        }
                                        min={1}
                                        max={100}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Max XP per Message</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.xpPerMessage.max}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                xpPerMessage: { ...settings.xpPerMessage, max: parseInt(e.target.value) || 25 },
                                            })
                                        }
                                        min={1}
                                        max={100}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">XP Cooldown (seconds)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.xpCooldown / 1000}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                xpCooldown: (parseInt(e.target.value) || 60) * 1000,
                                            })
                                        }
                                        min={0}
                                        max={300}
                                    />
                                    <span className="form-hint">Time before user can earn XP again</span>
                                </div>
                            </div>

                            <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={settings.announceInChannel}
                                        onChange={(e) => setSettings({ ...settings, announceInChannel: e.target.checked })}
                                        style={{ width: '18px', height: '18px' }}
                                    />
                                    <span>Announce level-ups in channel (otherwise send DM)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Leaderboard</h3>
                            <span className="badge badge-info">{leaderboard.length} members</span>
                        </div>
                        <div className="card-body" style={{ padding: 0 }}>
                            {loading ? (
                                <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</p>
                            ) : leaderboard.length === 0 ? (
                                <p className="text-muted" style={{ padding: '2rem', textAlign: 'center' }}>
                                    No users with XP yet
                                </p>
                            ) : (
                                <div className="table-container">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '60px' }}>Rank</th>
                                                <th>User ID</th>
                                                <th>Level</th>
                                                <th>Total XP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaderboard.map((entry) => {
                                                const badge = getRankBadge(entry.rank);
                                                return (
                                                    <tr key={entry.userId}>
                                                        <td>
                                                            <span style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '0.25rem',
                                                                color: badge.color,
                                                                fontWeight: entry.rank <= 3 ? '600' : '400'
                                                            }}>
                                                                {badge.emoji || '#'}{entry.rank <= 3 ? '' : entry.rank}
                                                            </span>
                                                        </td>
                                                        <td className="font-mono" style={{ fontSize: '0.85rem' }}>
                                                            {entry.userId}
                                                        </td>
                                                        <td>
                                                            <span className="badge badge-info">Level {entry.level}</span>
                                                        </td>
                                                        <td>{entry.totalXp.toLocaleString()} XP</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button className="btn btn-primary btn-lg" onClick={saveSettings} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
