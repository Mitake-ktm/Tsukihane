import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

const chapterTitles = [
    'L\'Éveil Inattendu',
    'Descente dans les Ténèbres',
    'Le Gardien du 13ème Étage',
    'Révélations Sanglantes',
    'La Porte Interdite',
    'Souvenirs Fragmentés',
    'L\'Ombre qui Observe',
    'Trahison au Crépuscule',
    'Le Prix de la Survie',
    'Échos du Passé',
    'La Chute du Héros',
    'Renaissance',
    'Les Murs qui Murmurent',
    'Confrontation Finale',
    'Le Dernier Étage',
];

const teasers = [
    'Tout ce qu\'il croyait savoir... était un mensonge.',
    'Une nouvelle menace émerge des ombres.',
    'Les alliés d\'hier deviennent les ennemis d\'aujourd\'hui.',
    'Un secret longtemps enfoui refait surface.',
    'La vérité est plus terrifiante que le mensonge.',
    'Il n\'y a pas de retour en arrière possible.',
    'Quelqu\'un devra faire le sacrifice ultime.',
    'Les règles du jeu viennent de changer.',
    'Ce n\'était que le début du cauchemar.',
    'L\'immeuble révèle enfin son vrai visage.',
];

const reactions = [
    '😱 Les lecteurs ne sont pas prêts !',
    '🔥 L\'auteur est en feu !',
    '💀 RIP nos théories...',
    '🤯 PLOT TWIST INCOMING',
    '😭 Pourquoi l\'auteur nous fait ça ?!',
    '⚔️ L\'arc final commence !',
    '🎭 On ne voyait pas ça venir !',
];

export const data = new SlashCommandBuilder()
    .setName('chapter')
    .setDescription('Annonce un nouveau chapitre fictif / Announce a fictional new chapter')
    .addStringOption(option =>
        option
            .setName('titre')
            .setDescription('Titre personnalisé du chapitre')
            .setRequired(false)
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const customTitle = interaction.options.getString('titre');
    const chapterNumber = Math.floor(Math.random() * 200) + 1;
    const title = customTitle || chapterTitles[Math.floor(Math.random() * chapterTitles.length)];
    const teaser = teasers[Math.floor(Math.random() * teasers.length)];
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];

    const embed = new EmbedBuilder()
        .setTitle(`📜 NOUVEAU CHAPITRE DISPONIBLE !`)
        .setDescription(`# Akai Sekai : Mike\n## Chapitre ${chapterNumber} : ${title}`)
        .setColor(config.colors.primary)
        .addFields(
            { name: '📖 Teaser', value: `*"${teaser}"*`, inline: false },
            { name: '💬 Réaction', value: reaction, inline: false }
        )
        .setImage('https://i.imgur.com/placeholder.png') // Could add actual banner
        .setFooter({ text: '⚠️ Ceci est une fausse annonce de chapitre !' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
