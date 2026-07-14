import { cn } from "@/lib/utils";

export function Screenshot({
  name,
  variant = "card",
  alt,
  className,
  imgClassName,
}: {
  name: string;
  variant?: "card" | "carousel";
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const suffix = variant === "carousel" ? "-carousel" : "";
  // Each source crop is a different height (it's cropped to whatever content
  // made sense per page) — the carousel needs a fixed frame so slides don't
  // jump in height as you flip through them; object-cover + object-top fills
  // that frame consistently, always anchored to the top of the screenshot.
  const frameClassName = variant === "carousel" ? "aspect-[1280/900]" : undefined;
  const fillClassName = variant === "carousel" ? "h-full object-cover object-top" : undefined;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06),0_32px_64px_-24px_rgba(0,0,0,0.28)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_32px_64px_-24px_rgba(0,0,0,0.7)]",
        frameClassName,
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/screenshots/${name}${suffix}-light.png`}
        alt={alt}
        className={cn("block w-full dark:hidden", fillClassName, imgClassName)}
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/screenshots/${name}${suffix}-dark.png`}
        alt={alt}
        className={cn("hidden w-full dark:block", fillClassName, imgClassName)}
        draggable={false}
      />
    </div>
  );
}
