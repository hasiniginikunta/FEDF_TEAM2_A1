import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Button } from "../Components/ui/button";
import { Label } from "../Components/ui/label";
import { useAppData } from "../Contexts/AppDataContext";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Education",
  "Savings",
  "Others"
];

export default function SignupBudgetPage() {
  const navigate = useNavigate();
  const { setUser, setCategories, recomputeCategoryStats } = useAppData();
  const [step, setStep] = useState(1);

  // Step 1 - personal details
  const [personal, setPersonal] = useState({
    fullName: "",
    email: "",
    parentEmail: "",
    parentPhone: ""
  });

  // Step 2 - monthly budget
  const [budget, setBudget] = useState(0);

  // Step 3 - allocation
  const [allocations, setAllocations] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat]: 0 }), {})
  );

  const handlePersonalNext = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleBudgetNext = (e) => {
    e.preventDefault();
    const perCat = budget / categories.length;
    const autoAlloc = categories.reduce(
      (acc, cat) => ({ ...acc, [cat]: perCat }),
      {}
    );
    setAllocations(autoAlloc);
    setStep(3);
  };

  const handleAllocationChange = (cat, value) => {
    setAllocations((prev) => ({ ...prev, [cat]: Number(value) }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();

    const newUser = {
      personalDetails: personal,
      monthlyBudget: budget,
      allocations
    };
    setUser(newUser);

    // Update existing categories with budget allocations
    setCategories(prevCategories => 
      prevCategories.map(cat => {
        const allocation = allocations[cat.name] || 0;
        return {
          ...cat,
          budget: allocation,
          spent: 0,
          remaining: allocation
        };
      })
    );

    recomputeCategoryStats();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 p-6">
      <Card className="w-full max-w-2xl rounded-2xl shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">
            {step === 1 && "Step 1: Personal Details"}
            {step === 2 && "Step 2: Monthly Budget"}
            {step === 3 && "Step 3: Budget Allocation"}
            {step === 4 && "Step 4: Confirm & Finish"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handlePersonalNext} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  required
                  value={personal.fullName}
                  onChange={(e) =>
                    setPersonal({ ...personal, fullName: e.target.value })
                  }
                  className="rounded-xl border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  required
                  type="email"
                  value={personal.email}
                  onChange={(e) =>
                    setPersonal({ ...personal, email: e.target.value })
                  }
                  className="rounded-xl border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200"
                />
              </div>
              <div>
                <Label>Parent's Email</Label>
                <Input
                  required
                  type="email"
                  value={personal.parentEmail}
                  onChange={(e) =>
                    setPersonal({ ...personal, parentEmail: e.target.value })
                  }
                  className="rounded-xl border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200"
                />
              </div>
              <div>
                <Label>Parent's Phone</Label>
                <Input
                  required
                  type="tel"
                  value={personal.parentPhone}
                  onChange={(e) =>
                    setPersonal({ ...personal, parentPhone: e.target.value })
                  }
                  className="rounded-xl border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-md hover:scale-105 transition-transform"
              >
                Next
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleBudgetNext} className="space-y-4">
              <div>
                <Label>Enter Monthly Budget (₹)</Label>
                <Input
                  type="number"
                  required
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="rounded-xl border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-md hover:scale-105 transition-transform"
              >
                Next
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={() => setStep(4)} className="space-y-4">
              <p className="text-gray-600 mb-2">
                Adjust your budget allocation per category or use auto
                allocation.
              </p>
              {categories.map((cat) => (
                <div key={cat} className="flex justify-between items-center">
                  <span className="text-gray-700">{cat}</span>
                  <Input
                    type="number"
                    value={allocations[cat]}
                    min="0"
                    step="0.01"
                    onChange={(e) =>
                      handleAllocationChange(cat, e.target.value)
                    }
                    className="w-32 rounded-xl border-gray-300 focus:border-purple-400 focus:ring focus:ring-purple-200"
                  />
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 text-white shadow-md hover:scale-105 transition-transform"
                >
                  Next
                </Button>
              </div>
            </form>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">
                Confirm your details
              </h3>
              <p><strong>Full Name:</strong> {personal.fullName}</p>
              <p><strong>Email:</strong> {personal.email}</p>
              <p><strong>Parent Email:</strong> {personal.parentEmail}</p>
              <p><strong>Parent Phone:</strong> {personal.parentPhone}</p>
              <p><strong>Monthly Budget:</strong> ₹{budget}</p>
              <div>
                <h4 className="font-semibold mt-2">Category Allocations</h4>
                {categories.map((cat) => (
                  <p key={cat}>
                    {cat}: ₹{allocations[cat].toFixed(2)}
                  </p>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <Button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="rounded-xl bg-green-400 hover:bg-green-500 text-white shadow-md hover:scale-105 transition-transform"
                >
                  Confirm & Finish
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
