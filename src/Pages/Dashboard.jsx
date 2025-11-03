import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart3, Award, Plus, X, Trash2 } from "lucide-react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "../Contexts/AuthContext";
import { useAppData } from "../Contexts/AppDataContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";


export default function Dashboard() {
  const { user } = useAuth();
  const { transactions, enrichedCategories, monthlyBudget, totalBudget, totalSpent } = useAppData();
  const [goals, setGoals] = useLocalStorage("hisabkitab_goals", []);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTarget, setNewGoalTarget] = useState("");

  const colors = ["#FBB6CE","#C084FC","#93C5FD","#A5F3FC","#FDE68A","#FBCFE8"];



  const enrichedGoals = goals.map(goal => {
    const saved = transactions
      .filter(tx => tx.type === "expense" && tx.category_id === goal.id)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { ...goal, saved };
  });

  const calculateStreak = useCallback(() => {
    if (transactions.length === 0) return 0;
    const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    let current = new Date();
    for (const tx of sorted) {
      const txDate = new Date(tx.date);
      if (
        txDate.getFullYear() === current.getFullYear() &&
        txDate.getMonth() === current.getMonth() &&
        txDate.getDate() === current.getDate() - streak
      ) streak++;
      else if (txDate < current) break;
    }
    return streak;
  }, [transactions]);

  const streak = calculateStreak();
  const formatCurrency = (amt) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(amt);

  const categoryData = enrichedCategories
    .map((cat) => ({ name: cat.name, value: cat.spent || 0 }))
    .filter(cat => cat.value > 0);

  const budgetProgress = Math.min((totalSpent / totalBudget) * 100, 100);

  const openGoalModal = () => {
    setNewGoalName("");
    setNewGoalTarget("");
    setShowGoalModal(true);
  };

  const saveGoal = () => {
    if (!newGoalName || !newGoalTarget) return;
    setGoals([...goals, { id: Date.now(), name: newGoalName, target: parseFloat(newGoalTarget), saved: 0 }]);
    setShowGoalModal(false);
  };

  const deleteGoal = (goalId) => setGoals(goals.filter(goal => goal.id !== goalId));

  return (
    <div className="dashboard-container">

      {/* Decorative blobs */}
      <motion.div className="decorative-blob-purple"/>
      <motion.div className="decorative-blob-pink"/>

      {/* Header */}
      <motion.div className="dashboard-header">
        <div>
          <h1 className="header-title">Welcome back, {user.name}! 🎉</h1>
          <p className="header-subtitle">Track, save, and achieve your student goals 🚀</p>
        </div>
      </motion.div>

      {/* Top Stats */}
      <motion.div className="top-stats-grid">
        <Card className="card-base">
          <CardHeader className="card-header">
            <BarChart3 className="icon-red"/>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            <p className="stat-red">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardHeader className="card-header">
            <Calendar className="icon-green"/>
            <CardTitle>Total Budget</CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            <div className="progress-bg">
              <motion.div initial={{ width: 0 }} animate={{ width: `${budgetProgress}%` }} transition={{ duration: 1 }} className="progress-fill progress-green"/>
            </div>
            <p className="progress-text">
              Spent {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-base">
          <CardHeader className="card-header">
            <Award className="icon-yellow"/>
            <CardTitle>Streak</CardTitle>
          </CardHeader>
          <CardContent className="card-content">
            <p className="stat-yellow">{streak} days 🔥</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transactions */}
      <div className="section-space">
        <h2 className="text-xl font-semibold text-foreground">Recent Transactions 💳</h2>
        <div className="section-list">
          {transactions.length > 0 ? (
            transactions.sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5).map(tx => (
              <Card key={tx.id} className="card-base card-transaction">
                <div>
                  <p className="font-medium text-foreground">{tx.description}</p>
                  <p className="text-sm text-muted-foreground">{tx.date}</p>
                </div>
                <p className="font-bold text-red-500">{formatCurrency(tx.amount)}</p>
              </Card>
            ))
          ) : (
            <p className="text-muted-foreground">No transactions yet</p>
          )}
        </div>
      </div>

      {/* Goals & Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="section-space">
          <div className="flex justify-between items-center">
            <h2 className="section-title">Goals 🎯</h2>
            <Button onClick={openGoalModal} size="sm" className="btn-gradient flex items-center gap-1">
              <Plus size={16} /> Add Goal
            </Button>
          </div>
          <div className="section-list">
            {enrichedGoals.length > 0 ? enrichedGoals.map(goal => {
              const progress = Math.min((goal.saved / goal.target) * 100, 100);
              return (
                <Card key={goal.id} className="card-base card-goal">
                  <div className="flex justify-between items-center">
                    <CardTitle className="goal-title">{goal.name}</CardTitle>
                    <Button variant="destructive" size="icon" onClick={() => deleteGoal(goal.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <CardContent className="card-content">
                    <div className="progress-bg">
                      <motion.div initial={{width:0}} animate={{width:`${progress}%`}} transition={{duration:1}} className="progress-fill progress-green"/>
                    </div>
                    <p className="progress-text">Saved: {formatCurrency(goal.saved)} / Target: {formatCurrency(goal.target)}</p>
                  </CardContent>
                </Card>
              );
            }) : <p className="text-muted-foreground">No goals set yet.</p>}
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="section-space">
          <h2 className="section-title">Category-wise Spending 📊</h2>
          <Card className="card-base card-chart">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {categoryData.map((entry,index)=>(
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value)=>formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">No expenses to display</p>
            )}
          </Card>
        </div>
      </div>

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button onClick={()=>setShowGoalModal(false)} className="modal-close">
              <X size={20} />
            </button>
            <h2 className="modal-title">Add New Goal</h2>
            <input type="text" placeholder="Goal Name" value={newGoalName} onChange={e=>setNewGoalName(e.target.value)} className="modal-input"/>
            <input type="number" placeholder="Target Amount" value={newGoalTarget} onChange={e=>setNewGoalTarget(e.target.value)} className="modal-input"/>
            <Button onClick={saveGoal} className="btn-add-category">Save Goal</Button>
          </div>
        </div>
      )}
    </div>
  );
}
