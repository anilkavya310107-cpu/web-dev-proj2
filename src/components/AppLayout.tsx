import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { LayoutDashboard, ListOrdered, PlusCircle, Wallet, BarChart3, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: ListOrdered },
  { to: "/transactions/new", label: "Add", icon: PlusCircle },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
] as const;

export function AppLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-primary-foreground shadow-md"
              style={{ background: "var(--gradient-primary)" }}
            >
              <IndianRupee className="h-5 w-5" />
            </span>
            <span>FinFlow</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const Icon = n.icon;
              const active = location.pathname === n.to ||
                (n.to !== "/transactions/new" && location.pathname.startsWith(n.to) && n.to !== "/transactions");
              const isActive = location.pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-lg bg-primary/10"
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-card/95 backdrop-blur">
        <div className="grid grid-cols-5">
          {nav.map((n) => {
            const Icon = n.icon;
            const isActive = location.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center gap-1 py-2 text-xs ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
