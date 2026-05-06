import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { authenticator } from "otplib";
import prisma from "./prisma";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",
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

        if (!admin) throw new Error("Utilisateur non trouvé");

        const isPasswordValid = await bcrypt.compare(credentials.password, admin.password);
        if (!isPasswordValid) throw new Error("Mot de passe incorrect");

        return {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          userType: "ADMIN"
        };
      }
    }),
    CredentialsProvider({
      id: "student-credentials",
      name: "Étudiant",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
        twoFactorCode: { label: "2FA", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Identifiants requis");
        }

        const candidate = await prisma.candidate.findFirst({
          where: {
            email: credentials.email,
            lmsPassword: { not: null }
          },
          orderBy: { createdAt: "desc" }
        });

        if (!candidate) throw new Error("Aucun compte étudiant trouvé pour cet email");

        const isValid = await bcrypt.compare(credentials.password, candidate.lmsPassword);
        if (!isValid) throw new Error("Mot de passe incorrect");

        if (candidate.twoFactorEnabled) {
          if (!credentials.twoFactorCode) {
            throw new Error("2FA_REQUIRED");
          }
          const result = authenticator.verify({ 
            token: credentials.twoFactorCode, 
            secret: candidate.twoFactorSecret 
          });
          if (!result) {
            throw new Error("Code de double authentification invalide");
          }
        }

        return {
          id: candidate.id,
          name: `${candidate.firstName} ${candidate.lastName}`,
          email: candidate.email,
          role: "STUDENT",
          userType: "STUDENT",
          candidateId: candidate.id
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
        token.userType = user.userType || "ADMIN";
        if (user.candidateId) token.candidateId = user.candidateId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.userType = token.userType || "ADMIN";
        if (token.candidateId) session.user.candidateId = token.candidateId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
};
