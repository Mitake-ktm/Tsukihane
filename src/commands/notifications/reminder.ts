import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { addReminder, getReminders, deleteReminder } from '../../services/reminderService';
import { config } from '../../config/config';
import { parseDuration, formatDuration, formatTimestamp } from '../../utils/time';
import { isOwner } from '../../utils/permissions';

export const data = new SlashCommandBuilder()
    .setName('reminder')
    .setDescription('Gérer les rappels (propriétaire uniquement)')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Ajouter un rappel')
            .addStringOption(option =>
                option
                    .setName('message')
                    .setDescription('Le message du rappel')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('dans')
                    .setDescription('Délai (ex: 10m, 1h, 1d)')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('Afficher les rappels actifs')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Supprimer un rappel')
            .addStringOption(option =>
                option
                    .setName('id')
                    .setDescription('ID du rappel')
                    .setRequired(true)
            )
    );

export const ownerOnly = true;

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Check owner
    if (!isOwner(interaction.user.id)) {
        await interaction.reply({
            embeds: [errorEmbed('Accès Refusé', 'Cette commande est réservée au propriétaire du bot.')],
            ephemeral: true,
        });
        return;
    }

    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'add': {
            const message = interaction.options.getString('message', true);
            const durationStr = interaction.options.getString('dans', true);

            const duration = parseDuration(durationStr);
            if (!duration) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Format de durée invalide. Utilise: 10s, 5m, 1h, 1d, 1w')],
                    ephemeral: true,
                });
                return;
            }

            const remindAt = new Date(Date.now() + duration);
            const id = await addReminder(
                interaction.user.id,
                interaction.guild!.id,
                message,
                remindAt,
                interaction.channel?.id
            );

            await interaction.reply({
                embeds: [
                    successEmbed(
                        'Rappel Créé',
                        `Je te rappellerai dans **${formatDuration(duration)}**.\n\n📝 ${message}\n\n🆔 ID: ${id}`
                    )
                ],
                ephemeral: true,
            });
            break;
        }

        case 'list': {
            const reminders = await getReminders(interaction.user.id);

            if (reminders.length === 0) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('📋 Mes Rappels')
                            .setDescription('Tu n\'as aucun rappel actif.')
                            .setColor(config.colors.info)
                            .setTimestamp()
                    ],
                    ephemeral: true,
                });
                return;
            }

            const reminderList = reminders.map(r =>
                `**#${r.id}** - ${formatTimestamp(new Date(r.remindAt).getTime())}\n└ ${r.message.substring(0, 100)}${r.message.length > 100 ? '...' : ''}`
            ).join('\n\n');

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('📋 Mes Rappels')
                        .setDescription(reminderList)
                        .setColor(config.colors.info)
                        .setFooter({ text: `${reminders.length} rappel(s)` })
                        .setTimestamp()
                ],
                ephemeral: true,
            });
            break;
        }

        case 'delete': {
            const id = interaction.options.getString('id', true);

            const deleted = await deleteReminder(id, interaction.user.id);

            if (deleted) {
                await interaction.reply({
                    embeds: [successEmbed('Rappel Supprimé', `Le rappel #${id} a été supprimé.`)],
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Rappel introuvable ou tu n\'en es pas le propriétaire.')],
                    ephemeral: true,
                });
            }
            break;
        }
    }
}
