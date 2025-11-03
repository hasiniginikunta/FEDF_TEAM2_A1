import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export default function DashboardStats({ stats }) {
  const statCards = [
    {
      title: "Total Balance",
      value: stats.balance,
      icon: Wallet,
      color: stats.balance >= 0 ? "emerald" : "red",
      bgGradient: "from-emerald-400 to-emerald-600",
      textColor: "text-white"
    },
    {
      title: "Total Income",
      value: stats.totalIncome,
      icon: ArrowDownRight,
      color: "emerald",
      bgGradient: "from-emerald-50 to-emerald-100",
      textColor: "text-emerald-700"
    },
    {
      title: "Total Expenses",
      value: stats.totalExpenses,
      icon: ArrowUpRight,
      color: "red",
      bgGradient: "from-red-50 to-red-100",
      textColor: "text-red-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4 }}
          className="transform transition-all duration-300"
        >
          <Card className={`bg-gradient-to-br ${stat.bgGradient} border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/20 ${stat.textColor}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.title === "Total Balance" && (
                  <div className="flex items-center gap-1">
                    {stats.balance >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-white/80" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-white/80" />
                    )}
                  </div>
                )}
              </div>
              <div>
                <p className={`text-sm font-medium ${
                  stat.title === "Total Balance" ? "text-white/80" : "text-gray-600"
                }`}>
                  {stat.title}
                </p>
                <p className={`text-3xl font-bold mt-1 ${
                  stat.title === "Total Balance" ? "text-white" : stat.textColor
                }`}>
                  ${Math.abs(stat.value).toFixed(2)}
                </p>
                {stat.title === "Total Balance" && stat.value < 0 && (
                  <p className="text-white/80 text-sm mt-1">Deficit</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}