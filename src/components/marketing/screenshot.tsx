import { cn } from "@/lib/utils";

/** All source screenshots are captured at the same 1280×900 viewport, so this
 * frame's aspect ratio matches them exactly — object-cover just keeps that
 * guarantee even if a future capture drifts slightly. */
export function Screenshot({ name, alt, className }: { name: string; alt: string; className?: string }) {
  return (
    <div
      className={cn(
        "aspect-1280/900 overflow-hidden rounded-2xl border border-border shadow-[0_1px_3px_rgba(0,0,0,0.06),0_32px_64px_-24px_rgba(0,0,0,0.28)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_32px_64px_-24px_rgba(0,0,0,0.7)]",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/screenshots/${name}-light.png`}
        alt={alt}
        className="block h-full w-full object-cover object-top dark:hidden"
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/screenshots/${name}-dark.png`}
        alt={alt}
        className="hidden h-full w-full object-cover object-top dark:block"
        draggable={false}
      />
    </div>
  );
}
