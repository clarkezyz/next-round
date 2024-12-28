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
      // ...other user properties you want in session
    } & DefaultSession["user"];
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        points: user.points,
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
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        const user = await db.user.findUnique({
          where: { email: credentials.email }
        });
        
        if (!user) {
          throw new Error("User not found");
        }
        
        const isValid = await compare(credentials.password, user.password);
        
        if (!isValid) {
          throw new Error("Invalid password");
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          points: user.points,
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