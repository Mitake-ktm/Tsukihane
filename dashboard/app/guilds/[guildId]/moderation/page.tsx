'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/Header';
import { use } from 'react';

interface BlacklistWord {
    id: number;
    word: string;
    addedBy: string;
    createdAt: number;
}

interface ModerationSettings {
    antiSpam: {
        enabled: boolean;
        messageLimit: number;
        timeWindow: number;
        duplicateLimit: number;
    };
    capsDetection: {
        enabled: boolean;
        threshold: number;
        minLength: number;
    };
    raidShield: boolean;
}

interface ModPageProps {
    params: Promise<{ guildId: string }>;
}

export default function ModerationPage({ params }: ModPageProps) {
    const { guildId } = use(params);
    const [blacklist, setBlacklist] = useState<BlacklistWord[]>([]);
    const [newWord, setNewWord] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<ModerationSettings>({
        antiSpam: {
            enabled: true,
            messageLimit: 5,
            timeWindow: 5000,
            duplicateLimit: 3,
        },
        capsDetection: {
            enabled: true,
            threshold: 0.7,
            minLength: 10,
        },
        raidShield: false,
    });

    useEffect(() => {
        fetchBlacklist();
        fetchSettings();
    }, [guildId]);

    const fetchBlacklist = async () => {
        try {
            const res = await fetch(`/api/guilds/${guildId}/moderation/blacklist`);
            const data = await res.json();
            if (data.success) {
                setBlacklist(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch blacklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch(`/api/guilds/${guildId}/moderation/settings`);
            const data = await res.json();
            if (data.success && data.data) {
                setSettings(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

    const addWord = async () => {
        if (!newWord.trim()) return;

        setSaving(true);
        try {
            const res = await fetch(`/api/guilds/${guildId}/moderation/blacklist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: newWord.trim() }),
            });
            const data = await res.json();
            if (data.success) {
                setBlacklist([data.data, ...blacklist]);
                setNewWord('');
            }
        } catch (error) {
            console.error('Failed to add word:', error);
        } finally {
            setSaving(false);
        }
    };

    const removeWord = async (id: number) => {
        try {
            const res = await fetch(`/api/guilds/${guildId}/moderation/blacklist/${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                setBlacklist(blacklist.filter((w) => w.id !== id));
            }
        } catch (error) {
            console.error('Failed to remove word:', error);
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await fetch(`/api/guilds/${guildId}/moderation/settings`, {
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

    return (
        <>
            <Header title="Moderation" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Moderation Settings</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Configure automod, word filters, and anti-spam settings
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Anti-Spam Settings */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Anti-Spam</h3>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.antiSpam.enabled}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            antiSpam: { ...settings.antiSpam, enabled: e.target.checked },
                                        })
                                    }
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Message Limit</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.antiSpam.messageLimit}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                antiSpam: { ...settings.antiSpam, messageLimit: parseInt(e.target.value) || 5 },
                                            })
                                        }
                                        min={1}
                                        max={20}
                                    />
                                    <span className="form-hint">Max messages before triggering</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Time Window (ms)</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.antiSpam.timeWindow}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                antiSpam: { ...settings.antiSpam, timeWindow: parseInt(e.target.value) || 5000 },
                                            })
                                        }
                                        min={1000}
                                        max={60000}
                                        step={1000}
                                    />
                                    <span className="form-hint">Detection window in milliseconds</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Duplicate Limit</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.antiSpam.duplicateLimit}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                antiSpam: { ...settings.antiSpam, duplicateLimit: parseInt(e.target.value) || 3 },
                                            })
                                        }
                                        min={1}
                                        max={10}
                                    />
                                    <span className="form-hint">Same message repeat limit</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Caps Detection */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Caps Abuse Detection</h3>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.capsDetection.enabled}
                                    onChange={(e) =>
                                        setSettings({
                                            ...settings,
                                            capsDetection: { ...settings.capsDetection, enabled: e.target.checked },
                                        })
                                    }
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Threshold ({Math.round(settings.capsDetection.threshold * 100)}%)</label>
                                    <input
                                        type="range"
                                        className="form-input"
                                        value={settings.capsDetection.threshold}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                capsDetection: { ...settings.capsDetection, threshold: parseFloat(e.target.value) },
                                            })
                                        }
                                        min={0.5}
                                        max={1}
                                        step={0.05}
                                        style={{ cursor: 'pointer' }}
                                    />
                                    <span className="form-hint">Percentage of caps to trigger</span>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Minimum Length</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={settings.capsDetection.minLength}
                                        onChange={(e) =>
                                            setSettings({
                                                ...settings,
                                                capsDetection: { ...settings.capsDetection, minLength: parseInt(e.target.value) || 10 },
                                            })
                                        }
                                        min={5}
                                        max={100}
                                    />
                                    <span className="form-hint">Minimum message length to check</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Raid Shield */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Raid Shield</h3>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={settings.raidShield}
                                    onChange={(e) =>
                                        setSettings({ ...settings, raidShield: e.target.checked })
                                    }
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="card-body">
                            <p className="text-muted">
                                When enabled, the bot will automatically take protective measures against potential raid attacks,
                                such as temporarily restricting new member joins and increasing moderation sensitivity.
                            </p>
                        </div>
                    </div>

                    {/* Word Blacklist */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Word Blacklist</h3>
                            <span className="badge badge-info">{blacklist.length} words</span>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Add a word to blacklist..."
                                    value={newWord}
                                    onChange={(e) => setNewWord(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addWord()}
                                />
                                <button className="btn btn-primary" onClick={addWord} disabled={saving || !newWord.trim()}>
                                    Add
                                </button>
                            </div>

                            {loading ? (
                                <p className="text-muted">Loading...</p>
                            ) : blacklist.length === 0 ? (
                                <p className="text-muted">No words in the blacklist</p>
                            ) : (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {blacklist.map((item) => (
                                        <span
                                            key={item.id}
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.375rem 0.75rem',
                                                background: 'var(--bg-elevated)',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.875rem',
                                            }}
                                        >
                                            {item.word}
                                            <button
                                                onClick={() => removeWord(item.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    padding: 0,
                                                    display: 'flex',
                                                }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </span>
                                    ))}
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
