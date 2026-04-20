import { createFileRoute, Link } from "@tanstack/react-router";
import { useFinance } from "@/context/FinanceContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useBudget } from "@/hooks/useBudget";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, TrendingDown, Wallet, Tag, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/utils/currencyFormatter";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FinFlow" },
      { name: "description", content: "Your financial overview at a glance." },
    ],
  }),
  component: DashboardPage,
});

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1"];

function DashboardPage() {
  const { transactions } = useFinance();
  const { totalIncome, totalExpense, net, topCategory, categoryData, months } = useAnalytics();
  const { budget, monthSpend, percent } = useBudget();
  const recent = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div
        className="rounded-3xl p-6 md:p-8 text-primary-foreground shadow-lg"
        style={{ background: "var(--gradient-hero)" }}
      >
        <p className="text-sm opacity-90">Welcome back 👋</p>
        <h1 className="mt-1 text-2xl md:text-3xl font-bold">Your money, beautifully tracked.</h1>
        <p className="mt-2 text-sm opacity-90 max-w-xl">
          Stay on top of every rupee. See where it goes, what's left, and what to do next.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/transactions/new">
            <Button variant="secondary" className="gap-2">
              Add transaction <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/analytics">
            <Button variant="ghost" className="text-primary-foreground hover:bg-white/15">
              View analytics
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="income"
        />
        <StatCard
          title="Total Expenses"
          value={formatCurrency(totalExpense)}
          icon={<TrendingDown className="h-5 w-5" />}
          accent="expense"
        />
        <StatCard
          title="Net Balance"
          value={formatCurrency(net)}
          icon={<Wallet className="h-5 w-5" />}
          accent={net >= 0 ? "income" : "expense"}
        />
        <StatCard
          title="Top Category"
          value={topCategory}
          icon={<Tag className="h-5 w-5" />}
          accent="primary"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Monthly Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={months}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                  }}
                  formatter={(v: any) => formatCurrency(Number(v))}
                />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Budget Usage</h3>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold tabular-nums">{formatCurrency(monthSpend)}</span>
              <span className="text-sm text-muted-foreground">of {formatCurrency(budget)}</span>
            </div>
            <Progress value={percent} className="h-3" />
            <p className="text-xs text-muted-foreground">{percent.toFixed(1)}% of monthly budget used</p>
            <Link to="/budget" className="block">
              <Button variant="outline" size="sm" className="w-full">
                Manage budget
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No expenses yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No transactions yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-sm">{t.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.category} • {format(new Date(t.date), "dd MMM")}
                    </p>
                  </div>
                  <span
                    className="font-semibold text-sm tabular-nums"
                    style={{ color: t.type === "income" ? "var(--income)" : "var(--expense)" }}
                  >
                    {t.type === "income" ? "+" : "-"} {formatCurrency(t.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
