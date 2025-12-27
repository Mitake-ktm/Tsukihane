import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { searchLogs, getLogStats, LogSearchFilters, LogCategory, LogSeverity } from '../../services/loggingService';
import { config } from '../../config/config';

const LOG_CATEGORIES: LogCategory[] = ['MESSAGE', 'CHANNEL', 'ROLE', 'MEMBER', 'VOICE', 'GUILD', 'EMOJI', 'THREAD', 'MODERATION', 'OTHER'];
const LOG_SEVERITIES: LogSeverity[] = ['INFO', 'WARNING', 'ERROR', 'CRITICAL'];

const categoryEmojis: Record<LogCategory, string> = {
    MESSAGE: '💬',
    CHANNEL: '📁',
    ROLE: '🏷️',
    MEMBER: '👤',
    VOICE: '🔊',
    GUILD: '🏠',
    EMOJI: '😀',
    THREAD: '🧵',
    MODERATION: '🔨',
    OTHER: '📋'
};

const severityEmojis: Record<LogSeverity, string> = {
    INFO: '📘',
    WARNING: '⚠️',
    ERROR: '❌',
    CRITICAL: '🚨'
};

export const data = new SlashCommandBuilder()
    .setName('logsearch')
    .setDescription('Rechercher et filtrer les logs du serveur')
    .setDefaultMemberPermissions(PermissionFlagsBits.ViewAuditLog)
    .addSubcommand(sub =>
        sub.setName('recent')
            .setDescription('Voir les logs récents')
            .addIntegerOption(opt =>
                opt.setName('limit')
                    .setDescription('Nombre de logs à afficher (max 25)')
                    .setMinValue(1)
                    .setMaxValue(25)
            )
    )
    .addSubcommand(sub =>
        sub.setName('user')
            .setDescription('Rechercher les logs d\'un utilisateur')
            .addUserOption(opt =>
                opt.setName('target')
                    .setDescription('L\'utilisateur à rechercher')
                    .setRequired(true)
            )
            .addIntegerOption(opt =>
                opt.setName('limit')
                    .setDescription('Nombre de logs à afficher (max 25)')
                    .setMinValue(1)
                    .setMaxValue(25)
            )
    )
    .addSubcommand(sub =>
        sub.setName('category')
            .setDescription('Rechercher par catégorie')
            .addStringOption(opt =>
                opt.setName('category')
                    .setDescription('La catégorie à filtrer')
                    .setRequired(true)
                    .addChoices(
                        { name: '💬 Messages', value: 'MESSAGE' },
                        { name: '📁 Canaux', value: 'CHANNEL' },
                        { name: '🏷️ Rôles', value: 'ROLE' },
                        { name: '👤 Membres', value: 'MEMBER' },
                        { name: '🔊 Vocal', value: 'VOICE' },
                        { name: '🏠 Serveur', value: 'GUILD' },
                        { name: '😀 Emoji/Stickers', value: 'EMOJI' },
                        { name: '🧵 Threads', value: 'THREAD' },
                        { name: '🔨 Modération', value: 'MODERATION' }
                    )
            )
            .addIntegerOption(opt =>
                opt.setName('limit')
                    .setDescription('Nombre de logs à afficher (max 25)')
                    .setMinValue(1)
                    .setMaxValue(25)
            )
    )
    .addSubcommand(sub =>
        sub.setName('severity')
            .setDescription('Rechercher par sévérité')
            .addStringOption(opt =>
                opt.setName('level')
                    .setDescription('Le niveau de sévérité')
                    .setRequired(true)
                    .addChoices(
                        { name: '📘 Info', value: 'INFO' },
                        { name: '⚠️ Warning', value: 'WARNING' },
                        { name: '❌ Error', value: 'ERROR' },
                        { name: '🚨 Critical', value: 'CRITICAL' }
                    )
            )
            .addIntegerOption(opt =>
                opt.setName('limit')
                    .setDescription('Nombre de logs à afficher (max 25)')
                    .setMinValue(1)
                    .setMaxValue(25)
            )
    )
    .addSubcommand(sub =>
        sub.setName('stats')
            .setDescription('Voir les statistiques des logs')
            .addIntegerOption(opt =>
                opt.setName('days')
                    .setDescription('Nombre de jours à analyser (défaut: 7)')
                    .setMinValue(1)
                    .setMaxValue(30)
            )
    )
    .addSubcommand(sub =>
        sub.setName('advanced')
            .setDescription('Recherche avancée avec plusieurs filtres')
    );

