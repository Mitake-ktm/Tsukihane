export function parseDuration(input: string): number | null {
    const regex = /^(\d+)(s|m|h|d|w)$/i;
    const match = input.match(regex);

    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    const multipliers: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
        w: 7 * 24 * 60 * 60 * 1000,
    };

    return value * multipliers[unit];
}

export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return `${seconds} seconde${seconds > 1 ? 's' : ''}`;
}

export function formatTimestamp(timestamp: number): string {
    return `<t:${Math.floor(timestamp / 1000)}:F>`;
}

export function formatRelativeTime(timestamp: number): string {
    return `<t:${Math.floor(timestamp / 1000)}:R>`;
}

export function isExpired(timestamp: number): boolean {
    return Date.now() > timestamp;
}
