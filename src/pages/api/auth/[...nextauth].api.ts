import { PrismaAdapter } from "@/src/lib/auth/prisma-adapter";
import { NextApiRequest, NextApiResponse } from "next";
import NextAuth, { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { GoogleProfile } from "next-auth/providers/google";

export function buildNextAuthOptions(
  req: NextApiRequest,
  res: NextApiResponse
): NextAuthOptions {
  return {
    adapter: PrismaAdapter(req, res),
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        authorization: {
          params: {
            scope:
              "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar",
          },
        },
        profile(profile: GoogleProfile) {
          return {
            id: profile.sub,
            name: profile.name,
            username: "",
            email: profile.email,
            avatarUrl: profile.picture,
          };
        },
      }),
    ],

    callbacks: {
      // A função signIn roda assim que o usuario logar na aplicação

      // Se eu retorno uma string no metodo signIn, a função entende que deve redirecionar o usuario para o local retornado. Tambem é possivel o retorno de true ou false, onde true significa que esta tudo ok e false é para barra o signIn do usuario

      // Desestruturei o account onde tenho a informação de scopos, se o scopo não incluir a permissão de calendario, é retornado a pagina connect calendar com o query param de erro

      async signIn({ account }) {
        if (
          !account?.scope?.includes("https://www.googleapis.com/auth/calendar")
        ) {
          return "/register/connect-calendar/?error=permissions";
        }

        return true;
      },
      async session({session, user}) {
        return {
          ...session,
          user
        }
      }
      // Tudo que eu retornar nesse callback, sera enviado para o hook useSession no frontend
    },
  };
}

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, buildNextAuthOptions(req, res));
}
