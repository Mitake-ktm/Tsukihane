import { config, SupportedLanguage } from './config';

/**
 * Internationalization (i18n) module for Tsukihane
 * Anime-style messages in French and English
 */

type MessageCategory = 'system' | 'error' | 'moderation' | 'leveling' | 'fun' | 'commands';

interface Messages {
    system: {
        loading: string;
        success: string;
        cooldown: string;
    };
    error: {
        noPermission: string;
        userNotFound: string;
        channelNotFound: string;
        roleNotFound: string;
        generic: string;
        invalidInput: string;
        botMissingPerms: string;
        selfAction: string;
        higherRole: string;
    };
    moderation: {
        banned: string;
        unbanned: string;
        kicked: string;
        muted: string;
        unmuted: string;
        warned: string;
        cleared: string;
    };
    leveling: {
        levelUp: string;
        rankCard: string;
        leaderboard: string;
        newRole: string;
        xpGain: string;
    };
    fun: {
        fortune: string;
        roll: string;
        eightball: string[];
        ship: string;
        powerLevel: string;
        protagonist: string;
        plotTwist: string;
        chapter: string;
    };
    commands: {
        ping: string;
        help: string;
        invite: string;
        serverInfo: string;
        userInfo: string;
        avatar: string;
        suggest: string;
        suggestSent: string;
        poll: string;
        giveaway: string;
        giveawayEnded: string;
    };
}

