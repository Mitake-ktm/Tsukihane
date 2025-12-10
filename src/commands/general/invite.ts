import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('invite')
    .setDescription('Obtenir le lien d\'invitation du bot / Get the bot invite link');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const clientId = interaction.client.user?.id;

    // Generate invite link with necessary permissions
    const inviteLink = config.inviteLink ||
        `https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;

    const embed = new EmbedBuilder()
        .setTitle('🔗 Inviter Tsukihane')
        .setDescription('Clique sur le bouton ci-dessous pour m\'inviter sur ton serveur !')
        .setColor(config.colors.primary)
        .setThumbnail(interaction.client.user?.displayAvatarURL({ size: 256 }) || '')
        .addFields(
            { name: '✨ Fonctionnalités', value: '• Système de niveaux\n• Modération avancée\n• Commandes fun\n• Dashboard web', inline: false }
        )
        .setFooter({ text: 'Tsukihane • Akai Sekai' })
        .setTimestamp();

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setLabel('Inviter Tsukihane')
            .setStyle(ButtonStyle.Link)
            .setURL(inviteLink)
            .setEmoji('🔗'),
        new ButtonBuilder()
            .setLabel('Serveur Support')
            .setStyle(ButtonStyle.Link)
            .setURL('https://discord.gg/your-server') // Update with actual support server
            .setEmoji('💬')
    );

    await interaction.reply({ embeds: [embed], components: [row] });
}
