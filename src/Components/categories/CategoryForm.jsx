import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Save, Palette } from "lucide-react";

const PREDEFINED_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b"
];

const PREDEFINED_ICONS = [
  "coffee", "truck", "shopping-cart", "music", "heart",
  "dollar-sign", "briefcase", "trending-up", "map-pin", "tag"
];

export default function CategoryForm({ category, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: category?.name || "",
    color: category?.color || "#6366f1",
    icon: category?.icon || "tag",
    type: category?.type || "expense"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            <Palette className="w-5 h-5 text-indigo-600" />
            {category ? 'Edit Category' : 'Add Category'}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                placeholder="Category name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
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
              <Label>Color</Label>
              <div className="mt-2">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {PREDEFINED_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-10 h-10 rounded-lg border-2 transition-all ${
                        formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleChange('color', color)}
                    />
                  ))}
                </div>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="h-12 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {PREDEFINED_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    className={`p-2 rounded-lg border-2 transition-all ${
                      formData.icon === icon ? 'border-gray-400 scale-110' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleChange('icon', icon)}
                  >
                    <span className="capitalize text-sm">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-emerald-500">
                <Save className="w-4 h-4 mr-2" />
                Save Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
