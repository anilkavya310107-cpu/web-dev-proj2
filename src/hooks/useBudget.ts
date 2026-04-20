import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";

export function useBudget() {
  const { transactions, budget } = useFinance();
  return useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const monthSpend = transactions
      .filter((t) => {
        const d = new Date(t.date);
        return t.type === "expense" && d.getMonth() === m && d.getFullYear() === y;
      })
      .reduce((s, t) => s + t.amount, 0);
    const remaining = budget - monthSpend;
    const percent = budget > 0 ? Math.min(100, (monthSpend / budget) * 100) : 0;
    return { budget, monthSpend, remaining, percent };
  }, [transactions, budget]);
}
