"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

import { loginSchema, type LoginInput } from "@/server/validators/auth";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AuthMotion } from "@/components/auth/auth-motion";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setServerError(null);
    const result = await signIn("credentials", {
      ...values,
      redirect: false,
    });

    if (result?.error) {
      setServerError("E-mail ou mot de passe incorrect.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthMotion>
      {/* CardTitle below is a styled <div>, not a heading — this is the
          page's real, document-structure h1 for screen readers. */}
      <h1 className="sr-only">Connexion</h1>
      <Card>
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>
            Accède à ton suivi d&apos;entraînement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" autoComplete="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-destructive">{serverError}</p>}
            <MagneticButton
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </MagneticButton>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Créer un compte
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthMotion>
  );
}
