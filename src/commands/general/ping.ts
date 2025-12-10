import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';
import { t } from '../../config/i18n';

export const data = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Afficher la latence du bot / Show bot latency');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const embed = new EmbedBuilder()
        .setTitle('🏓 Pong!')
        .setColor(config.colors.primary)
        .addFields(
            { name: '📡 Latence', value: `\`${latency}ms\``, inline: true },
            { name: '💻 API Discord', value: `\`${apiLatency}ms\``, inline: true }
        )
        .setFooter({ text: 'Tsukihane • Akai Sekai' })
        .setTimestamp();

    await interaction.editReply({ content: '', embeds: [embed] });
}
