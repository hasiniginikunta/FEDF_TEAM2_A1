// src/utils.js

export function createPageUrl(page) {
  return `/${page.toLowerCase()}`;
}

// LocalStorage helpers
export const getStorage = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// utils.js
export function updateStreak(expenses) {
  if (!expenses || expenses.length === 0) return 0;

  // Extract and normalize dates (assuming each expense has a date property)
  const dates = expenses
    .map((exp) => new Date(exp.date).toDateString()) // normalize to just day
    .sort((a, b) => new Date(b) - new Date(a)); // sort descending

  let streak = 1;
  let currentDate = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const nextDate = new Date(dates[i]);

    // difference in days
    const diff = Math.floor(
      (currentDate - nextDate) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      // consecutive day → streak continues
      streak++;
      currentDate = nextDate;
    } else if (diff > 1) {
      // break in streak
      break;
    }
    // if diff === 0 → same day entry, ignore
  }

  return streak;
}

export function applyTransactionToBudget(transaction, user) {
  if (!user?.budget?.allocation) return user;

  const updatedAllocations = user.budget.allocation.map((alloc) => {
    if (
      alloc.category === transaction.category &&
      transaction.type === "expense"
    ) {
      return {
        ...alloc,
        amount: alloc.amount - transaction.amount, // reduce budget
      };
    }
    return alloc;
  });

  return {
    ...user,
    budget: {
      ...user.budget,
      allocation: updatedAllocations,
    },
  };
}

export const setStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Generate unique ID for new items
export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);
