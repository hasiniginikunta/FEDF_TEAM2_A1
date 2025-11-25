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
  const { categories, transactions, totalBudget, totalSpent, remaining, loading, createCategory, updateCategory, deleteCategory, reloadData, enrichedCategories } = useAppData();
  const { toast } = useToast();

  // Check authentication and force reload data when Categories page loads
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('Categories - Auth check:');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
    console.log('User exists:', !!user);
    
    if (!token || !user) {
      console.log('No auth found, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    reloadData();
  }, []);

  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", type: "expense", budget: "", color: "gradient-pink-purple" });

  const gradients = [
    "gradient-pink-purple",
    "gradient-purple-blue",
    "gradient-pink-blue",
  ];

  // Use enrichedCategories from context instead of recalculating
  const displayCategories = enrichedCategories.length > 0 ? enrichedCategories : categories;



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.type || !['income', 'expense'].includes(formData.type)) {
      toast({
        title: "Error",
        description: "Type must be income or expense",
        variant: "destructive",
      });
      return;
    }

    try {
      const categoryData = {
        name: formData.name.trim(),
        type: formData.type,
        budget: formData.budget ? parseFloat(formData.budget) : 0
      };
      
      console.log('Sending category data:', categoryData);
      console.log('JWT Token:', localStorage.getItem('token'));
      
      if (editingCategory && (editingCategory.id || editingCategory._id)) {
        // Backend doesn't support category updates, show error
        toast({
          title: "Error",
          description: "Category editing is not supported by the backend. Please create a new category instead.",
          variant: "destructive",
        });
        return;
      } else {
        console.log('Creating new category');
        console.log('Create data:', categoryData);
        await createCategory(categoryData);
      }

      setFormData({ name: "", type: "expense", budget: "", color: "gradient-pink-purple" });
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
      
      // Handle backend validation errors
      let errorMessage = `Failed to ${editingCategory ? 'update' : 'create'} category`;
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors[0]?.msg || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({ 
      name: cat.name, 
      type: cat.type || "expense",
      budget: (cat.budget || 0).toString(), 
      color: cat.color || "gradient-pink-purple" 
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    // Check if backend supports deletion
    try {
      const id = categoryId.id || categoryId._id || categoryId;
      console.log('Attempting to delete category with ID:', id);
      await deleteCategory(id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    } catch (error) {
      console.error('Failed to delete category:', error);
      
      // If 404 error, backend doesn't support deletion
      if (error.response?.status === 404) {
        toast({
          title: "Info",
          description: "Category deletion is not supported by the backend.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to delete category",
          variant: "destructive",
        });
      }
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
            displayCategories.map((cat, index) => (
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
                  <Button variant="ghost" size="sm" onClick={() => {
                    toast({
                      title: "Info",
                      description: "Category editing is not supported. Please create a new category instead.",
                      variant: "default",
                    });
                  }} className="text-gray-400 cursor-not-allowed"><Edit size={16} /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(cat)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></Button>
                </div>
              </CardHeader>
              <CardContent className="card-content">
                <div className="progress-bg">
                  <motion.div className="progress-fill" initial={{ width: 0 }} animate={{ width: `${cat.percentUsed}%` }} transition={{ duration: 0.8 }} />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>{cat.percentUsed?.toFixed(1) || 0}% used</span>
                  <Badge className={cat.isOverBudget ? "badge-overbudget" : "badge-normal"}>
                    {cat.isOverBudget ? "Over Budget!" : `₹${(cat.remaining || 0).toLocaleString()} left`}
                  </Badge>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span>Budget: {(cat.budget || 0) > 0 ? `₹${(cat.budget || 0).toLocaleString()}` : 'Not set'}</span>
                  <span>Spent: ₹{(cat.spent || 0).toLocaleString()}</span>
                </div>
                {(!cat.budget || cat.budget === 0) && (
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
                        <Label>Name *</Label>
                        <Input 
                          className="bg-white text-gray-800" 
                          value={formData.name} 
                          onChange={e => setFormData({ ...formData, name: e.target.value })} 
                          placeholder="Enter category name"
                          required 
                        />
                      </div>
                      <div>
                        <Label>Type *</Label>
                        <select 
                          className="w-full p-2 border rounded bg-white text-gray-800"
                          value={formData.type}
                          onChange={e => setFormData({ ...formData, type: e.target.value })}
                          required
                        >
                          <option value="expense">Expense</option>
                          <option value="income">Income</option>
                        </select>
                      </div>
                      <div>
                        <Label>Budget (Optional)</Label>
                        <Input 
                          className="bg-white text-gray-800" 
                          type="number" 
                          value={formData.budget} 
                          onChange={e => setFormData({ ...formData, budget: e.target.value })} 
                          placeholder="Enter budget amount"
                        />
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
