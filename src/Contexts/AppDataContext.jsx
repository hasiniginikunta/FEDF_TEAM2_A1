import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  // --- SOURCE OF TRUTH STATE ---
  const [transactions, setTransactions] = useState(() => {
    // Try multiple localStorage keys to find your existing transactions
    const appData = JSON.parse(localStorage.getItem("appData")) || {};
    const hisabkitabTransactions = JSON.parse(localStorage.getItem("hisabkitab_transactions"));
    
    return appData.transactions || hisabkitabTransactions || [];
  });
  
  const [categories, setCategories] = useState(() => {
    // Debug: Check all localStorage keys
    console.log('All localStorage keys:', Object.keys(localStorage));
    console.log('appData:', localStorage.getItem('appData'));
    console.log('hisabkitab_categories:', localStorage.getItem('hisabkitab_categories'));
    
    // Try multiple localStorage keys to find your existing categories
    const appData = JSON.parse(localStorage.getItem("appData")) || {};
    const hisabkitabCategories = JSON.parse(localStorage.getItem("hisabkitab_categories"));
    
    console.log('Found categories:', appData.categories || hisabkitabCategories);
    
    return appData.categories || hisabkitabCategories || [
      { id: "1", name: "Food", budget: 200, color: "gradient-pink-purple" },
      { id: "2", name: "Transport", budget: 200, color: "gradient-purple-blue" },
      { id: "3", name: "Shopping", budget: 200, color: "gradient-pink-blue" },
      { id: "4", name: "Entertainment", budget: 200, color: "gradient-pink-purple" },
      { id: "5", name: "Savings", budget: 200, color: "gradient-purple-blue" },
    ];
  });
  
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return appData.monthlyBudget || user.budget_limit || parseFloat(localStorage.getItem("monthlyBudget")) || 12000;
  });

  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("hisabkitab_user")) || null;
  });

  // --- PERSISTENCE EFFECTS ---
  // These are fine, they save the source of truth to localStorage
  useEffect(() => {
    localStorage.setItem("hisabkitab_categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("hisabkitab_transactions", JSON.stringify(transactions));
  }, [transactions]);
  
  useEffect(() => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};
    localStorage.setItem("appData", JSON.stringify({
      ...appData,
      monthlyBudget: monthlyBudget,
      categories: categories,
      transactions: transactions
    }));
    localStorage.setItem("monthlyBudget", monthlyBudget.toString());
  }, [monthlyBudget, categories, transactions]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("hisabkitab_user", JSON.stringify(user));
    }
  }, [user]);

  // Listen for localStorage changes to sync budget updates from Settings
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'appData' || e.key === 'user') {
        reloadData();
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Also check for changes periodically (for same-tab updates)
    const interval = setInterval(() => {
      const appData = JSON.parse(localStorage.getItem("appData")) || {};
      const user = JSON.parse(localStorage.getItem("user")) || {};
      const newBudget = appData.monthlyBudget || user.budget_limit;
      
      if (newBudget !== undefined && newBudget !== monthlyBudget) {
        setMonthlyBudget(newBudget);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [monthlyBudget]);

  // --- DERIVED STATE ---
  // ✅ This is the correct way. Calculate the enriched categories using useMemo.
  // This value is recalculated ONLY when transactions or categories change.
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const spent = transactions
        .filter(tx => tx.category_id === cat.id && tx.type === 'expense') // Assuming 'expense' type
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const percentUsed = Math.min((spent / (cat.budget || 1)) * 100, 100);
      
      return { ...cat, spent, percentUsed };
    });
  }, [transactions, categories]); // Dependencies

  // --- DASHBOARD COMPUTED VALUES ---
  // Remove the old totalBudget calculation since we're using monthlyBudget directly

  const totalSpent = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const remaining = useMemo(() => {
    return monthlyBudget - totalSpent;
  }, [monthlyBudget, totalSpent]);

  // Function to reload data from localStorage (used when settings change)
  const reloadData = () => {
    const appData = JSON.parse(localStorage.getItem("appData")) || {};
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const newBudget = appData.monthlyBudget || user.budget_limit;
    if (newBudget !== undefined) {
      setMonthlyBudget(newBudget);
    }
  };

  // Function to recompute category stats (used in signup)
  const recomputeCategoryStats = () => {
    // This will trigger a re-render and recalculation of enrichedCategories
    // The useMemo dependencies will handle the recalculation automatically
  };

  // --- CONTEXT VALUE ---
  // Memoize the context value itself for performance
  const value = useMemo(() => ({
    transactions,
    setTransactions,
    categories, // The raw categories for forms, etc.
    setCategories,
    enrichedCategories, // The calculated categories for display
    monthlyBudget,
    setMonthlyBudget,
    totalBudget: monthlyBudget, // Use monthlyBudget as totalBudget
    totalSpent,
    remaining,
    user,
    setUser,
    recomputeCategoryStats,
    reloadData,
  }), [transactions, categories, enrichedCategories, monthlyBudget, totalSpent, remaining, user]);
  
  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);