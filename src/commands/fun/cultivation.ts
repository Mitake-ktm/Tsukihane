import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from 'discord.js';
import { config } from '../../config/config';
import { getUser } from '../../services/xpService';

// Cultivation realms (inspired by Chinese web novels)
const realms = [
    { level: 1, name: 'Mortel', emoji: '👶', qi: 0 },
    { level: 2, name: 'Éveil du Qi', emoji: '💨', qi: 100 },
    { level: 3, name: 'Condensation du Qi', emoji: '🌀', qi: 500 },
    { level: 4, name: 'Fondation', emoji: '🏛️', qi: 1500 },
    { level: 5, name: 'Formation du Noyau', emoji: '💎', qi: 5000 },
    { level: 6, name: 'Nascent Soul', emoji: '👻', qi: 15000 },
    { level: 7, name: 'Soul Transformation', emoji: '⚡', qi: 50000 },
    { level: 8, name: 'Void Tribulation', emoji: '🌌', qi: 150000 },
    { level: 9, name: 'Mahayana', emoji: '☯️', qi: 500000 },
    { level: 10, name: 'True Immortal', emoji: '🌟', qi: 1000000 },
];

const techniques = [
    '🔥 Flamme du Phoenix Ancestral',
    '❄️ Souffle du Dragon de Glace',
    '⚡ Foudre des Neuf Cieux',
    '🌙 Pas de l\'Ombre Lunaire',
    '☀️ Poing du Soleil Écarlate',
    '💀 Art Démoniaque du Sang',
    '🌸 Épée des Mille Pétales',
    '🌊 Vague du Chaos Primordial',
    '🗡️ Lame du Vide Absolu',
    '👁️ Œil du Destin',
];

function getCurrentRealm(qi: number): typeof realms[0] {
    for (let i = realms.length - 1; i >= 0; i--) {
        if (qi >= realms[i].qi) {
            return realms[i];
        }
    }
    return realms[0];
}

function getNextRealm(qi: number): typeof realms[0] | null {
    const current = getCurrentRealm(qi);
    const nextIndex = realms.findIndex(r => r.level === current.level) + 1;
    return realms[nextIndex] || null;
}

export const data = new SlashCommandBuilder()
    .setName('cultivation')
    .setDescription('Système de cultivation / Cultivation system')
    .addSubcommand(sub =>
        sub
            .setName('status')
            .setDescription('Voir ton statut de cultivation')
    )
    .addSubcommand(sub =>
        sub
            .setName('meditate')
            .setDescription('Méditer pour gagner du Qi')
    )
    .addSubcommand(sub =>
        sub
            .setName('breakthrough')
            .setDescription('Tenter une percée vers le royaume suivant')
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    // Get or initialize cultivation data (using XP as Qi for simplicity)
    let userData;
    try {
        userData = await getUser(interaction.user.id, interaction.guild!.id);
    } catch {
        userData = { level: 1, xp: 0 };
    }

    const qi = userData?.xp || 0;
    const currentRealm = getCurrentRealm(qi);
    const nextRealm = getNextRealm(qi);

    switch (subcommand) {
        case 'status':
            await showStatus(interaction, qi, currentRealm, nextRealm);
            break;
        case 'meditate':
            await meditate(interaction, qi, currentRealm);
            break;
        case 'breakthrough':
            await breakthrough(interaction, qi, currentRealm, nextRealm);
            break;
    }
}

