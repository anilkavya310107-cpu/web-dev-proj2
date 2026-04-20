import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useFinance } from "@/context/FinanceContext";
import { useBudget } from "@/hooks/useBudget";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/utils/currencyFormatter";
import { toast } from "sonner";
import { Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_app/budget")({
  head: () => ({
    meta: [
      { title: "Budget — FinFlow" },
      { name: "description", content: "Set and track your monthly budget." },
    ],
  }),
  component: BudgetPage,
});

function BudgetPage() {
  const { budget, setBudget } = useFinance();
  const { monthSpend, remaining, percent } = useBudget();
  const [value, setValue] = useState(String(budget));

  const save = () => {
    const n = Number(value);
    if (!n || n <= 0) {
      toast.error("Enter a valid budget");
      return;
    }
    setBudget(n);
    toast.success("Budget updated");
  };

  const overBudget = remaining < 0;
  const warning = percent >= 80 && !overBudget;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Monthly Budget</h1>
        <p className="text-sm text-muted-foreground">Plan your spending and stay on track.</p>
      </div>

      <div
        className="rounded-3xl p-6 md:p-8 text-primary-foreground shadow-lg"
        style={{ background: "var(--gradient-primary)" }}
      >
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Wallet className="h-4 w-4" /> This month
        </div>
        <p className="mt-2 text-4xl font-bold tabular-nums">{formatCurrency(monthSpend)}</p>
        <p className="mt-1 text-sm opacity-90">spent of {formatCurrency(budget)} budget</p>
        <Progress value={percent} className="mt-4 h-3 bg-white/20" />
        <div className="mt-3 flex items-center justify-between text-sm">
          <span>{percent.toFixed(1)}% used</span>
          <span className="font-semibold">
            {overBudget
              ? `Over by ${formatCurrency(Math.abs(remaining))}`
              : `${formatCurrency(remaining)} left`}
          </span>
        </div>
      </div>

      {overBudget && (
        <div className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="font-semibold text-destructive">You're over budget</p>
            <p className="text-sm text-muted-foreground">
              Review your recent expenses and adjust your spending.
            </p>
          </div>
        </div>
      )}
      {warning && (
        <div
          className="flex gap-3 rounded-xl border p-4"
          style={{ borderColor: "var(--warning)", background: "color-mix(in oklab, var(--warning) 10%, transparent)" }}
        >
          <AlertTriangle className="h-5 w-5 shrink-0" style={{ color: "var(--warning)" }} />
          <div>
            <p className="font-semibold">You've used {percent.toFixed(0)}% of your budget</p>
            <p className="text-sm text-muted-foreground">Slow down on non-essentials this month.</p>
          </div>
        </div>
      )}
      {!overBudget && !warning && percent > 0 && (
        <div className="flex gap-3 rounded-xl border border-border bg-card p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "var(--success)" }} />
          <div>
            <p className="font-semibold">You're on track</p>
            <p className="text-sm text-muted-foreground">Great job managing your spending this month!</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold">Update budget</h3>
          <p className="text-sm text-muted-foreground">Set a new monthly spending limit.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget">Monthly budget (₹)</Label>
          <div className="flex gap-2">
            <Input
              id="budget"
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <Button onClick={save}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
