'use client';

import { useMemo, useState } from "react";

type Expense = {
  id: number;
  description: string;
  category:
    | "Housing"
    | "Food"
    | "Transportation"
    | "Health"
    | "Entertainment"
    | "Utilities"
    | "Other";
  amount: number;
  date: string;
  paymentMethod: "Card" | "Cash" | "Bank Transfer";
  note?: string;
};

const expenses: Expense[] = [
  {
    id: 1,
    description: "Rent",
    category: "Housing",
    amount: 1200,
    date: "2024-02-01",
    paymentMethod: "Bank Transfer",
  },
  {
    id: 2,
    description: "Groceries",
    category: "Food",
    amount: 185.32,
    date: "2024-02-08",
    paymentMethod: "Card",
    note: "Weekly supermarket run",
  },
  {
    id: 3,
    description: "Gym Membership",
    category: "Health",
    amount: 49.99,
    date: "2024-02-03",
    paymentMethod: "Card",
  },
  {
    id: 4,
    description: "Streaming Services",
    category: "Entertainment",
    amount: 29.97,
    date: "2024-02-12",
    paymentMethod: "Card",
  },
  {
    id: 5,
    description: "Electricity Bill",
    category: "Utilities",
    amount: 88.5,
    date: "2024-02-09",
    paymentMethod: "Bank Transfer",
  },
  {
    id: 6,
    description: "Dinner with friends",
    category: "Food",
    amount: 72.44,
    date: "2024-01-26",
    paymentMethod: "Card",
  },
  {
    id: 7,
    description: "Gas",
    category: "Transportation",
    amount: 45.21,
    date: "2024-02-14",
    paymentMethod: "Card",
  },
  {
    id: 8,
    description: "Metro pass",
    category: "Transportation",
    amount: 89,
    date: "2024-01-02",
    paymentMethod: "Card",
  },
  {
    id: 9,
    description: "Doctor visit",
    category: "Health",
    amount: 160,
    date: "2024-01-18",
    paymentMethod: "Card",
  },
  {
    id: 10,
    description: "Coffee beans",
    category: "Food",
    amount: 22.5,
    date: "2024-02-06",
    paymentMethod: "Cash",
  },
  {
    id: 11,
    description: "Water bill",
    category: "Utilities",
    amount: 34.75,
    date: "2024-01-22",
    paymentMethod: "Bank Transfer",
  },
  {
    id: 12,
    description: "Movie night",
    category: "Entertainment",
    amount: 38.25,
    date: "2024-02-10",
    paymentMethod: "Card",
  },
];

