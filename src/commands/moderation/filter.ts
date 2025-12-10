import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';
import { addToBlacklist, removeFromBlacklist, getBlacklist } from '../../services/moderationService';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('filter')
    .setDescription('Gérer la liste des mots interdits')
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Ajouter un mot à la liste noire')
            .addStringOption(option =>
                option
                    .setName('mot')
                    .setDescription('Le mot à interdire')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Retirer un mot de la liste noire')
            .addStringOption(option =>
                option
                    .setName('mot')
                    .setDescription('Le mot à retirer')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('Afficher la liste des mots interdits')
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

export const permissions = [PermissionFlagsBits.ManageMessages];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'add': {
            const word = interaction.options.getString('mot', true).toLowerCase();

            const added = await addToBlacklist(interaction.guild!.id, word, interaction.user.id);

            if (added) {
                await interaction.reply({
                    embeds: [successEmbed('Mot Ajouté', `Le mot "||${word}||" a été ajouté à la liste noire.`)],
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Ce mot est déjà dans la liste noire.')],
                    ephemeral: true,
                });
            }
            break;
        }

        case 'remove': {
            const word = interaction.options.getString('mot', true).toLowerCase();

            const removed = await removeFromBlacklist(interaction.guild!.id, word);

            if (removed) {
                await interaction.reply({
                    embeds: [successEmbed('Mot Retiré', `Le mot "||${word}||" a été retiré de la liste noire.`)],
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', "Ce mot n'est pas dans la liste noire.")],
                    ephemeral: true,
                });
            }
            break;
        }

        case 'list': {
            const words = await getBlacklist(interaction.guild!.id);

            if (words.length === 0) {
                await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('📝 Liste Noire')
                            .setDescription('Aucun mot dans la liste noire.')
                            .setColor(config.colors.info)
                            .setTimestamp()
                    ],
                    ephemeral: true,
                });
                return;
            }

            const spoilerWords = words.map(w => `||${w}||`).join(', ');

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('📝 Liste Noire')
                        .setDescription(spoilerWords)
                        .setFooter({ text: `${words.length} mot(s)` })
                        .setColor(config.colors.info)
                        .setTimestamp()
                ],
                ephemeral: true,
            });
            break;
        }
    }
}