const messages: Record<SupportedLanguage, Messages> = {
    fr: {
        system: {
            loading: '⏳ Chargement en cours...',
            success: '✅ C\'est fait !',
            cooldown: '⏰ Ara ara~ Attends encore {time} secondes avant de réutiliser cette commande !',
        },
        error: {
            noPermission: '💜 Ara ara~ Tu n\'as pas la permission pour ça !',
            userNotFound: '👀 Hein ? Je ne trouve pas cet utilisateur...',
            channelNotFound: '🚪 Ce salon semble avoir disparu dans l\'immeuble...',
            roleNotFound: '❓ Je ne trouve pas ce rôle... Bizarre.',
            generic: '😅 Oops ! Quelque chose s\'est mal passé... Gomen !',
            invalidInput: '❌ Hmm... Cette entrée ne semble pas valide.',
            botMissingPerms: '🔒 Je n\'ai pas les permissions nécessaires pour ça...',
            selfAction: '🤔 Tu ne peux pas faire ça sur toi-même !',
            higherRole: '⚠️ Tu ne peux pas faire ça sur quelqu\'un avec un rôle supérieur !',
        },
        moderation: {
            banned: '⚔️ **{user}** a été banni du royaume ! Raison : {reason}',
            unbanned: '🔓 **{user}** a été débanni. Bienvenue de retour~',
            kicked: '🚪 **{user}** a été expulsé... Sayonara !',
            muted: '🔇 **{user}** a été réduit au silence pour {duration}~',
            unmuted: '🔊 **{user}** peut à nouveau parler !',
            warned: '⚠️ **{user}**, fais attention ! C\'est ton avertissement n°{count}',
            cleared: '🧹 {count} messages ont été supprimés !',
        },
        leveling: {
            levelUp: '🎉 Sugoi ! **{user}** vient d\'atteindre le **niveau {level}** ! ✨',
            rankCard: '📊 Voici ton parcours dans l\'immeuble, {user}-san !',
            leaderboard: '🏆 Classement des survivants de l\'immeuble',
            newRole: '🎊 Tu as obtenu le rôle **{role}** ! {emoji}',
            xpGain: '+{xp} XP',
        },
        fun: {
            fortune: '🔮 Les étoiles murmurent ton destin...',
            roll: '🎲 Les dés du destin parlent !',
            eightball: [
                '🔴 Les murs disent... Oui.',
                '👁️ Je vois... C\'est possible.',
                '🚪 Une porte s\'ouvre vers cette réponse... Non.',
                '⚠️ Mieux vaut ne pas savoir...',
                '🏢 L\'immeuble hésite... Peut-être.',
                '✨ Absolument !',
                '🌙 Les étoiles sont alignées... Oui !',
                '😰 N\'y compte pas trop...',
            ],
            ship: '💕 **{user1}** × **{user2}** — Compatibilité : **{percent}%** {emoji}',
            powerLevel: '⚡ Le niveau de puissance de **{user}** est de... **{level}** !',
            protagonist: '📖 **Profil de Protagoniste Isekai**',
            plotTwist: '🎭 **PLOT TWIST !**',
            chapter: '📜 **Nouveau Chapitre !**',
        },
        commands: {
            ping: '🏓 Pong ! Latence : **{latency}ms** | API : **{api}ms**',
            help: '📚 Voici la liste des commandes disponibles !',
            invite: '🔗 Invite-moi sur ton serveur !',
            serverInfo: '🏰 Informations sur le serveur',
            userInfo: '👤 Informations sur {user}',
            avatar: '🖼️ Avatar de {user}',
            suggest: '💡 Soumets une suggestion à l\'équipe !',
            suggestSent: '✅ Ta suggestion a été envoyée ! Merci~',
            poll: '📊 Sondage : {question}',
            giveaway: '🎁 **GIVEAWAY !**',
            giveawayEnded: '🎊 Félicitations à **{winner}** qui a gagné **{prize}** !',
        },
    },
    en: {
        system: {
            loading: '⏳ Loading...',
            success: '✅ Done!',
            cooldown: '⏰ Ara ara~ Wait {time} more seconds before using this command again!',
        },
        error: {
            noPermission: '💜 Ara ara~ You don\'t have permission for that!',
            userNotFound: '👀 Huh? I can\'t find that user...',
            channelNotFound: '🚪 That channel seems to have disappeared in the building...',
            roleNotFound: '❓ I can\'t find that role... Weird.',
            generic: '😅 Oops! Something went wrong... Gomen!',
            invalidInput: '❌ Hmm... That input doesn\'t seem valid.',
            botMissingPerms: '🔒 I don\'t have the necessary permissions for that...',
            selfAction: '🤔 You can\'t do that to yourself!',
            higherRole: '⚠️ You can\'t do that to someone with a higher role!',
        },
        moderation: {
            banned: '⚔️ **{user}** has been banished from the realm! Reason: {reason}',
            unbanned: '🔓 **{user}** has been unbanned. Welcome back~',
            kicked: '🚪 **{user}** has been kicked out... Sayonara!',
            muted: '🔇 **{user}** has been silenced for {duration}~',
            unmuted: '🔊 **{user}** can speak again!',
            warned: '⚠️ **{user}**, be careful! This is warning #{count}',
            cleared: '🧹 {count} messages have been deleted!',
        },
        leveling: {
            levelUp: '🎉 Sugoi! **{user}** just reached **level {level}**! ✨',
            rankCard: '📊 Here\'s your journey through the building, {user}-san!',
            leaderboard: '🏆 Building Survivors Leaderboard',
            newRole: '🎊 You\'ve earned the **{role}** role! {emoji}',
            xpGain: '+{xp} XP',
        },
        fun: {
            fortune: '🔮 The stars whisper your fate...',
            roll: '🎲 The dice of destiny speak!',
            eightball: [
                '🔴 The walls say... Yes.',
                '👁️ I see... It\'s possible.',
                '🚪 A door opens to this answer... No.',
                '⚠️ Better not to know...',
                '🏢 The building hesitates... Maybe.',
                '✨ Absolutely!',
                '🌙 The stars are aligned... Yes!',
                '😰 Don\'t count on it...',
            ],
            ship: '💕 **{user1}** × **{user2}** — Compatibility: **{percent}%** {emoji}',
            powerLevel: '⚡ **{user}**\'s power level is... **{level}**!',
            protagonist: '📖 **Isekai Protagonist Profile**',
            plotTwist: '🎭 **PLOT TWIST!**',
            chapter: '📜 **New Chapter!**',
        },
        commands: {
            ping: '🏓 Pong! Latency: **{latency}ms** | API: **{api}ms**',
            help: '📚 Here\'s the list of available commands!',
            invite: '🔗 Invite me to your server!',
            serverInfo: '🏰 Server Information',
            userInfo: '👤 Information about {user}',
            avatar: '🖼️ Avatar of {user}',
            suggest: '💡 Submit a suggestion to the team!',
            suggestSent: '✅ Your suggestion has been sent! Thank you~',
            poll: '📊 Poll: {question}',
            giveaway: '🎁 **GIVEAWAY!**',
            giveawayEnded: '🎊 Congratulations to **{winner}** who won **{prize}**!',
        },
    },
};

/**
 * Get a message in the current language
 */
export function t(category: keyof Messages, key: string, replacements?: Record<string, string | number>): string {
    const lang = config.language;
    const categoryMessages = messages[lang]?.[category];

    if (!categoryMessages) {
        return `[Missing category: ${category}]`;
    }

    let message: string | string[] | undefined = (categoryMessages as Record<string, string | string[]>)[key];

    if (Array.isArray(message)) {
        message = message[Math.floor(Math.random() * message.length)];
    }

    if (typeof message !== 'string') {
        return `[Missing message: ${category}.${key}]`;
    }

    let result = message;
    if (replacements) {
        for (const [placeholder, value] of Object.entries(replacements)) {
            result = result.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
        }
    }

    return result;
}

/**
 * Get a random 8ball response
 */
export function getEightBallResponse(): string {
    const lang = config.language;
    const responses = messages[lang].fun.eightball;
    return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Get messages for the current language
 */
export function getMessages(): Messages {
    return messages[config.language];
}

export { messages, Messages };
