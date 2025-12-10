import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('roll')
    .setDescription('Lancer un dé')
    .addIntegerOption(option =>
        option
            .setName('faces')
            .setDescription('Nombre de faces (défaut: 6)')
            .setMinValue(2)
            .setMaxValue(1000)
            .setRequired(false)
    )
    .addIntegerOption(option =>
        option
            .setName('nombre')
            .setDescription('Nombre de dés à lancer (défaut: 1)')
            .setMinValue(1)
            .setMaxValue(10)
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const faces = interaction.options.getInteger('faces') || 6;
    const count = interaction.options.getInteger('nombre') || 1;

    const results: number[] = [];
    for (let i = 0; i < count; i++) {
        results.push(Math.floor(Math.random() * faces) + 1);
    }

    const total = results.reduce((a, b) => a + b, 0);

    const embed = new EmbedBuilder()
        .setTitle('🎲 Lancer de Dés')
        .setColor(config.colors.primary)
        .setDescription(
            count === 1
                ? `Tu as obtenu **${results[0]}** !`
                : `Résultats: ${results.map(r => `**${r}**`).join(', ')}\n\nTotal: **${total}**`
        )
        .setFooter({ text: `${count}d${faces}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
