import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      unitPreference: "KG" | "LBS";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    unitPreference?: "KG" | "LBS";
    image?: string | null;
  }
}
