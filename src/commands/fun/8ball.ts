import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

const responses = [
    // Positive
    "C'est certain.",
    "C'est décidément ainsi.",
    "Sans aucun doute.",
    "Oui, définitivement.",
    "Tu peux compter dessus.",
    "Comme je le vois, oui.",
    "Très probablement.",
    "Les perspectives sont bonnes.",
    "Oui.",
    "Les signes indiquent que oui.",
    // Neutral
    "Réponse floue, essaie encore.",
    "Redemande plus tard.",
    "Mieux vaut ne pas te le dire maintenant.",
    "Je ne peux pas prédire maintenant.",
    "Concentre-toi et redemande.",
    // Negative
    "N'y compte pas.",
    "Ma réponse est non.",
    "Mes sources disent non.",
    "Les perspectives ne sont pas bonnes.",
    "C'est très douteux.",
];

export const data = new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Pose une question à la boule magique')
    .addStringOption(option =>
        option
            .setName('question')
            .setDescription('Ta question')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);
    const response = responses[Math.floor(Math.random() * responses.length)];

    const embed = new EmbedBuilder()
        .setTitle('🎱 Boule Magique')
        .setColor(config.colors.primary)
        .addFields(
            { name: '❓ Question', value: question },
            { name: '🔮 Réponse', value: response }
        )
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
