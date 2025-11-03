import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  RefreshCw,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function RecentTransactions({ transactions, categories, onRefresh }) {
  const getCategoryById = (categoryId) => {
    return categories.find(cat => cat.id === categoryId);
  };

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 bg-gradient-to-r from-indigo-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Calendar className="w-8 h-8 text-indigo-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No transactions yet
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Start tracking your finances by adding your first income or expense
      </p>
      <Link to={createPageUrl("Transactions")}>
        <Button className="bg-gradient-to-r from-indigo-500 to-emerald-500 hover:shadow-lg transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </Link>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">
            Recent Transactions
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              className="hover:bg-gray-50 rounded-lg"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Link to={createPageUrl("Transactions")}>
              <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-emerald-500">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {transactions.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, index) => {
                  const category = getCategoryById(transaction.category_id);
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 rounded-xl bg-white/80 hover:bg-white transition-all duration-300 hover:shadow-md"
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
                      <div className="text-right flex items-center gap-3">
                        {category && (
                          <Badge 
                            variant="outline"
                            style={{ 
                              backgroundColor: `${category.color}10`,
                              borderColor: category.color,
                              color: category.color
                            }}
                          >
                            {category.name}
                          </Badge>
                        )}
                        <span className={`font-bold text-lg ${
                          transaction.type === 'income' ? 
                          'text-emerald-600' : 
                          'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}
                          ${transaction.amount.toFixed(2)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}