import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { sendWelcomeEmail } from "./email";
import { generateReferralCode } from "./referral";

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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
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
    ...(process.env.FACEBOOK_CLIENT_ID
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
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
          console.error("OAuth signIn error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.image = user.image;
        token.role = (user as { role: string }).role || "CLIENT";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;

        // Always fetch latest image from database in case it was updated
        if (token.id) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { image: true, name: true },
            });
            if (dbUser) {
              session.user.image = dbUser.image || undefined;
              session.user.name = dbUser.name || session.user.name;
            }
          } catch (error) {
            console.error("Session callback error fetching user:", error);
          }
        }
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
