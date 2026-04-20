import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function StatCard({
  title,
  value,
  icon,
  accent = "primary",
  hint,
}: {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: "primary" | "income" | "expense" | "warning";
  hint?: string;
}) {
  const colorVar =
    accent === "income"
      ? "var(--income)"
      : accent === "expense"
      ? "var(--expense)"
      : accent === "warning"
      ? "var(--warning)"
      : "var(--primary)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm"
      style={{ background: "var(--gradient-card)" }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold tabular-nums" style={{ color: colorVar }}>
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: `color-mix(in oklab, ${colorVar} 15%, transparent)`, color: colorVar }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
