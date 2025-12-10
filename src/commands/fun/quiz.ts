import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
} from 'discord.js';
import { config } from '../../config/config';

interface QuizQuestion {
    question: string;
    answers: string[];
    correct: number;
    category: string;
}

const questions: QuizQuestion[] = [
    {
        question: "Quelle est la capitale du Japon ?",
        answers: ["Kyoto", "Tokyo", "Osaka", "Nagoya"],
        correct: 1,
        category: "Géographie"
    },
    {
        question: "Combien de planètes y a-t-il dans notre système solaire ?",
        answers: ["7", "8", "9", "10"],
        correct: 1,
        category: "Science"
    },
    {
        question: "Qui a écrit 'Les Misérables' ?",
        answers: ["Émile Zola", "Gustave Flaubert", "Victor Hugo", "Alexandre Dumas"],
        correct: 2,
        category: "Littérature"
    },
    {
        question: "En quelle année la Révolution française a-t-elle commencé ?",
        answers: ["1789", "1799", "1776", "1812"],
        correct: 0,
        category: "Histoire"
    },
    {
        question: "Quel est le plus grand océan du monde ?",
        answers: ["Atlantique", "Indien", "Arctique", "Pacifique"],
        correct: 3,
        category: "Géographie"
    },
    {
        question: "Combien de côtés a un hexagone ?",
        answers: ["5", "6", "7", "8"],
        correct: 1,
        category: "Mathématiques"
    },
    {
        question: "Quel est l'élément chimique représenté par 'Au' ?",
        answers: ["Argent", "Aluminium", "Or", "Cuivre"],
        correct: 2,
        category: "Science"
    },
    {
        question: "Dans quel pays se trouve la tour de Pise ?",
        answers: ["France", "Espagne", "Italie", "Grèce"],
        correct: 2,
        category: "Géographie"
    },
    {
        question: "Qui a peint la Joconde ?",
        answers: ["Michel-Ange", "Raphaël", "Léonard de Vinci", "Botticelli"],
        correct: 2,
        category: "Art"
    },
    {
        question: "Quel est le plus long fleuve du monde ?",
        answers: ["Le Nil", "L'Amazone", "Le Yangtsé", "Le Mississippi"],
        correct: 0,
        category: "Géographie"
    },
];

export const data = new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('Participe à un quiz !');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = questions[Math.floor(Math.random() * questions.length)];

    const buttons = question.answers.map((answer, index) =>
        new ButtonBuilder()
            .setCustomId(`quiz_${index}`)
            .setLabel(answer)
            .setStyle(ButtonStyle.Primary)
    );

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

    const embed = new EmbedBuilder()
        .setTitle(`📝 Quiz - ${question.category}`)
        .setDescription(question.question)
        .setColor(config.colors.primary)
        .setFooter({ text: 'Tu as 30 secondes pour répondre !' })
        .setTimestamp();

    const response = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true,
    });

    try {
        const buttonInteraction = await response.awaitMessageComponent({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === interaction.user.id,
            time: 30000,
        });

        const selectedIndex = parseInt(buttonInteraction.customId.split('_')[1]);
        const isCorrect = selectedIndex === question.correct;

        const resultEmbed = new EmbedBuilder()
            .setTitle(isCorrect ? '✅ Bonne Réponse !' : '❌ Mauvaise Réponse')
            .setDescription(
                isCorrect
                    ? `Bravo ! La réponse était bien **${question.answers[question.correct]}** !`
                    : `Dommage ! La bonne réponse était **${question.answers[question.correct]}**.`
            )
            .setColor(isCorrect ? config.colors.success : config.colors.error)
            .setTimestamp();

        // Disable all buttons
        const disabledButtons = question.answers.map((answer, index) =>
            new ButtonBuilder()
                .setCustomId(`quiz_${index}`)
                .setLabel(answer)
                .setStyle(index === question.correct ? ButtonStyle.Success : (index === selectedIndex && !isCorrect ? ButtonStyle.Danger : ButtonStyle.Secondary))
                .setDisabled(true)
        );

        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButtons);

        await buttonInteraction.update({
            embeds: [resultEmbed],
            components: [disabledRow],
        });
    } catch {
        // Timeout
        const timeoutEmbed = new EmbedBuilder()
            .setTitle('⏰ Temps Écoulé !')
            .setDescription(`La bonne réponse était **${question.answers[question.correct]}**.`)
            .setColor(config.colors.warning)
            .setTimestamp();

        const disabledButtons = question.answers.map((answer, index) =>
            new ButtonBuilder()
                .setCustomId(`quiz_${index}`)
                .setLabel(answer)
                .setStyle(index === question.correct ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setDisabled(true)
        );

        const disabledRow = new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButtons);

        await interaction.editReply({
            embeds: [timeoutEmbed],
            components: [disabledRow],
        });
    }
}
