import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

const plotTwists = [
    { twist: "Le meilleur ami était l'antagoniste depuis le début !", emoji: "🎭" },
    { twist: "C'était un rêve... OU PAS ?!", emoji: "💭" },
    { twist: "Le protagoniste EST le boss final qu'il cherchait !", emoji: "👁️" },
    { twist: "L'immeuble... c'est lui. Mike EST l'immeuble.", emoji: "🏢" },
    { twist: "Le personnage mort au chapitre 1 revient... en tant qu'ennemi.", emoji: "💀" },
    { twist: "La prophétie parlait de quelqu'un d'autre depuis le début.", emoji: "📜" },
    { twist: "Le monde entier n'est qu'un jeu vidéo.", emoji: "🎮" },
    { twist: "Les gentils travaillaient pour les méchants sans le savoir.", emoji: "🤯" },
    { twist: "Le vrai trésor... c'était l'amitié. Non vraiment, littéralement.", emoji: "💎" },
    { twist: "Tout ça pour découvrir qu'ils sont dans une boucle temporelle.", emoji: "⏰" },
    { twist: "Le mentor adorable ? C'était le méchant, évidemment.", emoji: "👴" },
    { twist: "Il n'y a jamais eu de malédiction. C'était psychosomatique.", emoji: "🧠" },
    { twist: "Les monstres étaient les vrais humains depuis le début.", emoji: "👹" },
    { twist: "Le héros est mort il y a 100 ans. C'est son fantôme.", emoji: "👻" },
    { twist: "Tout le village natal ? Des acteurs payés.", emoji: "🎬" },
    { twist: "L'épée légendaire ? Juste une épée normale avec du marketing.", emoji: "⚔️" },
    { twist: "Le chat du protagoniste contrôlait tout depuis le début.", emoji: "🐱" },
    { twist: "C'était en fait une histoire d'amour depuis le début.", emoji: "💕" },
];

export const data = new SlashCommandBuilder()
    .setName('plot-twist')
    .setDescription('Génère un plot twist dramatique / Generate a dramatic plot twist');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const randomTwist = plotTwists[Math.floor(Math.random() * plotTwists.length)];

    const embed = new EmbedBuilder()
        .setTitle(`${randomTwist.emoji} PLOT TWIST !`)
        .setDescription(`*La tension monte...*\n\n## ${randomTwist.twist}`)
        .setColor(config.colors.error) // Red for dramatic effect
        .setFooter({ text: '- M. Night Shyamalan, probablement' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
