import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { categoryAPI, transactionAPI } from "../api/api";

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load data on mount if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadAllData();
    }
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [categoriesData, transactionsData] = await Promise.all([
        categoryAPI.getAll(),
        transactionAPI.getAll()
      ]);
      
      // Handle response structure - data might be directly in response or nested
      const cats = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
      const txs = Array.isArray(transactionsData) ? transactionsData : (transactionsData.transactions || []);
      
      setCategories(cats);
      setTransactions(txs);
      
      // Calculate monthly budget from categories
      const totalBudget = cats.reduce((sum, cat) => sum + (cat.budget || 0), 0);
      setMonthlyBudget(totalBudget);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Category operations
  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      const response = await categoryAPI.create(categoryData);
      const newCategory = response.category || response;
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id, categoryData) => {
    try {
      setLoading(true);
      const response = await categoryAPI.update(id, categoryData);
      const updatedCategory = response.category || response;
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      return updatedCategory;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id) => {
    try {
      setLoading(true);
      await categoryAPI.delete(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Transaction operations
  const createTransaction = async (transactionData) => {
    try {
      setLoading(true);
      const response = await transactionAPI.create(transactionData);
      const newTransaction = response.transaction || response;
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      setLoading(true);
      const response = await transactionAPI.update(id, transactionData);
      const updatedTransaction = response.transaction || response;
      setTransactions(prev => prev.map(tx => tx.id === id ? updatedTransaction : tx));
      return updatedTransaction;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setLoading(true);
      await transactionAPI.delete(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Computed values
  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const spent = transactions
        .filter(tx => tx.category_id === cat.id && tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const percentUsed = Math.min((spent / (cat.budget || 1)) * 100, 100);
      
      return { ...cat, spent, percentUsed };
    });
  }, [transactions, categories]);

  const totalBudget = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
  }, [categories]);

  const totalSpent = useMemo(() => {
    return transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transactions]);

  const remaining = useMemo(() => {
    return totalBudget - totalSpent;
  }, [totalBudget, totalSpent]);

  const reloadData = () => {
    loadAllData();
  };

  const value = useMemo(() => ({
    transactions,
    categories,
    enrichedCategories,
    monthlyBudget,
    totalBudget,
    totalSpent,
    remaining,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    reloadData,
    setCategories,
    setTransactions,
    setMonthlyBudget,
  }), [
    transactions, 
    categories, 
    enrichedCategories, 
    monthlyBudget, 
    totalBudget, 
    totalSpent, 
    remaining, 
    loading, 
    error
  ]);
  
  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => useContext(AppDataContext);