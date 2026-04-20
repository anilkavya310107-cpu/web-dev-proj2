import { motion } from "framer-motion";
import type { Transaction } from "@/context/FinanceContext";
import { formatCurrency } from "@/utils/currencyFormatter";
import { format } from "date-fns";
import { Pencil, Trash2, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categoryColors: Record<string, string> = {
  Food: "bg-orange-500/10 text-orange-600",
  Travel: "bg-blue-500/10 text-blue-600",
  Rent: "bg-purple-500/10 text-purple-600",
  Shopping: "bg-pink-500/10 text-pink-600",
  Entertainment: "bg-fuchsia-500/10 text-fuchsia-600",
  Health: "bg-red-500/10 text-red-600",
  Utilities: "bg-cyan-500/10 text-cyan-600",
  Subscriptions: "bg-indigo-500/10 text-indigo-600",
  Salary: "bg-emerald-500/10 text-emerald-600",
  Freelance: "bg-teal-500/10 text-teal-600",
  Investment: "bg-green-500/10 text-green-600",
};

export function TransactionCard({
  tx,
  onEdit,
  onDelete,
}: {
  tx: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
}) {
  const isIncome = tx.type === "income";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="group flex items-center justify-between rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ${
            categoryColors[tx.category] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {tx.category.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate">{tx.title}</p>
            {tx.recurring && (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Repeat className="h-3 w-3" /> Recurring
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{tx.category}</span>
            <span>•</span>
            <span>{format(new Date(tx.date), "dd MMM yyyy")}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className="font-semibold tabular-nums"
          style={{ color: isIncome ? "var(--income)" : "var(--expense)" }}
        >
          {isIncome ? "+" : "-"} {formatCurrency(tx.amount)}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => onEdit(tx)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onDelete(tx.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
