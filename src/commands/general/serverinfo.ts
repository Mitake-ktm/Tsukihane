import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ChannelType } from 'discord.js';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Afficher les informations du serveur / Display server information');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;

    // Fetch full guild data
    await guild.fetch();

    const owner = await guild.fetchOwner();
    const createdAt = `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`;

    // Channel counts
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = channels.filter(c => c.type === ChannelType.GuildVoice).size;
    const categories = channels.filter(c => c.type === ChannelType.GuildCategory).size;

    // Member counts
    const members = guild.memberCount;
    const onlineMembers = guild.members.cache.filter(m => m.presence?.status !== 'offline').size;
    const botCount = guild.members.cache.filter(m => m.user.bot).size;

    // Boost info
    const boostLevel = guild.premiumTier;
    const boostCount = guild.premiumSubscriptionCount || 0;

    const embed = new EmbedBuilder()
        .setTitle(`🏰 ${guild.name}`)
        .setThumbnail(guild.iconURL({ size: 256 }) || '')
        .setColor(config.colors.primary)
        .addFields(
            { name: '🆔 ID', value: `\`${guild.id}\``, inline: true },
            { name: '👑 Propriétaire', value: owner.user.tag, inline: true },
            { name: '📅 Créé', value: createdAt, inline: true },
            {
                name: '👥 Membres',
                value: `Total: **${members}**\nHumains: **${members - botCount}**\nBots: **${botCount}**`,
                inline: true
            },
            {
                name: '💬 Salons',
                value: `📝 Texte: **${textChannels}**\n🔊 Vocal: **${voiceChannels}**\n📁 Catégories: **${categories}**`,
                inline: true
            },
            {
                name: '💎 Boost',
                value: `Niveau: **${boostLevel}**\nBoosts: **${boostCount}**`,
                inline: true
            },
            {
                name: '🎭 Rôles',
                value: `**${guild.roles.cache.size}** rôles`,
                inline: true
            },
            {
                name: '😀 Emojis',
                value: `**${guild.emojis.cache.size}** emojis`,
                inline: true
            },
            {
                name: '🔒 Niveau de vérification',
                value: `${guild.verificationLevel}`,
                inline: true
            }
        )
        .setFooter({ text: 'Tsukihane • Akai Sekai' })
        .setTimestamp();

    // Add banner if exists
    if (guild.bannerURL()) {
        embed.setImage(guild.bannerURL({ size: 512 }) || '');
    }

    await interaction.reply({ embeds: [embed] });
}
