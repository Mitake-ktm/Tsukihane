'use client';

import { useState, use } from 'react';
import Header from '@/components/layout/Header';

interface NotificationsPageProps {
    params: Promise<{ guildId: string }>;
}

export default function NotificationsPage({ params }: NotificationsPageProps) {
    const { guildId } = use(params);
    const [notificationType, setNotificationType] = useState<'chapter' | 'announcement' | 'status'>('chapter');
    const [message, setMessage] = useState('');
    const [channelId, setChannelId] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const templates = {
        chapter: `📚 **New Chapter Released!**\n\nChapter [X] of [Novel Name] is now available!\n\n➡️ Read now: [Link]\n\nEnjoy the read! 🌙`,
        announcement: `📢 **Announcement**\n\n[Your announcement here]\n\n— Tsukihane`,
        status: `🌙 **Status Update**\n\n[Update message]\n\nThank you for your patience!`,
    };

    const handleSend = async () => {
        if (!message.trim() || !channelId.trim()) {
            setResult({ success: false, message: 'Please fill in all fields' });
            return;
        }

        setSending(true);
        setResult(null);

        try {
            const res = await fetch(`/api/guilds/${guildId}/notifications/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: notificationType,
                    message,
                    channelId,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setResult({ success: true, message: 'Notification sent successfully!' });
                setMessage('');
            } else {
                setResult({ success: false, message: data.error || 'Failed to send notification' });
            }
        } catch (error) {
            setResult({ success: false, message: 'Failed to connect to server' });
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Header title="Notifications" />
            <div className="page-content">
                <h1 style={{ marginBottom: '0.5rem' }}>Notifications</h1>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                    Send announcements and chapter notifications
                </p>

                <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '800px' }}>
                    {/* Notification Type */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Notification Type</h3>
                        </div>
                        <div className="card-body">
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {[
                                    { value: 'chapter', label: '📚 Chapter Release', desc: 'Notify readers of a new chapter' },
                                    { value: 'announcement', label: '📢 Announcement', desc: 'General announcement' },
                                    { value: 'status', label: '🌙 Status Update', desc: 'Writing progress update' },
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        className={`btn ${notificationType === type.value ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={() => {
                                            setNotificationType(type.value as typeof notificationType);
                                            setMessage(templates[type.value as keyof typeof templates]);
                                        }}
                                        style={{ flex: '1', minWidth: '180px', padding: '1rem', flexDirection: 'column', alignItems: 'flex-start', height: 'auto' }}
                                    >
                                        <span style={{ fontSize: '1rem' }}>{type.label}</span>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>{type.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Message Composer */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Compose Message</h3>
                        </div>
                        <div className="card-body">
                            <div className="form-group">
                                <label className="form-label">Channel ID</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., 1234567890123456789"
                                    value={channelId}
                                    onChange={(e) => setChannelId(e.target.value)}
                                />
                                <span className="form-hint">Right-click a channel in Discord → Copy Channel ID</span>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Message</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Enter your notification message..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={8}
                                    style={{ fontFamily: 'inherit' }}
                                />
                                <span className="form-hint">Supports Discord markdown: **bold**, *italic*, __underline__</span>
                            </div>

                            {result && (
                                <div
                                    style={{
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        marginBottom: '1rem',
                                        background: result.success ? 'var(--success-bg)' : 'var(--error-bg)',
                                        color: result.success ? 'var(--success)' : 'var(--error)',
                                    }}
                                >
                                    {result.message}
                                </div>
                            )}

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleSend}
                                disabled={sending || !message.trim() || !channelId.trim()}
                                style={{ width: '100%' }}
                            >
                                {sending ? 'Sending...' : '🚀 Send Notification'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Templates */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Quick Templates</h3>
                        </div>
                        <div className="card-body">
                            <p className="text-muted" style={{ marginBottom: '1rem' }}>
                                Click a template to load it
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {Object.entries(templates).map(([key, template]) => (
                                    <button
                                        key={key}
                                        className="btn btn-secondary"
                                        onClick={() => setMessage(template)}
                                        style={{ textAlign: 'left', justifyContent: 'flex-start' }}
                                    >
                                        {key === 'chapter' && '📚 '}
                                        {key === 'announcement' && '📢 '}
                                        {key === 'status' && '🌙 '}
                                        {key.charAt(0).toUpperCase() + key.slice(1)} Template
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
