import { Events, GuildMember, TextChannel, EmbedBuilder } from 'discord.js';
import { config } from '../config/config';

export const name = Events.GuildMemberAdd;
export const once = false;

export async function execute(member: GuildMember): Promise<void> {
    // Assign new member role
    if (config.roles.newMember) {
        const role = member.guild.roles.cache.get(config.roles.newMember);
        if (role) {
            await member.roles.add(role).catch(() => { });
        }
    }

    // Send welcome message
    if (config.channels.welcome) {
        const channel = member.guild.channels.cache.get(config.channels.welcome) as TextChannel;
        if (channel) {
            const embed = new EmbedBuilder()
                .setTitle('👋 Bienvenue !')
                .setDescription(`Bienvenue sur le serveur, ${member} !\nNous sommes maintenant **${member.guild.memberCount}** membres.`)
                .setColor(config.colors.success)
                .setThumbnail(member.user.displayAvatarURL({ size: 256 }))
                .setTimestamp();

            await channel.send({ content: `${member}`, embeds: [embed] });
        }
    }
}
