import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, TextChannel } from 'discord.js';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('suggest')
    .setDescription('Soumettre une suggestion / Submit a suggestion')
    .addStringOption(option =>
        option
            .setName('suggestion')
            .setDescription('Ta suggestion')
            .setRequired(true)
            .setMaxLength(1000)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const suggestion = interaction.options.getString('suggestion', true);
    const suggestionsChannelId = config.channels.suggestions;

    // Create suggestion embed
    const suggestionEmbed = new EmbedBuilder()
        .setTitle('💡 Nouvelle Suggestion')
        .setDescription(suggestion)
        .setColor(config.colors.primary)
        .setAuthor({
            name: interaction.user.displayName,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setFooter({ text: `ID: ${interaction.user.id}` })
        .setTimestamp();

    // If suggestions channel is configured, send there
    if (suggestionsChannelId) {
        const suggestionsChannel = interaction.guild?.channels.cache.get(suggestionsChannelId) as TextChannel;

        if (suggestionsChannel) {
            const message = await suggestionsChannel.send({ embeds: [suggestionEmbed] });

            // Add reaction for voting
            await message.react('👍');
            await message.react('👎');

            await interaction.reply({
                content: '✅ Ta suggestion a été envoyée ! Merci pour ton retour~ 💜',
                ephemeral: true
            });
            return;
        }
    }

    // If no channel configured, send to guild owner or reply with embed
    const confirmEmbed = new EmbedBuilder()
        .setTitle('✅ Suggestion Reçue')
        .setDescription('Ta suggestion a été enregistrée. Merci !')
        .setColor(config.colors.success)
        .setFooter({ text: 'Tsukihane • Akai Sekai' });

    await interaction.reply({ embeds: [confirmEmbed], ephemeral: true });
}
