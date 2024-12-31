import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type GetServerSidePropsContext } from "next";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/server/db";
import { compare } from "bcryptjs";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      points: number;
      isAdmin: boolean;  
    } & DefaultSession["user"];
  }

  interface User {
    points: number;
    isAdmin: boolean;  
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    points: number;
    isAdmin: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.points = user.points;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        points: token.points as number,
        isAdmin: token.isAdmin as boolean,
      },
    }),
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Authorize attempt with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            throw new Error("Invalid credentials");
        }
        
        const user = await db.user.findUnique({
            where: { email: credentials.email }
        });
        
        console.log("User found:", !!user);
        
        if (!user || !user.password) {
            console.log("User not found or no password");
            throw new Error("User not found");
        }
        
        const isValid = await compare(credentials.password, user.password);
        
        console.log("Password valid:", isValid);
        
        if (!isValid) {
            console.log("Invalid password");
            throw new Error("Invalid password");
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          points: user.points,
          isAdmin: user.isAdmin,  // add this
      };
    }
    })
  ],
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
    // Add custom pages if needed
  }
};

export const getServerAuthSession = async (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return await getServerSession(ctx.req, ctx.res, authOptions);
};

export const auth = async () => {
  const session = await getServerSession(authOptions);
  return session;
};