async function showStatus(
    interaction: ChatInputCommandInteraction,
    qi: number,
    currentRealm: typeof realms[0],
    nextRealm: typeof realms[0] | null
): Promise<void> {
    const randomTechnique = techniques[Math.floor(Math.random() * techniques.length)];

    // Progress to next realm
    let progress = '100%';
    let progressBar = '██████████';

    if (nextRealm) {
        const progressPercent = ((qi - currentRealm.qi) / (nextRealm.qi - currentRealm.qi)) * 100;
        progress = `${Math.floor(progressPercent)}%`;
        const filled = Math.floor(progressPercent / 10);
        progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);
    }

    const embed = new EmbedBuilder()
        .setTitle(`${currentRealm.emoji} Profil de Cultivation`)
        .setDescription(`**${interaction.user.displayName}** — Cultivateur`)
        .setThumbnail(interaction.user.displayAvatarURL({ size: 256 }))
        .setColor(config.colors.primary)
        .addFields(
            { name: '☯️ Royaume Actuel', value: currentRealm.name, inline: true },
            { name: '💨 Qi Total', value: qi.toLocaleString(), inline: true },
            { name: '📊 Niveau', value: `${currentRealm.level}/10`, inline: true },
            {
                name: '⏫ Progression',
                value: nextRealm
                    ? `\`${progressBar}\` ${progress}\n→ ${nextRealm.emoji} ${nextRealm.name}`
                    : '✨ Royaume Maximum Atteint !',
                inline: false
            },
            { name: '⚔️ Technique Maîtrisée', value: randomTechnique, inline: false }
        )
        .setFooter({ text: 'Tsukihane • Cultivation System' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function meditate(
    interaction: ChatInputCommandInteraction,
    qi: number,
    currentRealm: typeof realms[0]
): Promise<void> {
    // Meditation gives a small Qi boost (this is just for display, actual XP is from messages)
    const qiGained = Math.floor(Math.random() * 50) + 10;

    const meditationResults = [
        `Tu as médité sous la lumière de la lune...`,
        `Tu as absorbé l'énergie spirituelle environnante...`,
        `Tu as contemplé le dao du ciel et de la terre...`,
        `L'énergie céleste a traversé tes méridiens...`,
        `Tu as atteint un état de tranquillité profonde...`,
    ];

    const result = meditationResults[Math.floor(Math.random() * meditationResults.length)];

    const embed = new EmbedBuilder()
        .setTitle('🧘 Méditation')
        .setDescription(`*${result}*`)
        .setColor(config.colors.success)
        .addFields(
            { name: '💨 Qi Ressenti', value: `+${qiGained} (affiché)`, inline: true },
            { name: '📝 Note', value: 'Le vrai Qi s\'accumule via l\'activité sur le serveur !', inline: false }
        )
        .setFooter({ text: 'Continue d\'être actif pour progresser' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}

async function breakthrough(
    interaction: ChatInputCommandInteraction,
    qi: number,
    currentRealm: typeof realms[0],
    nextRealm: typeof realms[0] | null
): Promise<void> {
    if (!nextRealm) {
        const embed = new EmbedBuilder()
            .setTitle('☯️ Sommet Atteint')
            .setDescription('Tu as déjà atteint le royaume le plus élevé !\n*Tu transcendes le concept même de cultivation...*')
            .setColor(config.colors.primary)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
    }

    if (qi < nextRealm.qi) {
        const needed = nextRealm.qi - qi;
        const embed = new EmbedBuilder()
            .setTitle('⚠️ Percée Impossible')
            .setDescription(`Tu n'as pas assez de Qi pour tenter la percée vers **${nextRealm.name}**.`)
            .setColor(config.colors.warning)
            .addFields(
                { name: '💨 Qi Actuel', value: qi.toLocaleString(), inline: true },
                { name: '💨 Qi Requis', value: nextRealm.qi.toLocaleString(), inline: true },
                { name: '📉 Manquant', value: needed.toLocaleString(), inline: true }
            )
            .setFooter({ text: 'Continue de cultiver !' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
        return;
    }

    // Breakthrough attempt
    const success = Math.random() < 0.7; // 70% success rate

    if (success) {
        const embed = new EmbedBuilder()
            .setTitle(`${nextRealm.emoji} PERCÉE RÉUSSIE !`)
            .setDescription(`*Le ciel gronde, la terre tremble...*\n\n**${interaction.user.displayName}** a atteint le royaume **${nextRealm.name}** !`)
            .setColor(config.colors.success)
            .addFields(
                { name: '⬆️ Nouveau Royaume', value: nextRealm.name, inline: true },
                { name: '📊 Niveau', value: `${nextRealm.level}/10`, inline: true }
            )
            .setFooter({ text: 'Les Cieux reconnaissent ta puissance !' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } else {
        const embed = new EmbedBuilder()
            .setTitle('💥 PERCÉE ÉCHOUÉE')
            .setDescription(`*Tu as échoué à percer vers **${nextRealm.name}**...*\n\nLes tribulations célestes étaient trop puissantes cette fois.`)
            .setColor(config.colors.error)
            .addFields(
                { name: '💡 Conseil', value: 'Accumule plus de Qi et réessaie !', inline: false }
            )
            .setFooter({ text: 'Le dao de la cultivation est long et difficile...' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
}
