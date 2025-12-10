import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { config } from '../../config/config';

const shipDescriptions: Record<string, { min: number; max: number; emoji: string; description: string }> = {
    soulmates: { min: 90, max: 100, emoji: '💕', description: 'Destinés l\'un à l\'autre ! Les étoiles l\'ont prédit !' },
    perfect: { min: 75, max: 89, emoji: '💖', description: 'Un couple presque parfait ! L\'amour est dans l\'air~' },
    good: { min: 50, max: 74, emoji: '💗', description: 'Ça peut marcher ! Avec un peu d\'effort...' },
    maybe: { min: 25, max: 49, emoji: '💛', description: 'C\'est... compliqué. Mais pas impossible !' },
    awkward: { min: 10, max: 24, emoji: '😅', description: 'Hmm... Plutôt amis, non ?' },
    no: { min: 0, max: 9, emoji: '💔', description: 'Les étoiles disent non. Désolé...' },
};

function getShipDescription(percent: number): { emoji: string; description: string } {
    for (const key of Object.keys(shipDescriptions)) {
        const range = shipDescriptions[key];
        if (percent >= range.min && percent <= range.max) {
            return { emoji: range.emoji, description: range.description };
        }
    }
    return { emoji: '❓', description: 'Les étoiles sont confuses...' };
}

function generateShipName(name1: string, name2: string): string {
    const half1 = name1.slice(0, Math.ceil(name1.length / 2));
    const half2 = name2.slice(Math.floor(name2.length / 2));
    return half1 + half2;
}

export const data = new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship deux personnes ensemble / Ship two people together')
    .addUserOption(option =>
        option
            .setName('personne1')
            .setDescription('Première personne')
            .setRequired(true)
    )
    .addUserOption(option =>
        option
            .setName('personne2')
            .setDescription('Deuxième personne')
            .setRequired(true)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user1 = interaction.options.getUser('personne1', true);
    const user2 = interaction.options.getUser('personne2', true);

    // Generate consistent percentage based on user IDs
    const combinedId = user1.id < user2.id
        ? user1.id + user2.id
        : user2.id + user1.id;

    let hash = 0;
    for (let i = 0; i < combinedId.length; i++) {
        hash = ((hash << 5) - hash) + combinedId.charCodeAt(i);
        hash = hash & hash;
    }
    const percent = Math.abs(hash) % 101;

    const member1 = interaction.guild?.members.cache.get(user1.id) as GuildMember | undefined;
    const member2 = interaction.guild?.members.cache.get(user2.id) as GuildMember | undefined;

    const name1 = member1?.displayName || user1.displayName;
    const name2 = member2?.displayName || user2.displayName;
    const shipName = generateShipName(name1, name2);
    const { emoji, description } = getShipDescription(percent);

    // Create progress bar
    const filled = Math.floor(percent / 10);
    const empty = 10 - filled;
    const progressBar = '█'.repeat(filled) + '░'.repeat(empty);

    const embed = new EmbedBuilder()
        .setTitle(`${emoji} Love Calculator ${emoji}`)
        .setDescription(`**${name1}** ❤️ **${name2}**`)
        .setColor(percent >= 50 ? config.colors.primary : config.colors.error)
        .addFields(
            { name: '💕 Ship Name', value: `**${shipName}**`, inline: false },
            { name: '📊 Compatibilité', value: `${progressBar} **${percent}%**`, inline: false },
            { name: '💭 Verdict', value: description, inline: false }
        )
        .setFooter({ text: 'Tsukihane • L\'amour version anime' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
