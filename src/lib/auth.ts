// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          const emailLower = credentials.email.toLowerCase();
          console.log("🔐 Login attempt for:", emailLower);

          const user = await prisma.user.findUnique({
            where: { email: emailLower },
          });

          if (!user) {
            console.log("❌ User not found");
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          console.log("✅ User authenticated:", user.email, "ID:", user.id);

          return {
            id: user.id,
            email: user.email,
            name: user.username,
          };
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, trigger }) {
      console.log("🎫 JWT Callback - trigger:", trigger);

      if (user) {
        // User just signed in
        token.id = user.id;
        token.email = user.email;
        console.log(
          "🎫 JWT - New token created for user:",
          user.id,
          user.email
        );
      } else {
        // Token refresh - verify user still exists
        console.log("🎫 JWT - Existing token, user ID:", token.id);
      }

      return token;
    },
    async session({ session, token }) {
      console.log(
        "📋 Session Callback - token.id:",
        token.id,
        "token.email:",
        token.email
      );

      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        console.log(
          "📋 Session created for user:",
          session.user.id,
          session.user.email
        );
      }

      return session;
    },
  },
  debug: true, // Always enable debug for now
};