const budgetByCategory: Record<Expense["category"], number> = {
  Housing: 1200,
  Food: 400,
  Transportation: 200,
  Health: 150,
  Entertainment: 120,
  Utilities: 150,
  Other: 100,
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const categoryDisplayName: Record<Expense["category"], string> = {
  Housing: "Housing",
  Food: "Food & Dining",
  Transportation: "Transport",
  Health: "Health",
  Entertainment: "Entertainment",
  Utilities: "Utilities",
  Other: "Other",
};

const formatMonthLabel = (month: string) => {
  const [year, monthIndex] = month.split("-").map(Number);
  return new Date(year, (monthIndex ?? 1) - 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
};

export default function ExpenseDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2024-02");
  const [selectedCategory, setSelectedCategory] = useState<
    Expense["category"] | "All"
  >("All");

  const months = useMemo(() => {
    const uniqueMonths = new Set(
      expenses.map((expense) => expense.date.slice(0, 7))
    );
    return Array.from(uniqueMonths).sort().reverse();
  }, []);

  const categories: (Expense["category"] | "All")[] = useMemo(
    () =>
      ["All", ...Object.keys(budgetByCategory)] as (Expense["category"] | "All")[],
    []
  );

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const matchesMonth = expense.date.startsWith(selectedMonth);
      const matchesCategory =
        selectedCategory === "All"
          ? true
          : expense.category === selectedCategory;
      return matchesMonth && matchesCategory;
    });
  }, [selectedMonth, selectedCategory]);

  const monthlyTotal = useMemo(
    () =>
      expenses
        .filter((expense) => expense.date.startsWith(selectedMonth))
        .reduce((sum, expense) => sum + expense.amount, 0),
    [selectedMonth]
  );

  const previousMonth = useMemo(() => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prevMonthDate = new Date(year, month - 2);
    return prevMonthDate.toISOString().slice(0, 7);
  }, [selectedMonth]);

  const previousMonthTotal = useMemo(
    () =>
      expenses
        .filter((expense) => expense.date.startsWith(previousMonth))
        .reduce((sum, expense) => sum + expense.amount, 0),
    [previousMonth]
  );

  const monthOverMonthDiff = monthlyTotal - previousMonthTotal;
  const monthOverMonthPercent =
    previousMonthTotal === 0
      ? null
      : (monthOverMonthDiff / previousMonthTotal) * 100;

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<Expense["category"], number>();
    expenses
      .filter((expense) => expense.date.startsWith(selectedMonth))
      .forEach((expense) => {
        totals.set(
          expense.category,
          (totals.get(expense.category) ?? 0) + expense.amount
        );
      });

    return Object.entries(budgetByCategory).map(([category, budget]) => {
      const actual = totals.get(category as Expense["category"]) ?? 0;
      return {
        category: category as Expense["category"],
        actual,
        budget,
        utilization: Math.min(Math.round((actual / budget) * 100), 999),
      };
    });
  }, [selectedMonth]);

  const paymentMethodSplit = useMemo(() => {
    return filteredExpenses.reduce<
      Record<Expense["paymentMethod"], number>
    >((acc, expense) => {
      acc[expense.paymentMethod] += expense.amount;
      return acc;
    }, {
      Card: 0,
      Cash: 0,
      "Bank Transfer": 0,
    });
  }, [filteredExpenses]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto max-w-6xl px-6 py-12">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Expense Overview
            </h1>
            <p className="mt-2 text-slate-300">
              Track where your money goes and stay aligned with your monthly
              budgets.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex items-center gap-2 rounded-lg bg-slate-900/70 px-4 py-2 text-sm text-slate-200 shadow-inner shadow-slate-900/60 ring-1 ring-slate-800">
              <span className="opacity-80">Month</span>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-36 bg-transparent text-right text-sm font-medium outline-none"
              >
                {months.map((month) => (
                  <option
                    key={month}
                    value={month}
                    className="bg-slate-900 text-white"
                  >
                    {formatMonthLabel(month)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 rounded-lg bg-slate-900/70 px-4 py-2 text-sm text-slate-200 shadow-inner shadow-slate-900/60 ring-1 ring-slate-800">
              <span className="opacity-80">Category</span>
              <select
                value={selectedCategory}
                onChange={(event) =>
                  setSelectedCategory(
                    event.target.value as Expense["category"] | "All"
                  )
                }
                className="w-40 bg-transparent text-right text-sm font-medium outline-none"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                    className="bg-slate-900 text-white"
                  >
                    {category === "All"
                      ? "All categories"
                      : categoryDisplayName[category]}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-gradient-to-br from-blue-500/30 via-blue-500/10 to-slate-900 p-6 shadow-2xl shadow-blue-900/50 ring-1 ring-blue-500/30">
            <p className="text-sm tracking-wide text-blue-200">This month</p>
            <p className="mt-3 text-3xl font-semibold">
              {formatCurrency(monthlyTotal)}
            </p>
            <p className="mt-4 text-sm text-slate-200">
              {monthOverMonthPercent === null ? (
                "No spending last month to compare."
              ) : (
                <>
                  {monthOverMonthDiff >= 0 ? "+" : "-"}
                  {Math.abs(monthOverMonthPercent).toFixed(1)}% vs last month
                </>
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-slate-900 p-6 shadow-2xl shadow-emerald-900/40 ring-1 ring-emerald-500/30">
            <p className="text-sm tracking-wide text-emerald-200">
              Average per day
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {formatCurrency(monthlyTotal / 30)}
            </p>
            <p className="mt-4 text-sm text-slate-200">
              Keep daily spending below {formatCurrency(50)} to hit your goals.
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-slate-900 p-6 shadow-2xl shadow-purple-900/40 ring-1 ring-purple-500/30">
            <p className="text-sm tracking-wide text-purple-200">Payment mix</p>
            <div className="mt-4 space-y-2 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>Card</span>
                <span>{formatCurrency(paymentMethodSplit.Card)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash</span>
                <span>{formatCurrency(paymentMethodSplit.Cash)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bank transfer</span>
                <span>
                  {formatCurrency(paymentMethodSplit["Bank Transfer"])}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/40">
              <header className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">
                  Recent expenses
                </h2>
                <span className="text-sm text-slate-300">
                  {filteredExpenses.length} items ·{" "}
                  {formatCurrency(
                    filteredExpenses.reduce(
                      (sum, expense) => sum + expense.amount,
                      0,
                    ),
                  )}
                </span>
              </header>

              <div className="mt-4 overflow-hidden rounded-xl border border-slate-800">
                <table className="min-w-full divide-y divide-slate-800 text-sm">
                  <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-left">Payment</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                      <th className="px-4 py-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 bg-slate-950/30 text-slate-100">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="transition hover:bg-slate-900/40">
                        <td className="px-4 py-3">
                          <div className="font-medium text-white">
                            {expense.description}
                          </div>
                          {expense.note && (
                            <p className="text-xs text-slate-400">
                              {expense.note}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {categoryDisplayName[expense.category]}
                        </td>
                        <td className="px-4 py-3">{expense.paymentMethod}</td>
                        <td className="px-4 py-3 text-right font-semibold text-white">
                          {formatCurrency(expense.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300">
                          {new Date(expense.date).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredExpenses.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          No expenses found for this selection.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/40">
              <h2 className="text-lg font-semibold text-white">Budget tracker</h2>
              <ul className="mt-4 space-y-4">
                {categoryBreakdown.map((item) => (
                  <li key={item.category}>
                    <div className="flex items-center justify-between text-sm text-slate-300">
                      <span>{categoryDisplayName[item.category]}</span>
                      <span>
                        {formatCurrency(item.actual)} /{" "}
                        {formatCurrency(item.budget)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500"
                        style={{
                          width: `${Math.min(item.utilization, 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.utilization >= 100
                        ? "Budget reached"
                        : `${item.utilization}% used`}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl shadow-black/40">
              <h2 className="text-lg font-semibold text-white">Quick insights</h2>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>Highest expense: Rent at {formatCurrency(1200)}</li>
                <li>Most active category: Food & Dining</li>
                <li>
                  Cash purchases this month:{" "}
                  {formatCurrency(paymentMethodSplit.Cash)}
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
