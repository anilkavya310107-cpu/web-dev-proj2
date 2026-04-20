import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

export type TxType = "income" | "expense";

export const EXPENSE_CATEGORIES = [
  "Food",
  "Travel",
  "Rent",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Subscriptions",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investment", "Gift", "Other"] as const;

export type Transaction = {
  id: string;
  title: string;
  amount: number;
  category: string;
  type: TxType;
  date: string; // ISO
  notes?: string;
  recurring?: boolean;
};

type FinanceState = {
  transactions: Transaction[];
  budget: number;
  addTransaction: (tx: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
  setBudget: (n: number) => void;
};

const FinanceContext = createContext<FinanceState | undefined>(undefined);

const STORAGE_TX = "pf_transactions_v1";
const STORAGE_BUDGET = "pf_budget_v1";

const seed = (): Transaction[] => {
  const now = new Date();
  const d = (offset: number) => {
    const x = new Date(now);
    x.setDate(x.getDate() - offset);
    return x.toISOString();
  };
  return [
    { id: uuidv4(), title: "Salary", amount: 55000, category: "Salary", type: "income", date: d(2), notes: "Monthly salary" },
    { id: uuidv4(), title: "Netflix", amount: 499, category: "Subscriptions", type: "expense", date: d(3), recurring: true },
    { id: uuidv4(), title: "Groceries", amount: 2400, category: "Food", type: "expense", date: d(5) },
    { id: uuidv4(), title: "Uber", amount: 320, category: "Travel", type: "expense", date: d(6) },
    { id: uuidv4(), title: "Rent", amount: 18000, category: "Rent", type: "expense", date: d(8), recurring: true },
    { id: uuidv4(), title: "Movie", amount: 800, category: "Entertainment", type: "expense", date: d(10) },
    { id: uuidv4(), title: "Freelance project", amount: 12000, category: "Freelance", type: "income", date: d(12) },
    { id: uuidv4(), title: "Pharmacy", amount: 650, category: "Health", type: "expense", date: d(14) },
    { id: uuidv4(), title: "Electricity bill", amount: 1450, category: "Utilities", type: "expense", date: d(18) },
    { id: uuidv4(), title: "Amazon order", amount: 3200, category: "Shopping", type: "expense", date: d(22) },
  ];
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(STORAGE_TX);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return seed();
      }
    }
    return seed();
  });

  const [budget, setBudgetState] = useState<number>(() => {
    if (typeof window === "undefined") return 50000;
    const raw = localStorage.getItem(STORAGE_BUDGET);
    return raw ? Number(raw) : 50000;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_TX, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_BUDGET, String(budget));
  }, [budget]);

  const addTransaction = (tx: Omit<Transaction, "id">) =>
    setTransactions((p) => [{ ...tx, id: uuidv4() }, ...p]);

  const updateTransaction = (id: string, tx: Omit<Transaction, "id">) =>
    setTransactions((p) => p.map((t) => (t.id === id ? { ...tx, id } : t)));

  const deleteTransaction = (id: string) =>
    setTransactions((p) => p.filter((t) => t.id !== id));

  const setBudget = (n: number) => setBudgetState(n);

  return (
    <FinanceContext.Provider
      value={{ transactions, budget, addTransaction, updateTransaction, deleteTransaction, setBudget }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export const useFinance = () => {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used inside FinanceProvider");
  return ctx;
};
