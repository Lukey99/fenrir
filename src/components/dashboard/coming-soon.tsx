import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ComingSoon({
  icon: Icon,
  title,
  description,
  milestone,
  color = "bg-brand/10 text-brand",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  milestone: string;
  /** Literal Tailwind classes, e.g. "bg-muscle-back/10 text-muscle-back" */
  color?: string;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="group max-w-md transition-shadow duration-300 hover:shadow-lg hover:shadow-foreground/5">
        <CardContent className="flex flex-col items-center gap-3 px-8 py-10 text-center">
          <span
            className={`flex size-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${color}`}
          >
            <Icon className="size-6" />
          </span>
          <h2 className="font-heading text-lg font-semibold">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">{milestone}</p>
        </CardContent>
      </Card>
    </div>
  );
}
