import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} from 'discord.js';
import { config } from '../../config/config';

// Store active giveaways (in production, use database)
const activeGiveaways = new Map<string, {
    prize: string;
    endTime: number;
    hostId: string;
    participants: Set<string>;
    channelId: string;
    messageId: string;
}>();

export const data = new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Gérer les giveaways / Manage giveaways')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand =>
        subcommand
            .setName('start')
            .setDescription('Démarrer un giveaway')
            .addStringOption(option =>
                option
                    .setName('prix')
                    .setDescription('Le prix à gagner')
                    .setRequired(true)
            )
            .addIntegerOption(option =>
                option
                    .setName('duree')
                    .setDescription('Durée en minutes')
                    .setRequired(true)
                    .setMinValue(1)
                    .setMaxValue(10080) // Max 1 week
            )
            .addIntegerOption(option =>
                option
                    .setName('gagnants')
                    .setDescription('Nombre de gagnants')
                    .setRequired(false)
                    .setMinValue(1)
                    .setMaxValue(10)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('end')
            .setDescription('Terminer un giveaway plus tôt')
            .addStringOption(option =>
                option
                    .setName('message_id')
                    .setDescription('ID du message du giveaway')
                    .setRequired(true)
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('reroll')
            .setDescription('Re-tirer un gagnant')
            .addStringOption(option =>
                option
                    .setName('message_id')
                    .setDescription('ID du message du giveaway')
                    .setRequired(true)
            )
    );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
        case 'start':
            await startGiveaway(interaction);
            break;
        case 'end':
            await endGiveaway(interaction);
            break;
        case 'reroll':
            await rerollGiveaway(interaction);
            break;
    }
}

async function startGiveaway(interaction: ChatInputCommandInteraction): Promise<void> {
    const prize = interaction.options.getString('prix', true);
    const duration = interaction.options.getInteger('duree', true);
    const winners = interaction.options.getInteger('gagnants') || 1;

    const endTime = Date.now() + duration * 60 * 1000;
    const endTimestamp = Math.floor(endTime / 1000);

    const embed = new EmbedBuilder()
        .setTitle(`${config.giveaway.emoji} GIVEAWAY ${config.giveaway.emoji}`)
        .setDescription(`**${prize}**\n\nClique sur le bouton ci-dessous pour participer !\n\n⏰ Fin: <t:${endTimestamp}:R>\n👥 Gagnants: **${winners}**\n🎫 Participants: **0**`)
        .setColor(config.giveaway.embedColor)
        .setFooter({ text: `Organisé par ${interaction.user.displayName}` })
        .setTimestamp(new Date(endTime));

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId('giveaway_enter')
            .setLabel('Participer')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎉')
    );

    const message = await (interaction.channel as TextChannel).send({
        embeds: [embed],
        components: [row]
    });

    // Store giveaway data
    activeGiveaways.set(message.id, {
        prize,
        endTime,
        hostId: interaction.user.id,
        participants: new Set(),
        channelId: interaction.channelId,
        messageId: message.id
    });

    await interaction.reply({
        content: `✅ Giveaway créé ! Il se terminera <t:${endTimestamp}:R>`,
        ephemeral: true
    });

    // Set up button collector
    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: duration * 60 * 1000
    });

    collector.on('collect', async (i) => {
        const giveaway = activeGiveaways.get(message.id);
        if (!giveaway) return;

        if (giveaway.participants.has(i.user.id)) {
            await i.reply({ content: '⚠️ Tu participes déjà à ce giveaway !', ephemeral: true });
            return;
        }

        giveaway.participants.add(i.user.id);

        // Update embed with new participant count
        const updatedEmbed = EmbedBuilder.from(message.embeds[0])
            .setDescription(`**${prize}**\n\nClique sur le bouton ci-dessous pour participer !\n\n⏰ Fin: <t:${endTimestamp}:R>\n👥 Gagnants: **${winners}**\n🎫 Participants: **${giveaway.participants.size}**`);

        await message.edit({ embeds: [updatedEmbed] });
        await i.reply({ content: '🎉 Tu participes au giveaway ! Bonne chance~', ephemeral: true });
    });

    collector.on('end', async () => {
        const giveaway = activeGiveaways.get(message.id);
        if (!giveaway) return;

        await finishGiveaway(message.id, winners, interaction.channel as TextChannel);
    });
}

async function finishGiveaway(messageId: string, winnerCount: number, channel: TextChannel): Promise<void> {
    const giveaway = activeGiveaways.get(messageId);
    if (!giveaway) return;

    const participants = Array.from(giveaway.participants);

    if (participants.length === 0) {
        const message = await channel.messages.fetch(messageId);
        const endedEmbed = EmbedBuilder.from(message.embeds[0])
            .setTitle('🎉 GIVEAWAY TERMINÉ')
            .setDescription(`**${giveaway.prize}**\n\n😔 Aucun participant...`)
            .setColor(config.colors.error);

        await message.edit({ embeds: [endedEmbed], components: [] });
        activeGiveaways.delete(messageId);
        return;
    }

    // Pick random winners
    const winners: string[] = [];
    const shuffled = participants.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(winnerCount, shuffled.length); i++) {
        winners.push(shuffled[i]);
    }

    const winnerMentions = winners.map(id => `<@${id}>`).join(', ');

    const message = await channel.messages.fetch(messageId);
    const endedEmbed = EmbedBuilder.from(message.embeds[0])
        .setTitle('🎉 GIVEAWAY TERMINÉ')
        .setDescription(`**${giveaway.prize}**\n\n🏆 Gagnant(s): ${winnerMentions}`)
        .setColor(config.colors.success);

    await message.edit({ embeds: [endedEmbed], components: [] });
    await channel.send(`🎊 Félicitations ${winnerMentions} ! Vous avez gagné **${giveaway.prize}** !`);

    activeGiveaways.delete(messageId);
}

async function endGiveaway(interaction: ChatInputCommandInteraction): Promise<void> {
    const messageId = interaction.options.getString('message_id', true);
    const giveaway = activeGiveaways.get(messageId);

    if (!giveaway) {
        await interaction.reply({ content: '❌ Giveaway non trouvé ou déjà terminé.', ephemeral: true });
        return;
    }

    await finishGiveaway(messageId, 1, interaction.channel as TextChannel);
    await interaction.reply({ content: '✅ Giveaway terminé !', ephemeral: true });
}

async function rerollGiveaway(interaction: ChatInputCommandInteraction): Promise<void> {
    const messageId = interaction.options.getString('message_id', true);

    try {
        const message = await (interaction.channel as TextChannel).messages.fetch(messageId);

        // This is a simplified reroll - in production, store participants in database
        await interaction.reply({
            content: '🎲 Pour re-tirer, utilisez `/giveaway start` avec le même prix.',
            ephemeral: true
        });
    } catch {
        await interaction.reply({ content: '❌ Message non trouvé.', ephemeral: true });
    }
}
