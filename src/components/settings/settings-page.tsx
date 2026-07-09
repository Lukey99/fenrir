"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProfileForm } from "@/components/settings/profile-form";
import { PasswordForm } from "@/components/settings/password-form";
import { UnitToggle } from "@/components/settings/unit-toggle";
import { HeightForm } from "@/components/settings/height-form";
import { DataPortability } from "@/components/settings/data-portability";
import type { WeightUnit } from "@/lib/units";

export type SettingsProfile = {
  id: string;
  name: string | null;
  email: string | null;
  unitPreference: WeightUnit;
  heightCm: number | null;
};

export function SettingsPage({ profile }: { profile: SettingsProfile }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">Paramètres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Profil, unités, sécurité et export de tes données.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Ton nom et ton adresse e-mail.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm name={profile.name} email={profile.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
            <CardDescription>Thème clair, sombre ou automatique.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unités & mensurations</CardTitle>
            <CardDescription>
              Utilisé pour l&apos;affichage de tes poids soulevés et de ton poids de corps.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnitToggle initialUnit={profile.unitPreference} />
            <HeightForm initialHeightCm={profile.heightCm} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sécurité</CardTitle>
            <CardDescription>Change ton mot de passe.</CardDescription>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mes données</CardTitle>
            <CardDescription>
              Exporte une sauvegarde complète (programmes, séances, pesées) ou restaure-la ailleurs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataPortability />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
