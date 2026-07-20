import type { ReactNode } from "react";

type SectionProps = {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
};

export function Section({
  title,
  eyebrow,
  children,
  className = "",
}: SectionProps) {
  return (
    <section className={`py-14 md:py-20 ${className}`}>
      <div className="mb-8 max-w-2xl">
        {eyebrow ? (
          <p className="mb-3 text-xs uppercase tracking-[0.22em] text-moss">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl tracking-tight text-ink md:text-4xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
