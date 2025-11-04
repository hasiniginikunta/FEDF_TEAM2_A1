import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { categoryAPI, transactionAPI } from "../api/api";
import categoryData from "../Entities/Category.json";

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  // --- SOURCE OF TRUTH STATE ---
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(12000);
  const [user, setUser] = useState(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  });
  const [loading, setLoading] = useState(false);

  // --- FETCH DATA FROM API ---
  const fetchCategories = async () => {
    try {
      const data = await categoryAPI.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Fallback to default categories
      setCategories(categoryData.map(cat => ({
        id: cat.id.toString(),
        name: cat.name,
        budget: 0,
        color: cat.color || "gradient-pink-purple",
        type: cat.type
      })));
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await transactionAPI.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    }
  };

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchTransactions();
    }
  }, [user]);

  // --- DERIVED STATE ---
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const spent = transactions
        .filter(tx => tx.category_id === cat.id && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const percentUsed = Math.min((spent / (cat.budget || 1)) * 100, 100);
      
      return { ...cat, spent, percentUsed };
    });
  }, [transactions, categories]);

  const totalSpent = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const remaining = useMemo(() => {
    return monthlyBudget - totalSpent;
  }, [monthlyBudget, totalSpent]);

  // API CRUD Functions
  const addCategory = async (categoryData) => {
    try {
      setLoading(true);
      const newCategory = await categoryAPI.addCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (error) {
      console.error('Failed to add category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true);
      const updatedCategory = await categoryAPI.updateCategory(id, categoryData);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      await categoryAPI.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData) => {
    try {
      setLoading(true);
      const newTransaction = await transactionAPI.addTransaction(transactionData);
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      setLoading(true);
      const updatedTransaction = await transactionAPI.updateTransaction(id, transactionData);
      setTransactions(prev => prev.map(tx => tx.id === id ? updatedTransaction : tx));
      return updatedTransaction;
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setLoading(true);
      await transactionAPI.deleteTransaction(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const reloadData = () => {
    if (user) {
      fetchCategories();
      fetchTransactions();
    }
  };

  const recomputeCategoryStats = () => {
    // This will trigger a re-render and recalculation of enrichedCategories
  };

  // --- CONTEXT VALUE ---
  const value = useMemo(() => ({
    transactions,
    setTransactions,
    categories,
    setCategories,
    enrichedCategories,
    monthlyBudget,
    setMonthlyBudget,
    totalBudget: monthlyBudget,
    totalSpent,
    remaining,
    user,
    setUser,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    recomputeCategoryStats,
    reloadData,
  }), [transactions, categories, enrichedCategories, monthlyBudget, totalSpent, remaining, user, loading]);
  
  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);