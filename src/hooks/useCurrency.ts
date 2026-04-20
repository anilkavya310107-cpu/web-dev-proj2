import { useEffect, useState } from "react";
import axios from "axios";

type Rates = Record<string, number>;

export function useCurrency(base = "INR") {
  const [rates, setRates] = useState<Rates | null>(null);
  const [currency, setCurrency] = useState<string>(base);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    axios
      .get(`https://open.er-api.com/v6/latest/${base}`)
      .then((r) => {
        if (!cancelled) setRates(r.data?.rates ?? null);
      })
      .catch(() => !cancelled && setError("Failed to load rates"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [base]);

  const convert = (amount: number) => {
    if (!rates || currency === base) return amount;
    const r = rates[currency];
    return r ? amount * r : amount;
  };

  const symbol = (() => {
    try {
      return (0)
        .toLocaleString("en", { style: "currency", currency, maximumFractionDigits: 0 })
        .replace(/\d|\s|\.|,/g, "");
    } catch {
      return currency;
    }
  })();

  return { rates, currency, setCurrency, convert, loading, error, symbol };
}
