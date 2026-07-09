import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/server/validators/auth";
import { checkRateLimit, requestIp } from "@/lib/rate-limit";
import { normalizeEmail } from "@/lib/utils";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const { allowed } = checkRateLimit(`login:${requestIp(request)}`, 10, 60_000);
        if (!allowed) return null;

        const parsed = loginSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { password } = parsed.data;
        const email = normalizeEmail(parsed.data.email);
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      // Always re-read from the DB (rather than trusting/caching the claim on
      // the token) so a preference change is never lost to a stale session
      // check racing a concurrent update — e.g. the SessionProvider's mount
      // fetch landing after a settings change and overwriting it right back.
      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { unitPreference: true, image: true },
        });
        token.unitPreference = dbUser?.unitPreference ?? "KG";
        token.image = dbUser?.image ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.unitPreference = (token.unitPreference as "KG" | "LBS" | undefined) ?? "KG";
        session.user.image = (token.image as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});
