import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Afficher l\'avatar d\'un utilisateur / Display a user\'s avatar')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('L\'utilisateur dont tu veux voir l\'avatar')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('utilisateur') || interaction.user;

    const avatarURL = user.displayAvatarURL({ size: 4096, extension: 'png' });
    const avatarGIF = user.displayAvatarURL({ size: 4096, extension: 'gif' });

    const embed = new EmbedBuilder()
        .setTitle(`🖼️ Avatar de ${user.displayName}`)
        .setColor(config.colors.primary)
        .setImage(avatarURL)
        .addFields(
            {
                name: '📥 Liens de téléchargement',
                value: `[PNG](${avatarURL}) • [GIF](${avatarGIF}) • [WEBP](${user.displayAvatarURL({ size: 4096, extension: 'webp' })})`,
                inline: false
            }
        )
        .setFooter({ text: `Demandé par ${interaction.user.displayName}` })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
