import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

const DISCORD_SCOPES = ['identify', 'guilds'].join(' ');

export const authOptions: NextAuthOptions = {
    providers: [
        DiscordProvider({
            clientId: process.env.CLIENT_ID!,
            clientSecret: process.env.DISCORD_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: DISCORD_SCOPES,
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account }) {
            if (account) {
                token.accessToken = account.access_token;
                token.userId = account.providerAccountId;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.userId as string;
                (session as { accessToken?: string }).accessToken = token.accessToken as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
