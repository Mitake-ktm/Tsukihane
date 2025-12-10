import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } from 'discord.js';
import { config } from '../../config/config';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Afficher l\'aide du bot');

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const categories = [
        {
            name: '🏠 Général',
            value: 'general',
            commands: [
                { name: '/help', description: 'Afficher l\'aide du bot' },
                { name: '/ping', description: 'Vérifier la latence du bot' },
                { name: '/avatar', description: 'Afficher l\'avatar d\'un utilisateur' },
                { name: '/userinfo', description: 'Informations sur un utilisateur' },
                { name: '/serverinfo', description: 'Informations sur le serveur' },
                { name: '/serverstats', description: 'Statistiques du serveur' },
                { name: '/invite', description: 'Obtenir le lien d\'invitation' },
                { name: '/poll', description: 'Créer un sondage' },
                { name: '/suggest', description: 'Faire une suggestion' },
                { name: '/giveaway', description: 'Gérer les giveaways' },
            ],
        },
        {
            name: '🛡️ Modération',
            value: 'moderation',
            commands: [
                { name: '/ban', description: 'Bannir un utilisateur' },
                { name: '/kick', description: 'Expulser un utilisateur' },
                { name: '/mute', description: 'Rendre muet un utilisateur' },
                { name: '/unmute', description: 'Retirer le mute' },
                { name: '/warn', description: 'Avertir un utilisateur' },
                { name: '/warnings', description: 'Voir les avertissements' },
                { name: '/clear', description: 'Supprimer des messages' },
                { name: '/filter', description: 'Gérer les mots interdits' },
            ],
        },
        {
            name: '📊 Niveaux',
            value: 'leveling',
            commands: [
                { name: '/level', description: 'Voir ton niveau' },
                { name: '/leaderboard', description: 'Classement du serveur' },
                { name: '/profile', description: 'Profil d\'un utilisateur' },
            ],
        },
        {
            name: '🎮 Fun',
            value: 'fun',
            commands: [
                { name: '/roll', description: 'Lancer un dé' },
                { name: '/8ball', description: 'Boule magique' },
                { name: '/fortune', description: 'Fortune du jour' },
                { name: '/quiz', description: 'Quiz interactif' },
                { name: '/quote', description: 'Citation aléatoire d\'anime' },
                { name: '/ship', description: 'Calculer la compatibilité amoureuse' },
                { name: '/chapter', description: 'Générer un titre de chapitre' },
                { name: '/plottwist', description: 'Générer un plot twist' },
                { name: '/protagonist', description: 'Générer un protagoniste' },
                { name: '/powerlevel', description: 'Calculer ta puissance' },
                { name: '/cultivation', description: 'Système de cultivation' },
            ],
        },
        {
            name: '📢 Notifications',
            value: 'notifications',
            commands: [
                { name: '/notify', description: 'Envoyer une notification' },
                { name: '/post', description: 'Poster du contenu' },
                { name: '/reminder', description: 'Gérer les rappels' },
            ],
        },
        {
            name: '⚙️ Gestion',
            value: 'admin',
            commands: [
                { name: '/channel', description: 'Gérer les canaux' },
                { name: '/role', description: 'Gérer les rôles' },
            ],
        },
    ];

    const mainEmbed = new EmbedBuilder()
        .setTitle('📚 Aide - Tsukihane Bot')
        .setDescription('Sélectionne une catégorie dans le menu ci-dessous pour voir les commandes disponibles.')
        .setColor(config.colors.primary)
        .addFields(
            categories.map(cat => ({
                name: cat.name,
                value: `${cat.commands.length} commandes`,
                inline: true,
            }))
        )
        .setFooter({ text: 'Utilise le menu pour explorer les catégories' })
        .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('help_category')
        .setPlaceholder('Choisir une catégorie...')
        .addOptions(
            categories.map(cat => ({
                label: cat.name.replace(/^[^\s]+\s/, ''),
                value: cat.value,
                emoji: cat.name.split(' ')[0],
            }))
        );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);

    const response = await interaction.reply({
        embeds: [mainEmbed],
        components: [row],
        fetchReply: true,
    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        time: 120000,
    });

    collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ content: 'Ce menu ne t\'est pas destiné.', ephemeral: true });
            return;
        }

        const category = categories.find(c => c.value === i.values[0]);
        if (!category) return;

        const categoryEmbed = new EmbedBuilder()
            .setTitle(`${category.name}`)
            .setDescription(
                category.commands.map(cmd => `**${cmd.name}**\n└ ${cmd.description}`).join('\n\n')
            )
            .setColor(config.colors.primary)
            .setTimestamp();

        await i.update({ embeds: [categoryEmbed] });
    });

    collector.on('end', () => {
        const disabledRow = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            selectMenu.setDisabled(true)
        );
        response.edit({ components: [disabledRow] }).catch(() => { });
    });
}
