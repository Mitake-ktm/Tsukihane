import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Créer un sondage / Create a poll')
    .addStringOption(option =>
        option
            .setName('question')
            .setDescription('La question du sondage')
            .setRequired(true)
            .setMaxLength(256)
    )
    .addStringOption(option =>
        option
            .setName('option1')
            .setDescription('Option 1')
            .setRequired(true)
            .setMaxLength(100)
    )
    .addStringOption(option =>
        option
            .setName('option2')
            .setDescription('Option 2')
            .setRequired(true)
            .setMaxLength(100)
    )
    .addStringOption(option =>
        option
            .setName('option3')
            .setDescription('Option 3')
            .setRequired(false)
            .setMaxLength(100)
    )
    .addStringOption(option =>
        option
            .setName('option4')
            .setDescription('Option 4')
            .setRequired(false)
            .setMaxLength(100)
    )
    .addStringOption(option =>
        option
            .setName('option5')
            .setDescription('Option 5')
            .setRequired(false)
            .setMaxLength(100)
    );

const numberEmojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const question = interaction.options.getString('question', true);

    // Collect all options
    const options: string[] = [];
    for (let i = 1; i <= 5; i++) {
        const option = interaction.options.getString(`option${i}`);
        if (option) options.push(option);
    }

    // Build options display
    const optionsDisplay = options
        .map((opt, index) => `${numberEmojis[index]} ${opt}`)
        .join('\n\n');

    const embed = new EmbedBuilder()
        .setTitle(`📊 ${question}`)
        .setDescription(optionsDisplay)
        .setColor(config.colors.primary)
        .setAuthor({
            name: `Sondage de ${interaction.user.displayName}`,
            iconURL: interaction.user.displayAvatarURL()
        })
        .setFooter({ text: 'Réagis pour voter !' })
        .setTimestamp();

    const message = await interaction.reply({ embeds: [embed], fetchReply: true });

    // Add reaction options
    for (let i = 0; i < options.length; i++) {
        await message.react(numberEmojis[i]);
    }
}
