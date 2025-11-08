import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { X, Save, ArrowUpRight, ArrowDownRight } from "lucide-react";
// import { useAppData } from "../Contexts/AppDataContext";

export default function TransactionForm({ transaction, categories, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    amount: transaction?.amount || "",
    description: transaction?.title || transaction?.description || "",
    category_id: String(transaction?.category_id || transaction?.category || ""),
    type: transaction?.type || "expense",
    date: transaction?.date || new Date().toISOString().split("T")[0],
    notes: transaction?.notes || ""
  });

  // DEBUG: Track form state changes
  useEffect(() => {
    console.log('🔍 Form state updated:', formData);
  }, [formData]);

  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    if (categories.length > 0) {
      let filtered = categories.filter((cat) => cat.type === formData.type || !cat.type);

      // Include current category even if type mismatch
      if (formData.category_id && !filtered.find((c) => String(c.id || c._id) === String(formData.category_id))) {
        const currentCat = categories.find((c) => String(c.id || c._id) === String(formData.category_id));
        if (currentCat) filtered.push(currentCat);
      }

      setFilteredCategories(filtered);
    }
  }, [formData.type, categories, formData.category_id]);

  const handleChange = (field, value) => {
    console.log(`🔍 Field ${field} changed to:`, value);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

const handleSubmit = (e) => {
  e.preventDefault();
  
  // DEBUG: Log form data before validation
  console.log('🔍 TransactionForm - Raw form data:', formData);
  console.log('🔍 TransactionForm - Available categories:', categories);
  
  // Validate required fields
  if (!formData.description?.trim()) {
    alert('Title is required');
    return;
  }
  
  const amount = parseFloat(formData.amount);
  if (!amount || amount <= 0) {
    alert('Amount must be greater than 0');
    return;
  }
  
  if (!formData.category_id) {
    alert('Category is required - please select a category');
    console.error('❌ Category ID missing:', formData.category_id);
    return;
  }
  
  if (!formData.type || !['income', 'expense'].includes(formData.type)) {
    alert('Type must be income or expense');
    return;
  }
  
  if (!formData.date) {
    alert('Date is required');
    return;
  }

  // Prepare data for submission
  const submissionData = {
    title: formData.description.trim(),
    amount: amount,
    category: formData.category_id, // Send category ID, not name
    type: formData.type,
    date: formData.date,
    notes: formData.notes || ""
  };
  
  // DEBUG: Log final submission data
  console.log('✅ TransactionForm - Submitting data:', submissionData);
  
  // Send data in backend expected format
  onSubmit(submissionData);
};


  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {formData.type === "income" ? (
              <ArrowDownRight className="w-5 h-5 text-emerald-600" />
            ) : (
              <ArrowUpRight className="w-5 h-5 text-red-600" />
            )}
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => {
                    handleChange("type", value);
                    handleChange("category_id", "");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={String(formData.category_id || "")}
                onValueChange={(value) => {
                  console.log('🔍 Category selected:', value);
                  handleChange("category_id", value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length === 0 && (
                    <SelectItem value="no-categories" disabled>
                      No categories available
                    </SelectItem>
                  )}
                  {filteredCategories.map((cat) => {
                    const categoryId = String(cat.id || cat._id);
                    console.log('🔍 Rendering category:', cat.name, 'ID:', categoryId);
                    return (
                      <SelectItem key={categoryId} value={categoryId}>
                        {cat.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                className={`${
                  formData.type === "income"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Transaction
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
