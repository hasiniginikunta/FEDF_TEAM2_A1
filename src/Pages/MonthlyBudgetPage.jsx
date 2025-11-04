import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import categoryData from "../Entities/Category.json";

export default function MonthlyBudgetPage() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};

  const storedCategories =
    JSON.parse(localStorage.getItem("hisabkitab_categories")) || 
    categoryData.map(cat => ({
      id: cat.id,
      name: cat.name,
      budget: 0,
      color: cat.color,
      type: cat.type
    }));

  const [budget, setBudget] = useState(storedUser.budget_limit || "");
  const [categories, setCategories] = useState(storedCategories);

  // 🔹 Auto allocate evenly
  const autoAllocate = (budgetAmount) => {
    const allocation = categories.map((cat) => ({
      ...cat,
      budget: parseFloat((budgetAmount / categories.length).toFixed(2)),
    }));
    setCategories(allocation);
  };

  const handleBudgetChange = (value) => {
    setBudget(value);
    if (value) autoAllocate(parseFloat(value));
  };

  // 🔹 Manual edit per category
  const handleCategoryChange = (id, value) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, budget: parseFloat(value) || 0 } : cat
      )
    );
  };

 // 🔹 Save in localStorage
const handleSubmit = (e) => {
  e.preventDefault();
  const budgetAmount = parseFloat(budget);

  // Ensure categories have string IDs for consistency
  const categoriesWithStringIds = categories.map(cat => ({
    ...cat,
    id: cat.id.toString()
  }));

  // Get existing appData if any
  const existingData = JSON.parse(localStorage.getItem("appData")) || {};

  // Save updated budget + categories to appData
  localStorage.setItem(
    "appData",
    JSON.stringify({
      ...existingData,
      monthlyBudget: budgetAmount,
      categories: categoriesWithStringIds,
      transactions: existingData.transactions || [],
    })
  );

  // Also save to hisabkitab_categories for AppDataContext
  localStorage.setItem("hisabkitab_categories", JSON.stringify(categoriesWithStringIds));

  // Also update user object if needed
  localStorage.setItem(
    "user",
    JSON.stringify({ ...storedUser, budget_limit: budgetAmount })
  );

  navigate("/confirmation");
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 relative">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-purple-400 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-pink-400 rounded-full blur-3xl opacity-15"></div>

      <Card className="w-full max-w-lg shadow-xl bg-white/70 backdrop-blur-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            Monthly Budget
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Budget Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter your monthly budget (INR)
              </label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => handleBudgetChange(e.target.value)}
                required
              />
            </div>

            {/* Editable Categories */}
            <div className="space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between bg-gray-50/70 dark:bg-gray-800/50 p-2 rounded-md"
                >
                  <span className="font-medium text-gray-700 dark:text-gray-200">{cat.name}</span>
                  <Input
                    type="number"
                    className="w-28 text-right"
                    value={cat.budget}
                    onChange={(e) =>
                      handleCategoryChange(cat.id, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 hover:shadow-lg transition-all duration-300"
            >
              Confirm & Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
