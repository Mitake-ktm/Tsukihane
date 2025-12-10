// User types
export interface User {
    id: string;
    name: string;
    email?: string;
    image?: string;
    accessToken?: string;
}

// Guild types
export interface Guild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

export interface GuildSettings {
    guildId: string;
    welcomeChannelId: string | null;
    welcomeMessage: string | null;
    logChannelId: string | null;
    botPrefix: string;
    botPersonality: 'neutral' | 'friendly' | 'formal' | 'chaos';
    embedColor: number;
    embedFooter: string | null;
    raidShieldEnabled: boolean;
    createdAt: number;
    updatedAt: number;
}

// Moderation types
export interface Warning {
    id: number;
    userId: string;
    guildId: string;
    moderatorId: string;
    reason: string;
    createdAt: number;
}

export interface ModLog {
    id: number;
    guildId: string;
    userId: string;
    moderatorId: string;
    action: string;
    reason: string | null;
    details: string | null;
    createdAt: number;
}

export interface BlacklistWord {
    id: number;
    guildId: string;
    word: string;
    addedBy: string;
    createdAt: number;
}

// Leveling types
export interface UserLevel {
    userId: string;
    guildId: string;
    xp: number;
    level: number;
    totalXp: number;
    lastXpGain: number;
    messageCount: number;
    createdAt: number;
    updatedAt: number;
}

export interface LeaderboardEntry {
    userId: string;
    level: number;
    totalXp: number;
    rank?: number;
}

// Notification types
export interface NotificationTemplate {
    id: number;
    guildId: string;
    name: string;
    type: 'chapter' | 'announcement' | 'status';
    channelId: string | null;
    messageTemplate: string;
    embedEnabled: boolean;
    createdAt: number;
}

export interface Reminder {
    id: number;
    userId: string;
    guildId: string;
    channelId: string | null;
    message: string;
    remindAt: number;
    createdAt: number;
    completed: boolean;
}

// Owner tools types
export interface OwnerNote {
    id: number;
    ownerId: string;
    title: string;
    content: string | null;
    category: string;
    createdAt: number;
    updatedAt: number;
}

export interface WritingTask {
    id: number;
    ownerId: string;
    title: string;
    description: string | null;
    deadline: number | null;
    progress: number;
    status: 'pending' | 'in_progress' | 'completed';
    createdAt: number;
    updatedAt: number;
}

// Command types
export interface CommandSetting {
    id: number;
    guildId: string;
    commandName: string;
    enabled: boolean;
    cooldownSeconds: number;
    allowedRoles: string[];
    alias: string | null;
}

// Reaction role types
export interface ReactionRole {
    id: number;
    guildId: string;
    messageId: string;
    channelId: string;
    emoji: string;
    roleId: string;
    mode: 'multi' | 'single';
}

// Custom command types
export interface CustomCommand {
    id: number;
    guildId: string;
    triggerWord: string;
    responseText: string | null;
    responseImageUrl: string | null;
    createdBy: string;
    createdAt: number;
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// Stats types
export interface GuildStats {
    totalMembers: number;
    newMembersWeek: number;
    totalMessages: number;
    moderationActions: number;
    levelUps: number;
    commandsUsed: number;
}
