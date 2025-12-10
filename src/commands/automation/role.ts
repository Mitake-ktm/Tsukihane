import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { successEmbed, errorEmbed } from '../../utils/embed';

export const data = new SlashCommandBuilder()
    .setName('role')
    .setDescription('Gérer les rôles des utilisateurs')
    .addSubcommand(subcommand =>
        subcommand
            .setName('assign')
            .setDescription('Assigner un rôle à un utilisateur')
            .addUserOption(option =>
                option
                    .setName('utilisateur')
                    .setDescription('L\'utilisateur')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('Le rôle à assigner')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription('Retirer un rôle d\'un utilisateur')
            .addUserOption(option =>
                option
                    .setName('utilisateur')
                    .setDescription('L\'utilisateur')
                    .setRequired(true)
            )
            .addRoleOption(option =>
                option
                    .setName('role')
                    .setDescription('Le rôle à retirer')
                    .setRequired(true)
            )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles);

export const permissions = [PermissionFlagsBits.ManageRoles];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('utilisateur', true);
    const role = interaction.options.getRole('role', true);

    const member = await interaction.guild?.members.fetch(targetUser.id).catch(() => null);

    if (!member) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', 'Utilisateur introuvable sur ce serveur.')],
            ephemeral: true,
        });
        return;
    }

    // Check if the bot can manage this role
    const botMember = interaction.guild?.members.me;
    if (botMember && role.position >= botMember.roles.highest.position) {
        await interaction.reply({
            embeds: [errorEmbed('Erreur', 'Je ne peux pas gérer ce rôle car il est au-dessus de mon rôle le plus élevé.')],
            ephemeral: true,
        });
        return;
    }

    switch (subcommand) {
        case 'assign': {
            if (member.roles.cache.has(role.id)) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', `${targetUser.tag} a déjà ce rôle.`)],
                    ephemeral: true,
                });
                return;
            }

            try {
                await member.roles.add(role.id);
                await interaction.reply({
                    embeds: [successEmbed('Rôle Assigné', `Le rôle ${role} a été assigné à **${targetUser.tag}**.`)],
                });
            } catch (error) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Impossible d\'assigner le rôle.')],
                    ephemeral: true,
                });
            }
            break;
        }

        case 'remove': {
            if (!member.roles.cache.has(role.id)) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', `${targetUser.tag} n'a pas ce rôle.`)],
                    ephemeral: true,
                });
                return;
            }

            try {
                await member.roles.remove(role.id);
                await interaction.reply({
                    embeds: [successEmbed('Rôle Retiré', `Le rôle ${role} a été retiré de **${targetUser.tag}**.`)],
                });
            } catch (error) {
                await interaction.reply({
                    embeds: [errorEmbed('Erreur', 'Impossible de retirer le rôle.')],
                    ephemeral: true,
                });
            }
            break;
        }
    }
}
