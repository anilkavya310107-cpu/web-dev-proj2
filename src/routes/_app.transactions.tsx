import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type Transaction } from "@/context/FinanceContext";
import { TransactionCard } from "@/components/TransactionCard";
import { useDebounce } from "@/hooks/useDebounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — FinFlow" },
      { name: "description", content: "Browse, search, filter and sort your transactions." },
    ],
  }),
  component: TransactionsPage,
});

const ALL_CATEGORIES = ["All", ...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

function TransactionsPage() {
  const navigate = useNavigate();
  const { transactions, deleteTransaction } = useFinance();
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 250);
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<"date" | "amount" | "category">("date");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (debounced.trim()) {
      const q = debounced.toLowerCase();
      list = list.filter(
        (t) => t.title.toLowerCase().includes(q) || (t.notes ?? "").toLowerCase().includes(q),
      );
    }
    if (type !== "all") list = list.filter((t) => t.type === type);
    if (category !== "All") list = list.filter((t) => t.category === category);
    if (from) list = list.filter((t) => new Date(t.date) >= new Date(from));
    if (to) list = list.filter((t) => new Date(t.date) <= new Date(to));
    list.sort((a, b) => {
      if (sort === "amount") return b.amount - a.amount;
      if (sort === "category") return a.category.localeCompare(b.category);
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    return list;
  }, [transactions, debounced, type, category, sort, from, to]);

  const handleEdit = (tx: Transaction) => {
    navigate({ to: "/transactions/new", search: { id: tx.id } as never });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast.success("Transaction deleted");
  };

  const reset = () => {
    setQuery("");
    setType("all");
    setCategory("All");
    setSort("date");
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} of {transactions.length} shown</p>
        </div>
        <Link to="/transactions/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Add
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {ALL_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
            <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort: Date</SelectItem>
              <SelectItem value="amount">Sort: Amount</SelectItem>
              <SelectItem value="category">Sort: Category</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(query || type !== "all" || category !== "All" || from || to) && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1">
            <X className="h-3 w-3" /> Reset filters
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No transactions match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((tx) => (
              <TransactionCard key={tx.id} tx={tx} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
