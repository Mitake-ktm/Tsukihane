'use client';

import { useState, use } from 'react';
import Header from '@/components/layout/Header';

interface SettingsPageProps {
    params: Promise<{ guildId: string }>;
}

export default function SettingsPage({ params }: SettingsPageProps) {
    const { guildId } = use(params);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        personality: 'neutral',
        prefix: '!',
        embedColor: '#5865F2',
        embedFooter: 'Tsukihane',
        theme: 'dark',
    });

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch(`/api/guilds/${guildId}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Header title="Bot Settings" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Bot Settings</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Customize the bot&apos;s personality and appearance
                </p>

                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '700px' }}>
                    {/* Personality */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Bot Personality</h3>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Response Style</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                                    {[
                                        { value: 'neutral', label: '😐 Neutral', desc: 'Professional and balanced' },
                                        { value: 'friendly', label: '😊 Friendly', desc: 'Warm and welcoming' },
                                        { value: 'formal', label: '🎩 Formal', desc: 'Polite and structured' },
                                        { value: 'chaos', label: '🎭 Chaos', desc: 'Fun and unpredictable' },
                                    ].map((style) => (
                                        <button
                                            key={style.value}
                                            className={`btn ${settings.personality === style.value ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setSettings({ ...settings, personality: style.value })}
                                            style={{
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                padding: '1rem',
                                                height: 'auto'
                                            }}
                                        >
                                            <span>{style.label}</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{style.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prefix */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Command Settings</h3>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Custom Prefix</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={settings.prefix}
                                    onChange={(e) => setSettings({ ...settings, prefix: e.target.value })}
                                    maxLength={5}
                                    style={{ maxWidth: '100px' }}
                                />
                                <span className="form-hint">Used for text commands (slash commands always work)</span>
                            </div>
                        </div>
                    </div>

                    {/* Embed Customization */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Embed Appearance</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Embed Color</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="color"
                                            value={settings.embedColor}
                                            onChange={(e) => setSettings({ ...settings, embedColor: e.target.value })}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                border: 'none',
                                                borderRadius: 'var(--radius-md)',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={settings.embedColor}
                                            onChange={(e) => setSettings({ ...settings, embedColor: e.target.value })}
                                            style={{ maxWidth: '120px' }}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Footer Text</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={settings.embedFooter}
                                        onChange={(e) => setSettings({ ...settings, embedFooter: e.target.value })}
                                        placeholder="Tsukihane"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div style={{ marginTop: '1rem' }}>
                                <label className="form-label">Preview</label>
                                <div style={{
                                    background: 'var(--bg-primary)',
                                    borderLeft: `4px solid ${settings.embedColor}`,
                                    borderRadius: 'var(--radius-md)',
                                    padding: '1rem',
                                }}>
                                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Example Embed Title</div>
                                    <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                        This is how your bot&apos;s embeds will look.
                                    </p>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginTop: '0.75rem',
                                        paddingTop: '0.5rem',
                                        borderTop: '1px solid var(--border-color)'
                                    }}>
                                        {settings.embedFooter}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Theme */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Dashboard Theme</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {[
                                    { value: 'dark', label: '🌙 Dark', color: '#0f0f0f' },
                                    { value: 'sakura', label: '🌸 Sakura', color: '#1a0a14' },
                                    { value: 'neon', label: '💜 Neon', color: '#0a0a0f' },
                                ].map((theme) => (
                                    <button
                                        key={theme.value}
                                        className={`btn ${settings.theme === theme.value ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => {
                                            setSettings({ ...settings, theme: theme.value });
                                            document.documentElement.setAttribute('data-theme', theme.value);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.25rem'
                                        }}
                                    >
                                        <span
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                background: theme.color,
                                                border: '2px solid var(--border-color)'
                                            }}
                                        />
                                        {theme.label}
                                    </button>
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
