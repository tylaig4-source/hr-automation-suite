import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { getBaseUrl } from "./url";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-mail e senha são obrigatórios");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true },
        });

        if (!user || !user.password) {
          throw new Error("E-mail ou senha incorretos");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("E-mail ou senha incorretos");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          companyId: user.companyId,
        };
      },
    }),
    
    // Google OAuth (opcional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Primeiro login - adiciona dados do usuário ao token
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.companyId = (user as any).companyId;
      }
      
      // Atualização de sessão (ex: após mudar empresa)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.companyId = session.companyId;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = token.companyId as string | null;
      }
      return session;
    },
    
    async signIn({ user, account }) {
      // Para OAuth, verifica se o usuário já existe
      if (account?.provider !== "credentials") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });
        
        // Se não existe, será criado automaticamente pelo adapter
        if (!existingUser) {
          // Pode adicionar lógica adicional aqui
          // Ex: criar empresa default, enviar email de boas-vindas, etc.
        }
      }
      
      return true;
    },
  },
  
  events: {
    async signIn({ user }) {
      // Log de login (opcional)
      console.log(`User logged in: ${user.email}`);
    },
  },
  
  debug: process.env.NODE_ENV === "development",
};

// Tipos customizados para NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
      role: string;
      companyId: string | null;
    };
  }
  
  interface User {
    role?: string;
    companyId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    companyId: string | null;
  }
}

