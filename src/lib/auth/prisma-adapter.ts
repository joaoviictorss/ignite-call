import { Adapter } from "next-auth/adapters";
import { prisma } from "../prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { parseCookies, destroyCookie } from "nookies";

export function PrismaAdapter(
  req: NextApiRequest,
  res: NextApiResponse
): Adapter {
  return {
    async createUser(user) {
      // Busca o id do usuario dentro dos cookis
      const { "@ignitecall:userId": userIdOnCookies } = parseCookies({ req });

      if (!userIdOnCookies) {
        throw new Error("User ID not found on cookies");
      }

      const prismaUser = await prisma.user.update({
        where: {
          id: userIdOnCookies,
        },
        data: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
      // apaga os cookies que nao serao mais utilizados
      destroyCookie({ res }, "@ignitecall:userId", {
        path: "/",
      });

      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        email: prismaUser.email!,
        emailVerified: null,
        avatarUrl: prismaUser.avatarUrl!,
      };
    },
    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatarUrl: user.avatarUrl!,
      };
    },
    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatarUrl: user.avatarUrl!,
      };
    },
    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          providerId_providerAccountId: {
            providerId: provider,
            providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

      if (!account) {
        return null;
      }

      const { user } = account;

      return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email!,
        emailVerified: null,
        avatarUrl: user.avatarUrl!,
      };
    },
    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        where: {
          id: user.id!,
        },
        data: {
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
      });
      return {
        id: prismaUser.id,
        name: prismaUser.name,
        username: prismaUser.username,
        email: prismaUser.email!,
        emailVerified: null,
        avatarUrl: prismaUser.avatarUrl!,
      };
    },
    async linkAccount(account) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          providerType: account.type,
          providerId: account.provider,
          providerAccountId: account.providerAccountId,
          refreshToken: account.refresh_token,
          accessToken: account.access_token,
        },
      });
    },
    async createSession({ sessionToken, expires, userId }) {
      await prisma.session.create({
        data: {
          userId,
          expires,
          sessionToken,
        },
      });

      return {
        userId,
        sessionToken,
        expires,
      };
    },
    async getSessionAndUser(sessionToken) {
      const prismaSession = await prisma.session.findUnique({
        where: {
          sessionToken,
        },
        include: {
          user: true,
        },
      });

      if (!prismaSession) {
        return null;
      }

      const { user, ...session } = prismaSession;

      return {
        session: {
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        },
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email!,
          emailVerified: null,
          avatarUrl: user.avatarUrl!,
        },
      };
    },
    async updateSession({ sessionToken, expires, userId }) {
      const prismaSession = await prisma.session.update({
        where: {
          sessionToken,
        },
        data: {
          expires,
          userId,
        },
      });
      return {
        sessionToken: prismaSession.sessionToken,
        userId: prismaSession.userId,
        expires: prismaSession.expires,
      };
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          sessionToken,
        },
      });
    },
  };
}
