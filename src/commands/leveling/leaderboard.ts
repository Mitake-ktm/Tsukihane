import { SlashCommandBuilder, ChatInputCommandInteraction } from 'discord.js';
import { leaderboardEmbed } from '../../utils/embed';
import { getLeaderboard, getTotalUsers } from '../../services/xpService';

export const data = new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Afficher le classement du serveur')
    .addIntegerOption(option =>
        option
            .setName('page')
            .setDescription('Numéro de page')
            .setMinValue(1)
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const page = interaction.options.getInteger('page') || 1;
    const perPage = 10;
    const offset = (page - 1) * perPage;

    const entries = await getLeaderboard(interaction.guild!.id, perPage, offset);
    const totalUsers = await getTotalUsers(interaction.guild!.id);
    const totalPages = Math.ceil(totalUsers / perPage) || 1;

    if (page > totalPages) {
        await interaction.reply({
            content: `Cette page n'existe pas. Il y a ${totalPages} page(s) au total.`,
            ephemeral: true,
        });
        return;
    }

    const rankedEntries = entries.map((entry, index) => ({
        ...entry,
        rank: offset + index + 1,
    }));

    const embed = leaderboardEmbed(rankedEntries, page, totalPages);

    await interaction.reply({ embeds: [embed] });
}
