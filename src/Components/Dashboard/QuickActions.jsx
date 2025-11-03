import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, Minus, PieChart, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function QuickActions() {
  const actions = [
    {
      title: "Add Income",
      icon: Plus,
      color: "emerald",
      bgGradient: "from-emerald-500 to-emerald-600",
      link: createPageUrl("Transactions") + "?type=income"
    },
    {
      title: "Add Expense",
      icon: Minus,
      color: "red",
      bgGradient: "from-red-500 to-red-600",
      link: createPageUrl("Transactions") + "?type=expense"
    },
    {
      title: "View Reports",
      icon: PieChart,
      color: "indigo",
      bgGradient: "from-indigo-500 to-indigo-600",
      link: createPageUrl("Reports")
    },
    {
      title: "Manage Categories",
      icon: Settings,
      color: "purple",
      bgGradient: "from-purple-500 to-purple-600",
      link: createPageUrl("Categories")
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
        <CardContent className="p-6 ">
          <p className="text-gray-900 dark:text-white">Quick Actions</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={action.link}>
                  <Button
                    className={`w-full h-auto p-4 bg-gradient-to-r ${action.bgGradient} hover:shadow-lg transition-all duration-300 rounded-xl`}
                  >
                    <div className="flex flex-col items-center gap-2 text-white">
                      <action.icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{action.title}</span>
                    </div>
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}