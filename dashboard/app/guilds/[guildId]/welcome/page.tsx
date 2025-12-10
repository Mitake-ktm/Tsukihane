'use client';

import { useState, use } from 'react';
import Header from '@/components/layout/Header';

interface WelcomePageProps {
    params: Promise<{ guildId: string }>;
}

export default function WelcomePage({ params }: WelcomePageProps) {
    const { guildId } = use(params);
    const [welcomeEnabled, setWelcomeEnabled] = useState(true);
    const [welcomeChannel, setWelcomeChannel] = useState('');
    const [welcomeMessage, setWelcomeMessage] = useState(
        'Welcome to the server, {user}! 🎉\n\nYou are member #{memberCount}.'
    );
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/guilds/${guildId}/welcome`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    enabled: welcomeEnabled,
                    channelId: welcomeChannel,
                    message: welcomeMessage,
                }),
            });
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Header title="Welcome & Roles" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Welcome & Engagement</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Configure welcome messages and reaction roles
                </p>

                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {/* Welcome Messages */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Welcome Messages</h3>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={welcomeEnabled}
                                    onChange={(e) => setWelcomeEnabled(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Welcome Channel ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 1234567890123456789"
                                    value={welcomeChannel}
                                    onChange={(e) => setWelcomeChannel(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Welcome Message</label>
                                <textarea
                                    className="form-textarea"
                                    value={welcomeMessage}
                                    onChange={(e) => setWelcomeMessage(e.target.value)}
                                    rows={4}
                                />
                                <span className="form-hint">
                                    Variables: {'{user}'} = mention, {'{username}'} = name, {'{memberCount}'} = count, {'{server}'} = server name
                                </span>
                            </div>

                            {/* Preview */}
                            <div style={{
                                background: 'var(--bg-primary)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                                    Preview
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                    {welcomeMessage
                                        .replace('{user}', '@NewUser')
                                        .replace('{username}', 'NewUser')
                                        .replace('{memberCount}', '1234')
                                        .replace('{server}', 'Your Server')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reaction Roles */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Reaction Roles</h3>
                            <button className="btn btn-primary btn-sm">+ Add Panel</button>
                        </div>
                        <div className="card-body">
                            <p className="text-muted" style={{ textAlign: 'center', padding: '2rem' }}>
                                No reaction role panels configured yet.
                                <br />
                                <span style={{ fontSize: '0.875rem' }}>
                                    Create a panel to let users self-assign roles by reacting to a message.
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Fun Commands */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Fun Commands</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                                {['8ball', 'quote', 'meme', 'flip'].map((cmd) => (
                                    <label key={cmd} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.75rem 1rem',
                                        background: 'var(--bg-elevated)',
                                        borderRadius: 'var(--radius-md)'
                                    }}>
                                        <span style={{ textTransform: 'capitalize' }}>{cmd}</span>
                                        <label className="toggle">
                                            <input type="checkbox" defaultChecked />
                                            <span className="toggle-slider"></span>
                                        </label>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
