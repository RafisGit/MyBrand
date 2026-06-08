import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "space-y-4",
        align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl",
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
        {eyebrow}
      </p>
      <h2 className="max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-black sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
