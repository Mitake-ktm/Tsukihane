'use client';

import { signOut, useSession } from 'next-auth/react';
import { getAvatarUrl } from '@/lib/discord';

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const { data: session } = useSession();

    const user = session?.user;
    const avatarUrl = user?.image || '';

    return (
        <header className="page-header">
            <h2>{title}</h2>

            <div className="user-info">
                {user && (
                    <>
                        <div className="user-details">
                            <span className="user-name">{user.name}</span>
                            <span className="user-role">Administrator</span>
                        </div>
                        <img
                            src={avatarUrl}
                            alt={user.name || ''}
                            className="avatar avatar-md"
                        />
                        <button
                            className="btn btn-ghost btn-icon"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            title="Sign Out"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                            </svg>
                        </button>
                    </>
                )}
            </div>
        </header>
    );
}
