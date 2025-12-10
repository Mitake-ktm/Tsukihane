'use client';

import { useState, use } from 'react';
import Header from '@/components/layout/Header';

interface AutomationPageProps {
    params: Promise<{ guildId: string }>;
}

export default function AutomationPage({ params }: AutomationPageProps) {
    const { guildId } = use(params);
    const [saving, setSaving] = useState(false);

    const commands = [
        { name: 'warn', category: 'Moderation', enabled: true },
        { name: 'kick', category: 'Moderation', enabled: true },
        { name: 'ban', category: 'Moderation', enabled: true },
        { name: 'timeout', category: 'Moderation', enabled: true },
        { name: 'rank', category: 'Leveling', enabled: true },
        { name: 'leaderboard', category: 'Leveling', enabled: true },
        { name: 'setlevel', category: 'Leveling', enabled: true },
        { name: '8ball', category: 'Fun', enabled: true },
        { name: 'quote', category: 'Fun', enabled: true },
        { name: 'announce', category: 'Automation', enabled: true },
        { name: 'remind', category: 'Automation', enabled: true },
    ];

    const categories = [...new Set(commands.map(c => c.category))];

    return (
        <>
            <Header title="Automation" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Automation</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Configure commands, auto-posting, and channel tools
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Command Settings */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Command Settings</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted" style={{ marginBottom: '1rem' }}>
                                Enable or disable individual bot commands
                            </p>

                            {categories.map((category) => (
                                <div key={category} style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        marginBottom: '0.75rem',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {category}
                                    </h4>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                                        gap: '0.5rem'
                                    }}>
                                        {commands
                                            .filter((c) => c.category === category)
                                            .map((cmd) => (
                                                <label
                                                    key={cmd.name}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '0.625rem 0.875rem',
                                                        background: 'var(--bg-elevated)',
                                                        borderRadius: 'var(--radius-md)',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <span className="font-mono" style={{ fontSize: '0.875rem' }}>
                                                        /{cmd.name}
                                                    </span>
                                                    <label className="toggle">
                                                        <input type="checkbox" defaultChecked={cmd.enabled} />
                                                        <span className="toggle-slider"></span>
                                                    </label>
                                                </label>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Auto-Posting */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Auto-Posting</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                                Auto-posting configuration coming soon.
                                <br />
                                <span style={{ fontSize: '0.875rem' }}>
                                    Schedule automated messages, quotes, and updates.
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Keyword Reactions */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Keyword Reactions</h3>
                            <button className="btn btn-primary btn-sm">+ Add Reaction</button>
                        </div>
                        <div className="card-body">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Keywords</th>
                                            <th>Emoji</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>bonjour, salut, hey, coucou</td>
                                            <td>👋</td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm">Edit</button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>Delete</button>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>merci, thanks</td>
                                            <td>❤️</td>
                                            <td>
                                                <button className="btn btn-ghost btn-sm">Edit</button>
                                                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}>Delete</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                            className="btn btn-primary btn-lg"
                            onClick={() => setSaving(true)}
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
