'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Guild } from '@/lib/types';
import { getGuildIconUrl, getGuildInitials } from '@/lib/discord';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [guilds, setGuilds] = useState<Guild[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchGuilds();
    }
  }, [status]);

  const fetchGuilds = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/guilds');
      const data = await response.json();

      if (data.success) {
        setGuilds(data.data);
      } else {
        setError(data.error || 'Failed to fetch servers');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && loading)) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">🌙</div>
          <p className="text-muted">Loading your servers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo" style={{ background: 'var(--error-bg)' }}>❌</div>
          <h2 className="login-title">Error</h2>
          <p className="text-muted">{error}</p>
          <button className="btn btn-primary mt-4" onClick={fetchGuilds}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{
            fontSize: '4rem',
            marginBottom: '1rem',
            filter: 'drop-shadow(0 0 20px rgba(88, 101, 242, 0.5))'
          }}>
            🌙
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Tsukihane Dashboard</h1>
          <p className="text-muted">Select a server to manage</p>
        </header>

        {guilds.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-muted)"
              strokeWidth="1.5"
              style={{ width: '64px', height: '64px', margin: '0 auto 1rem' }}
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 style={{ marginBottom: '0.5rem' }}>No Servers Found</h3>
            <p className="text-muted" style={{ maxWidth: '400px', margin: '0 auto' }}>
              You don&apos;t have access to any servers where Tsukihane is installed,
              or the bot isn&apos;t in any of your servers yet.
            </p>
            <a
              href={`https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_CLIENT_ID}&permissions=8&scope=bot%20applications.commands`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary mt-4"
            >
              Add Tsukihane to a Server
            </a>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {guilds.map((guild) => {
              const iconUrl = getGuildIconUrl(guild.id, guild.icon, 256);

              return (
                <Link
                  key={guild.id}
                  href={`/guilds/${guild.id}`}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt=""
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: 'var(--accent-light)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        fontWeight: '600'
                      }}
                    >
                      {getGuildInitials(guild.name)}
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{
                      fontSize: '1rem',
                      marginBottom: '0.25rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {guild.name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {guild.owner ? 'Owner' : 'Administrator'}
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--text-muted)"
                    strokeWidth="2"
                    style={{ width: '20px', height: '20px', flexShrink: 0 }}
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              );
            })}
          </div>
        )}

        <footer style={{
          textAlign: 'center',
          marginTop: '3rem',
          color: 'var(--text-muted)',
          fontSize: '0.875rem'
        }}>
          Logged in as <strong>{session?.user?.name}</strong>
          {' · '}
          <button
            onClick={() => router.push('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </footer>
      </div>
    </div>
  );
}
