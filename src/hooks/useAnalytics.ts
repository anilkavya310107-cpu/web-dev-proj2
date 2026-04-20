import { useMemo } from "react";
import { useFinance } from "@/context/FinanceContext";
import { format, subMonths, startOfMonth } from "date-fns";

export function useAnalytics() {
  const { transactions } = useFinance();

  return useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const net = totalIncome - totalExpense;

    const byCat: Record<string, number> = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        byCat[t.category] = (byCat[t.category] || 0) + t.amount;
      });
    const categoryData = Object.entries(byCat)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const topCategory = categoryData[0]?.name ?? "—";

    // last 6 months trend
    const months: { month: string; income: number; expense: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const ref = startOfMonth(subMonths(new Date(), i));
      const label = format(ref, "MMM");
      const m = ref.getMonth();
      const y = ref.getFullYear();
      const inc = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === "income" && d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((s, t) => s + t.amount, 0);
      const exp = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return t.type === "expense" && d.getMonth() === m && d.getFullYear() === y;
        })
        .reduce((s, t) => s + t.amount, 0);
      months.push({ month: label, income: inc, expense: exp });
    }

    return { totalIncome, totalExpense, net, topCategory, categoryData, months };
  }, [transactions]);
}
