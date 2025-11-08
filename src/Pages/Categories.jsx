import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../Components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  Coffee,
  ShoppingBag,
  Car,
  Home,
  Film,
  Utensils,
  Tag,
  Briefcase,
  DollarSign,
  TrendingUp,
  MapPin,
  Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../Components/ui/card";
import { Input } from "../Components/ui/input";
import { Label } from "../Components/ui/label";
import { Badge } from "../Components/ui/badge";
import { useAppData } from "../Contexts/AppDataContext";
import { useAuth } from "../Contexts/AuthContext";
import { useToast } from "../hooks/use-toast";
import { Skeleton } from "../Components/ui/skeleton";


// Function to pick category icon
export const getCategoryIcon = (cat) => {
  const name = cat.name?.toLowerCase() || "";
  if (name.includes("food") || name.includes("grocery")) return <Utensils className="w-6 h-6" />;
  if (name.includes("shop")) return <ShoppingBag className="w-6 h-6" />;
  if (name.includes("transport") || name.includes("travel")) return <Car className="w-6 h-6" />;
  if (name.includes("rent") || name.includes("home")) return <Home className="w-6 h-6" />;
  if (name.includes("entertain")) return <Film className="w-6 h-6" />;
  if (name.includes("coffee") || name.includes("drink")) return <Coffee className="w-6 h-6" />;
  if (name.includes("freelance") || name.includes("work")) return <Briefcase className="w-6 h-6" />;
  if (name.includes("salary") || name.includes("income")) return <DollarSign className="w-6 h-6" />;
  if (name.includes("health") || name.includes("fitness")) return <Heart className="w-6 h-6" />;
  if (name.includes("travel") || name.includes("location")) return <MapPin className="w-6 h-6" />;
  return <Tag className="w-6 h-6" />;
};

export default function Categories() {
  const { categories, transactions, totalBudget, totalSpent, remaining, loading, createCategory, updateCategory, deleteCategory, reloadData } = useAppData();
  const { toast } = useToast();

  // Force reload data when Categories page loads
  React.useEffect(() => {
    reloadData();
  }, []);

  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", budget: "", color: "gradient-pink-purple" });

  const gradients = [
    "gradient-pink-purple",
    "gradient-purple-blue",
    "gradient-pink-blue",
  ];

  const enrichedCategories = useMemo(() => {
    return categories.map(cat => {
      const categoryTransactions = transactions.filter(tx => 
        String(tx.category_id) === String(cat.id) && tx.type === 'expense'
      );
      
      const spent = categoryTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
      const percentUsed = cat.budget > 0 ? Math.min((spent / cat.budget) * 100, 100) : 0;
      const isOverBudget = spent > (cat.budget || 0);
      
      return { ...cat, spent, percentUsed, isOverBudget };
    });
  }, [categories, transactions]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.budget) return;
    const budgetValue = parseFloat(formData.budget);

    try {
      const categoryData = {
        name: formData.name,
        type: "expense" // Most categories are expense type
      };
      
      console.log('Sending category data:', categoryData);
      console.log('JWT Token:', localStorage.getItem('token'));
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }

      setFormData({ name: "", budget: "", color: "gradient-pink-purple" });
      setEditingCategory(null);
      setShowForm(false);
      toast({
        title: "Success",
        description: `Category ${editingCategory ? 'updated' : 'created'} successfully`,
      });
    } catch (error) {
      console.error('Failed to save category:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast({
        title: "Error",
        description: error.response?.data?.message || `Failed to ${editingCategory ? 'update' : 'create'} category`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, budget: (cat.budget || 0).toString(), color: cat.color || "gradient-pink-purple" });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-6 text-gray-800">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center">
          <h1 className="header-title header-gradient">
            Categories
          </h1>
          <div className="flex gap-2">
            <Button onClick={reloadData} className="btn-add-category gradient-purple-blue" disabled={loading}>
              {loading ? 'Loading...' : 'Reload'}
            </Button>
            <Button onClick={() => setShowForm(true)} className="btn-add-category gradient-pink-purple" disabled={loading}>
              <Plus size={18} className="mr-2" />
              Add Category
            </Button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Budget", value: totalBudget },
            { label: "Total Spent", value: totalSpent },
            { label: "Remaining", value: remaining }
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.05, rotate: 1 }} transition={{ type: "spring", stiffness: 200 }} className="card-base gradient-pink-purple text-center text-lg font-bold">
              <p>{item.label}</p>
              <p className="text-2xl mt-1">₹{(item.value || 0).toLocaleString()}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="card-base gradient-pink-purple">
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            enrichedCategories.map((cat, index) => (
            <motion.div key={cat.id} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, type: "spring" }} whileHover={{ scale: 1.05 }}
              className={`card-base ${cat.isOverBudget ? "gradient-overbudget" : cat.color}`}
            >
              <CardHeader className="card-header">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-white/60 rounded-full">
                    {getCategoryIcon(cat)}
                  </div>
                  <CardTitle className="text-xl">{cat.name}</CardTitle>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(cat)} className="text-gray-700 hover:text-purple-600"><Edit size={16} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></Button>
                </div>
              </CardHeader>
              <CardContent className="card-content">
                <div className="progress-bg">
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${cat.percentUsed}%` }} transition={{ duration: 0.8 }} />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>{cat.percentUsed.toFixed(1)}% used</span>
                  <Badge className={cat.isOverBudget ? "badge-overbudget" : "badge-normal"}>
                    {cat.isOverBudget ? "Over Budget!" : `₹${((cat.budget || 0) - (cat.spent || 0)).toLocaleString()} left`}
                  </Badge>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Budget: {cat.budget > 0 ? `₹${cat.budget.toLocaleString()}` : 'Not allocated'}</span>
                  <span>Spent: ₹{(cat.spent || 0).toLocaleString()}</span>
                </div>
                {(cat.budget === 0 || !cat.budget) && (
                  <div className="text-xs text-gray-500 mt-1">
                    Click edit to set budget allocation
                  </div>
                )}
              </CardContent>
            </motion.div>
          ))
          )}
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div className="modal-overlay">
              <motion.div className="modal-container">
                <Card className="card-base gradient-form-bg text-gray-800">
                  <CardHeader>
                    <CardTitle>{editingCategory ? "Edit Category" : "Add Category"}</CardTitle>
                    <CardDescription className="text-gray-500">{editingCategory ? "Update category details" : "Create a new category"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input className="bg-white text-gray-800" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Budget</Label>
                        <Input className="bg-white text-gray-800" type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: e.target.value })} required />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {gradients.map(grad => (
                          <button key={grad} type="button" className={`w-10 h-10 rounded-full ${grad} ${formData.color === grad ? "ring-4 ring-purple-400" : ""}`} onClick={() => setFormData({ ...formData, color: grad })}></button>
                        ))}
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" className="btn-cancel" onClick={() => { setShowForm(false); setEditingCategory(null); }}>Cancel</Button>
                        <Button type="submit" className="btn-gradient">{editingCategory ? "Update" : "Add"}</Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
