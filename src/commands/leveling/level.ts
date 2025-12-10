import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { successEmbed, errorEmbed, profileEmbed } from '../../utils/embed';
import { getUser, calculateXpForLevel, setLevel, addXp, resetUser, getUserRank } from '../../services/xpService';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('level')
    .setDescription('Afficher ton niveau ou gérer les niveaux')
    .addSubcommand(subcommand =>
        subcommand
            .setName('view')
            .setDescription('Voir ton niveau actuel')
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('set')
            .setDescription('Définir le niveau d\'un utilisateur (Admin)')
            .addUserOption(option =>
                option
                    .setName('utilisateur')
                    .setDescription('L\'utilisateur')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('niveau')
                    .setDescription('Le nouveau niveau')
                    .setMinValue(0)
                    .setMaxValue(1000)
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription('Ajouter de l\'XP à un utilisateur (Admin)')
            .addUserOption(option =>
                option
                    .setName('utilisateur')
                    .setDescription('L\'utilisateur')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('xp')
                    .setDescription('La quantité d\'XP à ajouter')
                    .setMinValue(1)
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('reset')
            .setDescription('Réinitialiser le niveau d\'un utilisateur (Admin)')
            .addUserOption(option =>
                option
                    .setName('utilisateur')
                    .setDescription('L\'utilisateur')
                    .setRequired(true)
            )
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'view': {
            const userData = await getUser(interaction.user.id, interaction.guild!.id);
            const xpForNextLevel = calculateXpForLevel(userData.level + 1);
            const rank = await getUserRank(interaction.user.id, interaction.guild!.id);

            const embed = profileEmbed(interaction.user, {
                level: userData.level,
                xp: userData.xp,
                totalXp: userData.totalXp,
                xpForNextLevel,
                rank,
                messageCount: userData.messageCount,
            });

            await interaction.reply({ embeds: [embed] });
            break;
        }

        case 'set': {
            // Check admin permissions
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Tu n\'as pas la permission d\'utiliser cette commande.')],
                    ephemeral: true,
                });
                return;
            }

            const target = interaction.options.getUser('utilisateur', true);
            const level = interaction.options.getInteger('niveau', true);

            await setLevel(target.id, interaction.guild!.id, level);

            await interaction.reply({
                embeds: [successEmbed('Niveau Modifié', `Le niveau de **${target.tag}** a été défini à **${level}**.`)],
            });
            break;
        }

        case 'add': {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Tu n\'as pas la permission d\'utiliser cette commande.')],
                    ephemeral: true,
                });
                return;
            }

            const target = interaction.options.getUser('utilisateur', true);
            const xp = interaction.options.getInteger('xp', true);

            const result = await addXp(target.id, interaction.guild!.id, xp);

            await interaction.reply({
                embeds: [successEmbed('XP Ajoutée', `**${xp} XP** ajoutée à **${target.tag}**.\nNouveau niveau: **${result.newLevel}**`)],
            });
            break;
        }

        case 'reset': {
            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Tu n\'as pas la permission d\'utiliser cette commande.')],
                    ephemeral: true,
                });
                return;
            }

            const target = interaction.options.getUser('utilisateur', true);

            await resetUser(target.id, interaction.guild!.id);

            await interaction.reply({
                embeds: [successEmbed('Niveau Réinitialisé', `Le niveau de **${target.tag}** a été réinitialisé.`)],
            });
            break;
        }
    }
}
