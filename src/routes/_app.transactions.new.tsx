import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useFinance, EXPENSE_CATEGORIES, INCOME_CATEGORIES, type TxType } from "@/context/FinanceContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

type Search = { id?: string };

export const Route = createFileRoute("/_app/transactions/new")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Add Transaction — FinFlow" },
      { name: "description", content: "Record income or expense transactions." },
    ],
  }),
  component: AddTransactionPage,
});

type FormValues = {
  title: string;
  amount: number;
  category: string;
  type: TxType;
  date: string;
  notes?: string;
  recurring?: boolean;
};

const schema: yup.ObjectSchema<FormValues> = yup.object({
  title: yup.string().trim().required("Title is required").max(100),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be positive")
    .required("Amount is required"),
  category: yup.string().required("Category is required"),
  type: yup.mixed<TxType>().oneOf(["income", "expense"]).required(),
  date: yup.string().required("Date is required"),
  notes: yup.string().max(500).optional(),
  recurring: yup.boolean().optional(),
});

function AddTransactionPage() {
  const { id } = Route.useSearch();
  const { transactions, addTransaction, updateTransaction } = useFinance();
  const navigate = useNavigate();
  const editing = useMemo(() => transactions.find((t) => t.id === id), [transactions, id]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      title: "",
      amount: undefined as unknown as number,
      category: "Food",
      type: "expense",
      date: format(new Date(), "yyyy-MM-dd"),
      notes: "",
      recurring: false,
    },
  });

  const type = watch("type");
  const recurring = watch("recurring");

  useEffect(() => {
    if (editing) {
      reset({
        title: editing.title,
        amount: editing.amount,
        category: editing.category,
        type: editing.type,
        date: format(new Date(editing.date), "yyyy-MM-dd"),
        notes: editing.notes ?? "",
        recurring: editing.recurring ?? false,
      });
    }
  }, [editing, reset]);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      notes: values.notes ?? "",
      recurring: values.recurring ?? false,
      date: new Date(values.date).toISOString(),
    };
    if (editing) {
      updateTransaction(editing.id, payload);
      toast.success("Transaction updated");
    } else {
      addTransaction(payload);
      toast.success("Transaction added");
    }
    navigate({ to: "/transactions" });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{editing ? "Edit transaction" : "Add transaction"}</h1>
        <p className="text-sm text-muted-foreground">
          {editing ? "Update the details below." : "Record a new income or expense."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5"
      >
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
          {(["expense", "income"] as TxType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setValue("type", t);
                setValue("category", t === "income" ? "Salary" : "Food");
              }}
              className={`rounded-lg py-2 text-sm font-medium capitalize transition-all ${
                type === t ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"
              }`}
              style={type === t ? { color: t === "income" ? "var(--income)" : "var(--expense)" } : undefined}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. Coffee at Starbucks" {...register("title")} />
          {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input id="amount" type="number" step="0.01" placeholder="0" {...register("amount")} />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const active = watch("category") === c;
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => setValue("category", c)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes (optional)</Label>
          <Textarea id="notes" rows={3} placeholder="Any details..." {...register("notes")} />
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border p-4">
          <div>
            <Label htmlFor="recurring" className="cursor-pointer">Recurring</Label>
            <p className="text-xs text-muted-foreground">Mark subscriptions, rent, etc.</p>
          </div>
          <Switch
            id="recurring"
            checked={!!recurring}
            onCheckedChange={(v) => setValue("recurring", v)}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting} className="flex-1">
            {editing ? "Save changes" : "Add transaction"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/transactions" })}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
