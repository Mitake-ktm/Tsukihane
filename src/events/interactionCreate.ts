import { Events, Interaction, Collection } from 'discord.js';
import { Command } from '../handlers/commandHandler';
import { errorEmbed } from '../utils/embed';
import { hasPermissions, isOwner } from '../utils/permissions';

export const name = Events.InteractionCreate;
export const once = false;

export async function execute(interaction: Interaction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const client = interaction.client as typeof interaction.client & { commands: Collection<string, Command> };
    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Command not found: ${interaction.commandName}`);
        return;
    }

    try {
        // Check owner-only commands
        if (command.ownerOnly && !isOwner(interaction.user.id)) {
            await interaction.reply({
                embeds: [errorEmbed('Accès Refusé', 'Cette commande est réservée au propriétaire du bot.')],
                ephemeral: true,
            });
            return;
        }

        // Check permissions
        if (command.permissions && interaction.member && 'permissions' in interaction.member) {
            if (!hasPermissions(interaction.member as any, command.permissions)) {
                await interaction.reply({
                    embeds: [errorEmbed('Permissions Insuffisantes', "Tu n'as pas les permissions nécessaires pour utiliser cette commande.")],
                    ephemeral: true,
                });
                return;
            }
        }

        await command.execute(interaction);
    } catch (error) {
        console.error(`Error executing command ${interaction.commandName}:`, error);

        const errorMessage = {
            embeds: [errorEmbed('Erreur', "Une erreur s'est produite lors de l'exécution de cette commande.")],
            ephemeral: true,
        };

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}
