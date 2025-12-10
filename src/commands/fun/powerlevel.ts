import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';
import { getUser } from '../../services/xpService';

const powerRanks = [
    { min: 0, max: 999, rank: 'Mortel', emoji: '👶', description: 'Tu viens de commencer ton chemin...' },
    { min: 1000, max: 4999, rank: 'Novice', emoji: '🌱', description: 'Les premiers pas vers la puissance.' },
    { min: 5000, max: 9999, rank: 'Apprenti Guerrier', emoji: '⚔️', description: 'Tu commences à te faire remarquer.' },
    { min: 10000, max: 29999, rank: 'Élite', emoji: '💪', description: 'Plus fort que la plupart des mortels.' },
    { min: 30000, max: 49999, rank: 'Maître', emoji: '🥷', description: 'Les gens te craignent et te respectent.' },
    { min: 50000, max: 99999, rank: 'Champion', emoji: '🏆', description: 'Légende vivante parmi les guerriers.' },
    { min: 100000, max: 499999, rank: 'Démon', emoji: '👹', description: 'Ta puissance défie les lois de la nature.' },
    { min: 500000, max: 999999, rank: 'Dieu', emoji: '⚡', description: 'Les mortels tremblent en ta présence.' },
    { min: 1000000, max: 8999999, rank: 'Être Suprême', emoji: '🌟', description: 'Tu transcendes les dimensions.' },
    { min: 9000000, max: Infinity, rank: 'IT\'S OVER 9000!!!', emoji: '🔥', description: 'NANI?!' },
];

function getPowerRank(power: number): { rank: string; emoji: string; description: string } {
    for (const pr of powerRanks) {
        if (power >= pr.min && power <= pr.max) {
            return { rank: pr.rank, emoji: pr.emoji, description: pr.description };
        }
    }
    return powerRanks[0];
}

export const data = new SlashCommandBuilder()
    .setName('power-level')
    .setDescription('Mesure ton niveau de puissance / Measure your power level')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('Mesurer la puissance de cet utilisateur')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('utilisateur') || interaction.user;

    // Base power on user level if available
    let basePower = 1;
    try {
        const userData = await getUser(user.id, interaction.guild!.id);
        if (userData) {
            basePower = userData.level * 1000 + userData.xp;
        }
    } catch {
        // No level data
    }

    // Add some randomness
    const multiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    const power = Math.floor(basePower * multiplier);

    const { rank, emoji, description } = getPowerRank(power);

    // Create power bar
    const maxPower = 100000;
    const barLength = Math.min(10, Math.floor((power / maxPower) * 10));
    const powerBar = '▓'.repeat(barLength) + '░'.repeat(10 - barLength);

    const embed = new EmbedBuilder()
        .setTitle(`⚡ Niveau de Puissance`)
        .setDescription(`*Le scouter analyse **${user.displayName}**...*`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setColor(power > 9000000 ? 0xFF0000 : config.colors.primary)
        .addFields(
            { name: '💥 Puissance', value: `**${power.toLocaleString()}**`, inline: true },
            { name: `${emoji} Rang`, value: rank, inline: true },
            { name: '📊 Jauge', value: `\`${powerBar}\``, inline: false },
            { name: '📜 Évaluation', value: description, inline: false }
        )
        .setFooter({ text: power > 9000000 ? 'C\'EST PLUS DE 9000 !!!' : 'Tsukihane • Power Level' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
