import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

const fortunes = [
    "🌟 Aujourd'hui sera une journée exceptionnelle pour toi !",
    "💫 Une surprise agréable t'attend au coin de la rue.",
    "🍀 La chance est de ton côté aujourd'hui.",
    "🎯 Tes efforts seront récompensés très bientôt.",
    "🌈 Après la pluie vient le beau temps. Patience !",
    "💝 L'amour frappe peut-être à ta porte.",
    "🚀 C'est le moment parfait pour commencer un nouveau projet.",
    "🎭 Attends-toi à des rencontres intéressantes.",
    "📚 Un apprentissage important t'attend.",
    "🎪 Une aventure passionnante se profile à l'horizon.",
    "🌙 Fais confiance à ton intuition aujourd'hui.",
    "🎨 Ta créativité sera à son apogée.",
    "🏆 Le succès est proche, continue tes efforts !",
    "🌸 La beauté se trouve dans les petites choses.",
    "⭐ Quelqu'un pense à toi en ce moment même.",
    "🎁 Un cadeau inattendu pourrait te faire sourire.",
    "🔮 Tes rêves sont sur le point de se réaliser.",
    "🌺 Prends le temps d'apprécier ce que tu as.",
    "💎 Ta valeur est bien plus grande que tu ne le penses.",
    "🦋 Un changement positif est en cours.",
];

export const data = new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Découvre ta fortune du jour');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

    const embed = new EmbedBuilder()
        .setTitle('🔮 Ta Fortune du Jour')
        .setDescription(fortune)
        .setColor(config.colors.primary)
        .setFooter({ text: `Demandé par ${interaction.user.username}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
