// hooks/useMonthlyBudget.jsx
import { useLocalStorage } from "./useLocalStorage";

export function useMonthlyBudget() {
  const [budget, setBudget] = useLocalStorage("monthlyBudget", null);

  // Initialize first-time budget allocation
  const initializeBudget = (totalBudget, categories) => {
    const allocation = {};
    const perCategory = Math.floor(totalBudget / categories.length);
    categories.forEach((cat) => {
      allocation[cat.name] = perCategory; // auto-allocate based on entered budget
    });

    setBudget({
      month: new Date().toISOString().slice(0, 7), // YYYY-MM
      total: totalBudget,
      allocation,
    });
  };

  // Update budget based on previous month spendings (simple proportional)
  const updateBudget = (lastMonthSpendings) => {
    if (!budget) return;

    const totalLastMonth = Object.values(lastMonthSpendings).reduce((a, b) => a + b, 0);
    const allocation = {};
    Object.entries(lastMonthSpendings).forEach(([cat, spent]) => {
      allocation[cat] = Math.round((spent / totalLastMonth) * budget.total);
    });

    setBudget({
      month: new Date().toISOString().slice(0, 7),
      total: budget.total,
      allocation,
    });
  };

  return { budget, initializeBudget, updateBudget };
}
