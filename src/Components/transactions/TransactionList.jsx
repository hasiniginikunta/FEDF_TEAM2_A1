import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Edit,
  Trash2,
  Calendar
} from "lucide-react";
import { format } from "date-fns";

export default function TransactionList({ transactions, categories, onEdit, onDelete, isLoading }) {
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId || cat._id === categoryId);
  };

  const getCategoryName = (transaction) => {
    // Handle populated category object from backend
    if (transaction.category && typeof transaction.category === 'object') {
      return transaction.category.name;
    }
    // Handle category_id reference
    const category = getCategoryById(transaction.category_id || transaction.category);
    return category?.name || 'No Category';
  };

  if (isLoading) {
    return (
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/80 rounded-xl animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No transactions found
      </h3>
      <p className="text-gray-500">
        {transactions.length === 0 ? 
          "Start adding your income and expenses to see them here" :
          "Try adjusting your filters to see more results"
        }
      </p>
    </motion.div>
  );

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>All Transactions</span>
          <Badge variant="outline" className="font-normal">
            {transactions.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction, index) => {
                const category = getCategoryById(transaction.category_id);
                return (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-md group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        transaction.type === 'income' ? 
                        'bg-emerald-50 text-emerald-600' : 
                        'bg-red-50 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowDownRight className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant="outline"
                        style={{ 
                          backgroundColor: category?.color ? `${category.color}10` : '#f3f4f6',
                          borderColor: category?.color || '#d1d5db',
                          color: category?.color || '#6b7280'
                        }}
                      >
                        {getCategoryName(transaction)}
                      </Badge>
                      
                      <span className={`font-bold text-lg ${
                        transaction.type === 'income' ? 
                        'text-emerald-600' : 
                        'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        ₹{transaction.amount.toLocaleString()}
                      </span>
                      
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(transaction)}
                          className="hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(transaction.id)}
                          className="hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}