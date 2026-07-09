"use client";

import { signOut } from "next-auth/react";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/utils";

export function UserMenu({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full outline-none ring-offset-2 transition-transform duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Menu du compte"
      >
        <Avatar className="size-8 ring-2 ring-transparent transition-all duration-200 hover:ring-brand/30">
          <AvatarFallback className="bg-brand text-brand-foreground text-xs">
            {initials(name, email)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-medium">{name ?? "Mon compte"}</span>
            {email && <span className="text-xs font-normal text-muted-foreground">{email}</span>}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/settings" />}>
          <UserIcon className="size-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings className="size-4" />
          Paramètres
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
