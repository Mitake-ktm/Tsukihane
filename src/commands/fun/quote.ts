import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

// Web novel / anime quotes
const quotes = [
    { quote: "Dans ce monde, il n'y a pas de certitudes, seulement des opportunités.", author: "Akai Sekai", source: "赤い世界" },
    { quote: "Même dans les ténèbres les plus profondes, une lueur peut encore briller.", author: "Mike", source: "Akai Sekai" },
    { quote: "Je ne reculerai pas. Pas maintenant, pas jamais.", author: "Protagoniste Classique", source: "Tout Shonen" },
    { quote: "Le plus faible peut devenir le plus fort s'il refuse d'abandonner.", author: "Sagesse Isekai", source: "Cultivation Novel" },
    { quote: "Chaque étage cache un nouveau défi... et une nouvelle vérité.", author: "Narrateur", source: "Akai Sekai" },
    { quote: "On ne choisit pas son destin, mais on choisit comment l'affronter.", author: "Sagesse Ancienne", source: "Web Novel" },
    { quote: "Les monstres ne sont pas toujours ceux qu'on croit.", author: "Plot Twist", source: "Thriller Novel" },
    { quote: "La vraie force, c'est de protéger ceux qu'on aime.", author: "Héros Shonen", source: "Classique" },
    { quote: "Dans cet immeuble, même les murs ont des oreilles... et des yeux.", author: "Mike", source: "Akai Sekai" },
    { quote: "Le pouvoir corrompt, mais la solitude détruit.", author: "Antagoniste", source: "Dark Fantasy" },
    { quote: "Ce n'est pas la fin. Ce n'est jamais la fin.", author: "Survivant", source: "Post-Apo" },
    { quote: "J'ai traversé mille mondes pour te retrouver.", author: "Isekai Protag", source: "Romance Isekai" },
];

export const data = new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Obtenir une citation de web novel / Get a web novel quote');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

    const embed = new EmbedBuilder()
        .setTitle('📖 Citation du Jour')
        .setDescription(`*"${randomQuote.quote}"*`)
        .setColor(config.colors.primary)
        .addFields(
            { name: '✍️ Auteur', value: randomQuote.author, inline: true },
            { name: '📚 Source', value: randomQuote.source, inline: true }
        )
        .setFooter({ text: 'Tsukihane • Akai Sekai' })
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
}
