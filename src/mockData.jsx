// src/mockData.js
import { getStorage, setStorage, generateId } from "../src/utils";
import categoriesJson from "../src/Entities/Category.json";

export const loadCategories = () => {
  let categories = getStorage("categories");
  if (!categories || categories.length === 0) {
    categories = categoriesJson;
    setStorage("categories", categories);
  }
  return categories;
};

export const loadTransactions = () => getStorage("transactions");

export const addTransaction = (transaction) => {
  const transactions = getStorage("transactions");
  const newTransaction = { ...transaction, id: generateId() };
  const updated = [newTransaction, ...transactions];
  setStorage("transactions", updated);
  return updated;
};

export const updateTransaction = (id, transaction) => {
  let transactions = getStorage("transactions");
  transactions = transactions.map((t) => (t.id === id ? { ...t, ...transaction } : t));
  setStorage("transactions", transactions);
  return transactions;
};

export const deleteTransaction = (id) => {
  let transactions = getStorage("transactions");
  transactions = transactions.filter((t) => t.id !== id);
  setStorage("transactions", transactions);
  return transactions;
};
