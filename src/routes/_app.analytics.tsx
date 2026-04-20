import { createFileRoute } from "@tanstack/react-router";
import { useFinance } from "@/context/FinanceContext";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCurrency } from "@/hooks/useCurrency";
import { formatCurrency } from "@/utils/currencyFormatter";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, TrendingDown, Wallet, Repeat } from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — FinFlow" },
      { name: "description", content: "Deep insights into your spending patterns and financial trends." },
    ],
  }),
  component: AnalyticsPage,
});

const PIE_COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#6366f1"];

function AnalyticsPage() {
  const { transactions } = useFinance();
  const { totalIncome, totalExpense, net, categoryData, months } = useAnalytics();
  const { currency, setCurrency, convert, rates, symbol } = useCurrency("INR");
  const recurring = transactions.filter((t) => t.recurring);

  const fmt = (n: number) =>
    currency === "INR"
      ? formatCurrency(n)
      : `${symbol}${convert(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const popular = ["INR", "USD", "EUR", "GBP", "AED", "JPY", "AUD", "CAD"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Visualize your financial activity.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">View in</span>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {popular.map((c) => (
                <SelectItem key={c} value={c} disabled={!rates && c !== "INR"}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Income" value={fmt(totalIncome)} icon={<TrendingUp className="h-5 w-5" />} accent="income" />
        <StatCard title="Total Expenses" value={fmt(totalExpense)} icon={<TrendingDown className="h-5 w-5" />} accent="expense" />
        <StatCard title="Net Balance" value={fmt(net)} icon={<Wallet className="h-5 w-5" />} accent={net >= 0 ? "income" : "expense"} />
        <StatCard title="Recurring" value={`${recurring.length} items`} icon={<Repeat className="h-5 w-5" />} accent="primary" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Spending by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No data yet.</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={100} label>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => fmt(Number(v))} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4">Income vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => fmt(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-semibold mb-4">Monthly Spending Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={months}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {recurring.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Repeat className="h-4 w-4" /> Recurring expenses
          </h3>
          <ul className="grid gap-2 sm:grid-cols-2">
            {recurring.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-border p-3"
              >
                <div>
                  <p className="font-medium text-sm">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.category}</p>
                </div>
                <span className="font-semibold tabular-nums" style={{ color: "var(--expense)" }}>
                  {fmt(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
