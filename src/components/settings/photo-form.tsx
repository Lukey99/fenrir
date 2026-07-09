"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { compressImageToDataUrl } from "@/lib/image-compression";
import { initials } from "@/lib/utils";

export function PhotoForm({
  image,
  name,
  email,
  size = 96,
}: {
  image: string | null;
  name: string | null;
  email?: string | null;
  size?: number;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(image);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    const previous = preview;
    try {
      const dataUrl = await compressImageToDataUrl(file);
      setPreview(dataUrl);

      const response = await fetch("/api/settings/photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });

      if (!response.ok) {
        toast.error("Impossible d'enregistrer la photo.");
        setPreview(previous);
        return;
      }
      toast.success("Photo mise à jour.");
      router.refresh();
    } catch {
      toast.error("Ce fichier n'a pas pu être traité.");
      setPreview(previous);
    } finally {
      setUploading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => fileInputRef.current?.click()}
      disabled={uploading}
      aria-label="Changer la photo de profil"
      className="group relative shrink-0 overflow-hidden rounded-full"
      style={{ width: size, height: size }}
    >
      <Avatar className="size-full">
        {preview && <AvatarImage src={preview} alt="" />}
        <AvatarFallback className="bg-brand text-2xl text-brand-foreground">
          {initials(name, email)}
        </AvatarFallback>
      </Avatar>
      <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
        <Camera className="size-6" />
      </span>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
    </button>
  );
}
