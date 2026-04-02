import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "./prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Identifiants requis");
        }

        const admin = await prisma.admin.findUnique({
          where: { email: credentials.email }
        });

        if (!admin) {
          throw new Error("Utilisateur non trouvé");
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);

        if (!isPasswordValid) {
          throw new Error("Mot de passe incorrect");
        }

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
      }
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  }
};

export const getAuthSession = () => getServerSession(authOptions);
