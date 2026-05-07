"use client";

import type { ReactNode } from "react";

export type CollapsibleSectionProps = {
  id?: string;
  title: string;
  description?: ReactNode;
  defaultOpen?: boolean;
  variant?: "default" | "amber";
  /** Shown next to the chevron; clicks do not collapse the section. */
  headerActions?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function CollapsibleSection({
  id,
  title,
  description,
  defaultOpen = true,
  variant = "default",
  headerActions,
  children,
  className = "",
}: CollapsibleSectionProps) {
  const shell =
    variant === "amber"
      ? "overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/50 shadow-md"
      : "rounded-2xl border border-slate-300 bg-white shadow-sm";

  const summaryBar =
    variant === "amber"
      ? "border-b border-amber-200/60 bg-amber-100/50"
      : "border-b border-slate-200 bg-slate-50/90";

  const titleClass = variant === "amber" ? "text-lg font-bold text-slate-900" : "text-lg font-semibold text-slate-900";

  const bodyClass =
    variant === "amber" ? "bg-transparent px-0 pb-1 pt-0" : "border-t border-slate-100 px-5 pb-5 pt-3";

  return (
    <details id={id} defaultOpen={defaultOpen} className={`group ${shell} ${className}`}>
      <summary
        className={`flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 marker:content-none [&::-webkit-details-marker]:hidden ${summaryBar}`}
      >
        <div className="min-w-0 flex-1">
          <h2 className={titleClass}>{title}</h2>
          {description ? <div className="mt-1 max-w-2xl text-sm text-slate-600">{description}</div> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {headerActions ? (
            <div
              className="flex items-center gap-2"
              role="presentation"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              {headerActions}
            </div>
          ) : null}
          <svg
            className="h-5 w-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.127l3.71-3.895a.75.75 0 111.08 1.04l-4.24 4.467a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </summary>
      <div className={bodyClass}>{children}</div>
    </details>
  );
}
