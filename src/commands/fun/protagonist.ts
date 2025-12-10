import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

// Random data for generating protagonist profiles
const names = ['Kaito', 'Yuki', 'Haruki', 'Ren', 'Akira', 'Hiro', 'Sora', 'Takeshi', 'Shin', 'Ryu'];
const surnames = ['Kurogane', 'Aozora', 'Yamamoto', 'Suzuki', 'Tanaka', 'Nakamura', 'Watanabe', 'Shirogane'];
const origins = [
    '🏠 Un lycéen ordinaire mort en protégeant quelqu\'un',
    '💼 Un employé de bureau victime de karoshi',
    '🎮 Un otaku frappé par un camion',
    '⚡ Touché par la foudre en pleine rue',
    '🌊 Noyé en essayant de sauver un enfant',
    '🚗 Accident de voiture tragique',
    '💀 Mort de solitude... littéralement',
    '🎯 Assassiné par erreur par un dieu',
];
const cheats = [
    '♾️ Croissance illimitée',
    '🔮 Analyse parfaite',
    '⚔️ Maîtrise instantanée des armes',
    '🛡️ Invincibilité passive',
    '💫 Charisme divin',
    '🎭 Camouflage parfait',
    '⏰ Manipulation du temps',
    '📖 Système de quêtes',
    '🔥 Affinité élémentaire max',
    '👁️ Œil mystique',
];
const personalities = [
    '😊 Naïf mais déterminé',
    '😎 Cool et calculateur',
    '🤪 Chaotique mais attachant',
    '😤 Trop confiant pour son bien',
    '🤔 Stratège silencieux',
    '💪 Force brute sans cervelle',
    '🎭 Mystérieux et imprévisible',
    '😇 Trop gentil pour ce monde',
];
const destins = [
    '👑 Destiné à devenir le Roi Démon',
    '⚔️ Le Héros Légendaire réincarné',
    '🌟 L\'Élu de la Prophétie',
    '🔮 Le futur Archimage Suprême',
    '🗡️ Le plus grand épéiste de l\'histoire',
    '🏆 Le vainqueur du Tournoi des Dieux',
    '💎 Le chasseur le plus riche du monde',
    '🌌 Celui qui unifiera tous les royaumes',
];

export const data = new SlashCommandBuilder()
    .setName('protagonist')
    .setDescription('Génère un profil de protagoniste isekai aléatoire / Generate random isekai protagonist')
    .addUserOption(option =>
        option
            .setName('utilisateur')
            .setDescription('Générer pour cet utilisateur')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('utilisateur') || interaction.user;

    // Use user ID as seed for somewhat consistent results
    const seed = parseInt(user.id.slice(-8), 10);
    const random = (arr: string[]) => arr[(seed + Math.floor(Math.random() * arr.length)) % arr.length];

    const name = `${random(names)} ${random(surnames)}`;
    const level = Math.floor(Math.random() * 99) + 1;
    const age = Math.floor(Math.random() * 10) + 16;

    const embed = new EmbedBuilder()
        .setTitle('📖 Profil de Protagoniste Isekai')
        .setDescription(`**${user.displayName}** dans un autre monde...`)
        .setThumbnail(user.displayAvatarURL({ size: 256 }))
        .setColor(config.colors.primary)
        .addFields(
            { name: '👤 Nouveau Nom', value: name, inline: true },
            { name: '📊 Niveau', value: `${level}`, inline: true },
            { name: '🎂 Âge', value: `${age} ans`, inline: true },
            { name: '💀 Origine', value: random(origins), inline: false },
            { name: '✨ Pouvoir Cheat', value: random(cheats), inline: true },
            { name: '🎭 Personnalité', value: random(personalities), inline: true },
            { name: '🌟 Destin', value: random(destins), inline: false }
        )
        .setFooter({ text: 'Tsukihane • Akai Sekai' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