export const permissions = [PermissionFlagsBits.ViewAuditLog];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId!;

    await interaction.deferReply({ ephemeral: true });

    switch (subcommand) {
        case 'recent':
            await handleRecent(interaction, guildId);
            break;
        case 'user':
            await handleUser(interaction, guildId);
            break;
        case 'category':
            await handleCategory(interaction, guildId);
            break;
        case 'severity':
            await handleSeverity(interaction, guildId);
            break;
        case 'stats':
            await handleStats(interaction, guildId);
            break;
        case 'advanced':
            await handleAdvanced(interaction, guildId);
            break;
    }
}

async function handleRecent(interaction: ChatInputCommandInteraction, guildId: string) {
    const limit = interaction.options.getInteger('limit') || 10;

    const result = await searchLogs(
        { guildId },
        { limit, sortOrder: 'desc' }
    );

    if (result.logs.length === 0) {
        await interaction.editReply({ content: '📭 Aucun log trouvé.' });
        return;
    }

    const embed = createLogsEmbed(result.logs, `📋 ${result.total} Logs Récents`, result.page, result.totalPages);
    await interaction.editReply({ embeds: [embed] });
}

async function handleUser(interaction: ChatInputCommandInteraction, guildId: string) {
    const target = interaction.options.getUser('target', true);
    const limit = interaction.options.getInteger('limit') || 10;

    const result = await searchLogs(
        { guildId, executorId: target.id },
        { limit, sortOrder: 'desc' }
    );

    const resultTarget = await searchLogs(
        { guildId, targetId: target.id },
        { limit, sortOrder: 'desc' }
    );

    // Merge and sort
    const allLogs = [...result.logs, ...resultTarget.logs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);

    if (allLogs.length === 0) {
        await interaction.editReply({ content: `📭 Aucun log trouvé pour ${target.tag}.` });
        return;
    }

    const embed = createLogsEmbed(allLogs, `👤 Logs de ${target.tag}`, 1, 1);
    await interaction.editReply({ embeds: [embed] });
}

async function handleCategory(interaction: ChatInputCommandInteraction, guildId: string) {
    const category = interaction.options.getString('category', true) as LogCategory;
    const limit = interaction.options.getInteger('limit') || 10;

    const result = await searchLogs(
        { guildId, categories: [category] },
        { limit, sortOrder: 'desc' }
    );

    if (result.logs.length === 0) {
        await interaction.editReply({ content: `📭 Aucun log dans la catégorie ${category}.` });
        return;
    }

    const emoji = categoryEmojis[category];
    const embed = createLogsEmbed(result.logs, `${emoji} Logs: ${category}`, result.page, result.totalPages);
    await interaction.editReply({ embeds: [embed] });
}

async function handleSeverity(interaction: ChatInputCommandInteraction, guildId: string) {
    const severity = interaction.options.getString('level', true) as LogSeverity;
    const limit = interaction.options.getInteger('limit') || 10;

    const result = await searchLogs(
        { guildId, severities: [severity] },
        { limit, sortOrder: 'desc' }
    );

    if (result.logs.length === 0) {
        await interaction.editReply({ content: `📭 Aucun log avec la sévérité ${severity}.` });
        return;
    }

    const emoji = severityEmojis[severity];
    const embed = createLogsEmbed(result.logs, `${emoji} Logs: ${severity}`, result.page, result.totalPages);
    await interaction.editReply({ embeds: [embed] });
}

async function handleStats(interaction: ChatInputCommandInteraction, guildId: string) {
    const days = interaction.options.getInteger('days') || 7;

    const stats = await getLogStats(guildId, days);

    const embed = new EmbedBuilder()
        .setTitle(`📊 Statistiques des Logs (${days} jours)`)
        .setColor(config.colors.info)
        .setTimestamp();

    embed.addFields({
        name: '📈 Total',
        value: `**${stats.totalLogs}** événements enregistrés`,
        inline: false
    });

    // By Category
    if (Object.keys(stats.byCategory).length > 0) {
        const categoryStats = Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => `${categoryEmojis[cat as LogCategory] || '📋'} ${cat}: **${count}**`)
            .join('\n');
        embed.addFields({ name: '📁 Par Catégorie', value: categoryStats, inline: true });
    }

    // By Severity
    if (Object.keys(stats.bySeverity).length > 0) {
        const severityStats = Object.entries(stats.bySeverity)
            .map(([sev, count]) => `${severityEmojis[sev as LogSeverity] || '📋'} ${sev}: **${count}**`)
            .join('\n');
        embed.addFields({ name: '⚡ Par Sévérité', value: severityStats, inline: true });
    }

    // Top Types
    if (stats.topTypes.length > 0) {
        const topTypesStr = stats.topTypes
            .slice(0, 5)
            .map((t, i) => `${i + 1}. \`${t.type}\`: **${t.count}**`)
            .join('\n');
        embed.addFields({ name: '🏆 Types Fréquents', value: topTypesStr, inline: false });
    }

    await interaction.editReply({ embeds: [embed] });
}

