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
    } else {
      // Clear data if no token
      setTransactions([]);
      setCategories([]);
      setMonthlyBudget(0);
    }
  }, []);

  // Monitor token changes to clear data when switching users
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        clearData();
      } else {
        loadAllData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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
      setCategories(prev => prev.map(cat => (cat.id === id || cat._id === id) ? updatedCategory : cat));
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
      setCategories(prev => prev.filter(cat => cat.id !== id && cat._id !== id));
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
      
      // Validate required fields before sending
      if (!transactionData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!transactionData.amount || transactionData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!transactionData.category) {
        throw new Error('Category is required');
      }
      if (!transactionData.type || !['income', 'expense'].includes(transactionData.type)) {
        throw new Error('Type must be income or expense');
      }
      if (!transactionData.date) {
        throw new Error('Date is required');
      }
      
      const response = await transactionAPI.create(transactionData);
      const newTransaction = response.transaction || response;
      setTransactions(prev => [...prev, newTransaction]);
      return newTransaction;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTransaction = async (id, transactionData) => {
    try {
      setLoading(true);
      
      // Validate required fields before sending
      if (!transactionData.title?.trim()) {
        throw new Error('Title is required');
      }
      if (!transactionData.amount || transactionData.amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      if (!transactionData.category) {
        throw new Error('Category is required');
      }
      if (!transactionData.type || !['income', 'expense'].includes(transactionData.type)) {
        throw new Error('Type must be income or expense');
      }
      if (!transactionData.date) {
        throw new Error('Date is required');
      }
      
      console.log('Updating transaction with data:', transactionData);
      const response = await transactionAPI.update(id, transactionData);
      const updatedTransaction = response.transaction || response;
      setTransactions(prev => prev.map(tx => (tx.id === id || tx._id === id) ? updatedTransaction : tx));
      return updatedTransaction;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update transaction');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id) => {
    try {
      setLoading(true);
      await transactionAPI.delete(id);
      setTransactions(prev => prev.filter(tx => tx.id !== id && tx._id !== id));
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
      // Calculate spent amount for this category
      const categoryTransactions = transactions.filter(tx => {
        // Handle both populated category object and category_id
        const txCategoryId = tx.category?._id || tx.category?.id || tx.category_id || tx.category;
        const catId = cat._id || cat.id;
        return String(txCategoryId) === String(catId) && tx.type === 'expense';
      });
      
      const spent = categoryTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const budget = cat.budget || 0;
      const percentUsed = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
      const isOverBudget = spent > budget && budget > 0;
      
      return { 
        ...cat, 
        spent, 
        percentUsed, 
        isOverBudget,
        remaining: Math.max(budget - spent, 0)
      };
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

  const clearData = () => {
    setTransactions([]);
    setCategories([]);
    setMonthlyBudget(0);
    setError(null);
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
    clearData,
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