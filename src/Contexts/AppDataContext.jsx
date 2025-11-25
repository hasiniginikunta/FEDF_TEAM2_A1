import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { categoryAPI, transactionAPI } from "../api/api";

const AppDataContext = createContext();

export const AppDataProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track current user and clear data when user changes
  const [currentUserId, setCurrentUserId] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const userId = user?._id || user?.id;
    
    if (token && userId) {
      // If user changed, clear old data first
      if (currentUserId && currentUserId !== userId) {
        console.log('User changed, clearing old data');
        clearData();
      }
      setCurrentUserId(userId);
      loadAllData();
    } else {
      // No auth, clear everything
      setCurrentUserId(null);
      clearData();
    }
  }, [currentUserId]);

  // Monitor localStorage changes for user switching
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const userId = user?._id || user?.id;
      
      if (!token || !userId) {
        setCurrentUserId(null);
        clearData();
      } else if (userId !== currentUserId) {
        console.log('Storage change detected, user switched');
        setCurrentUserId(userId);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUserId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading all data...');
      
      const [categoriesData, transactionsData] = await Promise.all([
        categoryAPI.getAll(),
        transactionAPI.getAll()
      ]);
      
      console.log('📥 Raw categories response:', categoriesData);
      console.log('📥 Raw transactions response:', transactionsData);
      
      // Handle response structure - data might be directly in response or nested
      let cats = Array.isArray(categoriesData) ? categoriesData : (categoriesData.categories || []);
      const txs = Array.isArray(transactionsData) ? transactionsData : (transactionsData.transactions || []);
      
      console.log('📊 Processed categories:', cats);
      console.log('📊 Processed transactions:', txs);
      
      // Calculate monthly budget from API categories
      const totalBudget = cats.reduce((sum, cat) => sum + (cat.budget || 0), 0);
      console.log('💰 Total budget calculated:', totalBudget);
      
      setMonthlyBudget(totalBudget);
      setCategories(cats);
      setTransactions(txs);
      
      console.log('✅ Data loaded successfully');
    } catch (err) {
      console.error('❌ Failed to load data:', err);
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Category operations
  const createCategory = async (categoryData) => {
    try {
      setLoading(true);
      
      // DEBUG: Log what we're sending to API
      console.log('📤 AppDataContext - Creating category with data:', categoryData);
      console.log('🔍 Required fields check:');
      console.log('  - name:', categoryData.name, '(required)');
      console.log('  - type:', categoryData.type, '(required)');
      console.log('  - budget: REMOVED (backend does not support this field)');
      
      // Validate required fields
      if (!categoryData.name?.trim()) {
        throw new Error('Category name is required');
      }
      if (!categoryData.type || !['income', 'expense'].includes(categoryData.type)) {
        throw new Error('Type must be income or expense');
      }
      
      const response = await categoryAPI.create(categoryData);
      console.log('✅ Category API response:', response);
      
      const newCategory = response.category || response;
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('❌ Category creation failed:', err);
      console.error('📋 Error response data:', err.response?.data);
      console.error('📋 Error response status:', err.response?.status);
      
      // Handle "already exists" error
      const errorMessage = err.response?.data?.message || err.message || 'Failed to create category';
      
      if (errorMessage.toLowerCase().includes('already exists') || errorMessage.toLowerCase().includes('duplicate')) {
        console.log(`✅ Category "${categoryData.name}" already exists, skipping...`);
        // Don't throw error for existing categories, just log it
        setError(null);
        return { success: true, skipped: true, message: `Category "${categoryData.name}" already exists` };
      }
      
      setError(errorMessage);
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