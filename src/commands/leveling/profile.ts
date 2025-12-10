import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { profileEmbed, errorEmbed } from '../../utils/embed';
import { getUser, calculateXpForLevel, getUserRank } from '../../services/xpService';

export const data = new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Afficher le profil d\'un utilisateur')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('L\'utilisateur à afficher')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const target = interaction.options.getUser('utilisateur') || interaction.user;

    if (target.bot) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', 'Les bots n\'ont pas de profil.')],
            ephemeral: true,
        });
        return;
    }

    const userData = await getUser(target.id, interaction.guild!.id);
    const xpForNextLevel = calculateXpForLevel(userData.level + 1);
    const rank = await getUserRank(target.id, interaction.guild!.id);

    const embed = profileEmbed(target, {
        level: userData.level,
        xp: userData.xp,
        totalXp: userData.totalXp,
        xpForNextLevel,
        rank,
        messageCount: userData.messageCount,
    });

    await interaction.reply({ embeds: [embed] });
}