async function handleAdvanced(interaction: ChatInputCommandInteraction, guildId: string) {
    // Create select menus for advanced filtering
    const categorySelect = new StringSelectMenuBuilder()
        .setCustomId('log_category_select')
        .setPlaceholder('📁 Sélectionner une catégorie')
        .setMinValues(0)
        .setMaxValues(LOG_CATEGORIES.length)
        .addOptions(
            LOG_CATEGORIES.map(cat => ({
                label: cat,
                value: cat,
                emoji: categoryEmojis[cat]
            }))
        );

    const severitySelect = new StringSelectMenuBuilder()
        .setCustomId('log_severity_select')
        .setPlaceholder('⚡ Sélectionner une sévérité')
        .setMinValues(0)
        .setMaxValues(LOG_SEVERITIES.length)
        .addOptions(
            LOG_SEVERITIES.map(sev => ({
                label: sev,
                value: sev,
                emoji: severityEmojis[sev]
            }))
        );

    const searchButton = new ButtonBuilder()
        .setCustomId('log_search_execute')
        .setLabel('🔍 Rechercher')
        .setStyle(ButtonStyle.Primary);

    const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(categorySelect);
    const row2 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(severitySelect);
    const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(searchButton);

    const embed = new EmbedBuilder()
        .setTitle('🔍 Recherche Avancée')
        .setDescription('Utilisez les menus ci-dessous pour filtrer les logs. Cliquez sur **Rechercher** pour voir les résultats.')
        .setColor(config.colors.info);

    const response = await interaction.editReply({ embeds: [embed], components: [row1, row2, row3] });

    // Collect selections
    let selectedCategories: LogCategory[] = [];
    let selectedSeverities: LogSeverity[] = [];

    const collector = response.createMessageComponentCollector({
        time: 60000
    });

    collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: 'Ce menu n\'est pas pour vous.', ephemeral: true });
            return;
        }

        if (i.customId === 'log_category_select' && i.isStringSelectMenu()) {
            selectedCategories = i.values as LogCategory[];
            await i.deferUpdate();
        } else if (i.customId === 'log_severity_select' && i.isStringSelectMenu()) {
            selectedSeverities = i.values as LogSeverity[];
            await i.deferUpdate();
        } else if (i.customId === 'log_search_execute' && i.isButton()) {
            await i.deferUpdate();

            const filters: LogSearchFilters = { guildId };
            if (selectedCategories.length > 0) filters.categories = selectedCategories;
            if (selectedSeverities.length > 0) filters.severities = selectedSeverities;

            const result = await searchLogs(filters, { limit: 15, sortOrder: 'desc' });

            if (result.logs.length === 0) {
                await interaction.editReply({ content: '📭 Aucun log trouvé avec ces filtres.', embeds: [], components: [] });
            } else {
                const resultsEmbed = createLogsEmbed(result.logs, `🔍 Résultats (${result.total} total)`, result.page, result.totalPages);
                await interaction.editReply({ embeds: [resultsEmbed], components: [] });
            }

            collector.stop();
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
            await interaction.editReply({ content: '⏰ Temps écoulé.', embeds: [], components: [] }).catch(() => { });
        }
    });
}

function createLogsEmbed(logs: any[], title: string, page: number, totalPages: number): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(config.colors.info)
        .setFooter({ text: `Page ${page}/${totalPages}` })
        .setTimestamp();

    const description = logs.map(log => {
        const timestamp = Math.floor(new Date(log.createdAt).getTime() / 1000);
        const emoji = categoryEmojis[log.category as LogCategory] || '📋';
        const sevEmoji = severityEmojis[log.severity as LogSeverity] || '';
        const desc = log.description.length > 80 ? log.description.substring(0, 77) + '...' : log.description;
        return `${emoji}${sevEmoji} \`${log.type}\` - <t:${timestamp}:R>\n> ${desc}`;
    }).join('\n\n');

    embed.setDescription(description.length > 4000 ? description.substring(0, 3997) + '...' : description);

    return embed;
}
