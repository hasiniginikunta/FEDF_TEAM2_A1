import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Tag, Folder, Coffee, Truck, ShoppingCart, Music, Heart, DollarSign, Briefcase, TrendingUp, MapPin } from "lucide-react";

// Map icon names to components
const ICONS = {
  coffee: Coffee,
  truck: Truck,
  "shopping-cart": ShoppingCart,
  music: Music,
  heart: Heart,
  "dollar-sign": DollarSign,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "map-pin": MapPin,
  tag: Tag
};

export default function CategoryGrid({ categories, onEdit, onDelete, isLoading }) {
  if (isLoading) return <div>Loading...</div>;

  const EmptyState = () => (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="col-span-full text-center py-16">
      <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Folder className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
      <p className="text-gray-500">Create categories to organize your transactions better</p>
    </motion.div>
  );

  if (categories.length === 0) return <EmptyState />;

  return (
    <div className="space-y-8">
      {categories.map((category, index) => (
        <CategoryCard key={category.id} category={category} index={index} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

function CategoryCard({ category, index, onEdit, onDelete }) {
  const Icon = ICONS[category.icon] || Tag;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Card className="bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 hover:shadow-lg border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              <Badge variant="outline" className={`text-xs ${category.type === "income" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}`}>
                {category.type}
              </Badge>
            </div>
          </div>
          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" onClick={() => onEdit(category)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onDelete(category.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
