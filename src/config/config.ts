import { PermissionFlagsBits, ActivityType } from 'discord.js';

export const config = {
    // Bot owner ID
    ownerId: process.env.OWNER_ID || '',

    // Default language for bot messages ('fr' or 'en')
    language: 'fr' as 'fr' | 'en',

    // Supported languages
    supportedLanguages: ['fr', 'en'] as const,

    // Channel IDs (to be configured)
    channels: {
        moderationLogs: '1276872203283206180',
        announcements: '1438975899612741894',
        welcome: '1276872203555704921',
        levelUp: '1276872203685859475',
        reminders: '1276872203283206178',
        suggestions: '', // For /suggest command
    },

    // Role IDs (to be configured)
    roles: {
        newMember: '',
        muted: '',
    },

    // Bot presence settings - Akai Sekai theme
    presence: {
        activities: [
            { name: '📖 Arc 1 : L\'Immeuble', type: ActivityType.Playing },
            { name: '🏢 Étage 42 — Descendre...', type: ActivityType.Playing },
            { name: '👁️ Les murs observent', type: ActivityType.Watching },
            { name: '🔴 赤い世界', type: ActivityType.Playing },
            { name: '🚪 Chaque porte cache un secret', type: ActivityType.Watching },
            { name: '🌙 Tsuki no Hane', type: ActivityType.Listening },
            { name: '⚔️ Mike...', type: ActivityType.Competing },
        ],
        rotationInterval: 300000, // 5 minutes
    },

    // Moderation settings
    moderation: {
        // Blacklisted words
        blacklist: [] as string[],

        // Anti-spam settings
        antiSpam: {
            enabled: true,
            messageLimit: 5, // messages
            timeWindow: 5000, // milliseconds
            duplicateLimit: 3, // same message count
        },

        // Caps abuse detection
        capsDetection: {
            enabled: true,
            threshold: 0.7, // 70% caps minimum
            minLength: 10, // minimum message length to check
        },

        // Auto-delete settings
        autoDelete: true,
    },

    // Leveling system settings - Akai Sekai themed roles
    leveling: {
        enabled: true,

        // XP per message (random between min and max)
        xpPerMessage: {
            min: 15,
            max: 25,
        },

        // Cooldown between XP gains (milliseconds)
        xpCooldown: 60000, // 1 minute

        // XP multipliers for specific channels (channelId: multiplier)
        channelMultipliers: {} as Record<string, number>,

        // Level calculation formula: XP = base * (level ^ exponent)
        levelFormula: {
            base: 100,
            exponent: 1.5,
        },

        // Rank roles - Akai Sekai : Mike themed (level: { roleId, name, emoji })
        rankRoles: {
            5: { roleId: '', name: 'Nouveau Locataire', emoji: '🚪' },
            15: { roleId: '', name: 'Explorateur', emoji: '🔦' },
            30: { roleId: '', name: 'Survivant', emoji: '👁️' },
            50: { roleId: '', name: 'Gardien des Secrets', emoji: '🗝️' },
            75: { roleId: '', name: 'Combattant de l\'Ombre', emoji: '⚔️' },
            100: { roleId: '', name: 'Entity', emoji: '🔴' },
        } as Record<number, { roleId: string; name: string; emoji: string }>,

        // Remove previous rank role when leveling up
        removePreviousRole: true,

        // Level-up announcement
        announceInChannel: true, // false = DM
    },

    // Reaction roles configuration
    reactionRoles: {
        enabled: false,
        // messageId: { emoji: roleId }
        messages: {} as Record<string, Record<string, string>>,
    },

    // Keywords that trigger reactions - Extended for anime/web novel community
    keywordReactions: [
        { keywords: ['bonjour', 'salut', 'hey', 'coucou', 'ohayo', 'yo'], emoji: '👋' },
        { keywords: ['merci', 'thanks', 'arigatou', 'thx'], emoji: '❤️' },
        { keywords: ['chapitre', 'chapter', 'update'], emoji: '📖' },
        { keywords: ['hype', 'hyped', 'excited', 'trop bien'], emoji: '🔥' },
        { keywords: ['kawaii', 'cute', 'mignon', 'adorable'], emoji: '✨' },
        { keywords: ['rip', 'sad', 'triste'], emoji: '😢' },
        { keywords: ['gg', 'bravo', 'bien joué', 'nice'], emoji: '🎉' },
        { keywords: ['café', 'coffee', 'tired', 'fatigué'], emoji: '☕' },
        { keywords: ['peur', 'scary', 'horror', 'creepy'], emoji: '👻' },
        { keywords: ['mike', 'akai', 'sekai'], emoji: '🔴' },
    ],

    // Special mentions handling - Akai Sekai themed
    specialMentions: {
        mike: {
            enabled: true,
            responses: [
                "👁️ Mike... quelqu'un t'appelle depuis l'étage du dessous...",
                "🔴 *Les murs murmurent le nom de Mike...*",
                "🚪 Une porte vient de s'ouvrir... Mike ?",
                "⚠️ Attention, mentionner Mike attire... des choses.",
                "🏢 L'immeuble a entendu. Mike a été convoqué.",
            ],
        },
    },

    // Permission requirements for commands
    permissions: {
        moderation: [PermissionFlagsBits.ModerateMembers],
        admin: [PermissionFlagsBits.Administrator],
    },

    // Embed colors - Akai Sekai palette
    colors: {
        primary: 0x7F0799,   // Purple (accent)
        success: 0x44CCFF,   // Sky Blue
        warning: 0xFFD93D,   // Gold
        error: 0xC1292E,     // Crimson
        info: 0x44CCFF,      // Sky Blue
        levelUp: 0x7F0799,   // Purple
        dark: 0x211A1D,      // Raisin Black
    },

    // Bot invite link (to be configured)
    inviteLink: process.env.BOT_INVITE_LINK || '',

    // Giveaway settings
    giveaway: {
        emoji: '🎉',
        embedColor: 0x7F0799,
    },
};

export type Config = typeof config;
export type SupportedLanguage = typeof config.supportedLanguages[number];
