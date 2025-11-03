import React from "react";
import { useNavigate } from "react-router-dom"; 
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
export default function ConfirmationPage() {
  const navigate = useNavigate();

  const appData = JSON.parse(localStorage.getItem("appData")) || {};
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const categories = appData.categories || [];

  const handleConfirm = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen p-4 relative flex items-center justify-center gradient-form-bg">
      {/* Decorative blobs */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="absolute top-10 left-10 w-60 h-60 bg-purple-400 rounded-full blur-3xl" />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} className="absolute bottom-10 right-10 w-72 h-72 bg-pink-400 rounded-full blur-3xl" />

      {/* Confirmation Card */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-lg">
        <Card className="card-base gradient-form-bg text-gray-800 dark:text-gray-100">
          <CardHeader className="card-header text-center">
            <CardTitle className="text-2xl font-bold text-center">🎉 Confirmation</CardTitle>
          </CardHeader>

          <CardContent className="card-content space-y-6">
            {/* Personal Details */}
            <div className="space-y-1">
              <h2 className="font-semibold text-lg">Personal Details</h2>
              <p>{user.full_name} ({user.age}, {user.gender})</p>
              <p>Parent Email: {user.parent_email}</p>
              <p>Parent Mobile: {user.parent_mobile}</p>
              <p className="font-medium mt-2 text-indigo-600">
                Total Monthly Budget: ₹{user.budget_limit}
              </p>
            </div>

            <hr className="border-gray-200 dark:border-gray-700" />

            {/* Budget Allocation */}
            <div className="space-y-2">
              <h2 className="font-semibold text-lg">Budget Allocation</h2>
              <div className="space-y-1">
                {categories.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-300">No categories found.</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex justify-between items-center p-2 rounded-md bg-gray-50 dark:bg-gray-700">
                      <span className="text-gray-800 dark:text-gray-200">{cat.name}</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">₹{cat.budget}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Confirm Button */}
            <Button onClick={handleConfirm} className="btn-gradient w-full">
              Confirm & Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
