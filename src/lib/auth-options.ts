import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendWelcomeEmail } from "./email";
import { generateReferralCode } from "./referral";
import { loginLimiter } from "./ratelimit";

export const authOptions: NextAuthOptions = {
  // No PrismaAdapter — we handle OAuth user creation manually in signIn callback
  // This avoids the known conflict between PrismaAdapter + jwt strategy
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const emailKey = credentials.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        const isValid =
          !!user?.passwordHash &&
          (await bcrypt.compare(credentials.password, user.passwordHash));

        // Only failed attempts consume the rate-limit counter. Successful
        // logins (e.g. the auto sign-in right after QuickRegisterForm)
        // never get throttled by a previous failed-test history on the
        // same email.
        if (!isValid) {
          try {
            const { success } = await loginLimiter.limit(`login-${emailKey}`);
            if (!success) {
              throw new Error(
                "Trop de tentatives de connexion. Réessayez dans quelques minutes."
              );
            }
          } catch (e) {
            if (e instanceof Error && e.message.includes("Trop de tentatives")) throw e;
            // Fail open if Redis is unavailable.
          }
          return null;
        }

        return {
          id: user!.id,
          email: user!.email,
          name: user!.name,
          image: user!.image,
          role: user!.role,
        };
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const email = user.email || profile?.email;
          if (!email) return false;

          // Find or create user in our database
          let dbUser = await prisma.user.findUnique({
            where: { email },
          });

          if (!dbUser) {
            // Create new user from OAuth
            const userName = user.name || profile?.name || "Utilisateur";
            dbUser = await prisma.user.create({
              data: {
                email,
                name: userName,
                image: user.image || null,
                role: "CLIENT",
                emailVerified: new Date(),
              },
            });

            // Send welcome email + generate referral code (async, non-blocking)
            sendWelcomeEmail(email, userName).catch(() => {});
            generateReferralCode(dbUser.id).catch(() => {});
          } else if (!dbUser.image && user.image) {
            // Update image if missing
            await prisma.user.update({
              where: { id: dbUser.id },
              data: { image: user.image },
            });
          }

          // Store the DB user id on the user object so jwt callback can use it
          user.id = dbUser.id;
          (user as { role: string }).role = dbUser.role;

          return true;
        } catch (error) {
          // Log only the error message (RGPD: avoid logging full error object
          // which may contain user email via Prisma constraint violations)
          console.error("OAuth signIn error:", error instanceof Error ? error.message : "unknown");
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // Initial login — hydrate the token from the authorize() payload.
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.image = user.image;
        token.role = (user as { role: string }).role || "CLIENT";
        token.refreshedAt = Date.now();
        return token;
      }

      // Explicit refresh (called via update() from the client after a
      // profile mutation) OR stale token (>5 min). Cap the DB hits to
      // 1 every 5 minutes per active user — previously this ran on EVERY
      // request to every authenticated page, adding ~20ms each.
      const FIVE_MIN = 5 * 60 * 1000;
      const lastRefresh = (token.refreshedAt as number | undefined) ?? 0;
      const stale = Date.now() - lastRefresh > FIVE_MIN;

      if (token.id && (trigger === "update" || stale)) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { name: true, image: true, role: true },
          });
          if (dbUser) {
            token.name = dbUser.name;
            token.image = dbUser.image;
            token.role = dbUser.role;
          }
          token.refreshedAt = Date.now();
        } catch (error) {
          console.error("[auth] JWT refresh failed:", error instanceof Error ? error.message : "unknown");
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.image = (token.image as string | null | undefined) ?? undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
};
