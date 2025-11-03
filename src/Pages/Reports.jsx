import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { useAppData } from "../Contexts/AppDataContext";

// Error Boundary Component
class ReportsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Reports page error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="reports-container w-full min-h-[400px] flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-bold mb-4">Reports Temporarily Unavailable</h2>
            <p className="text-gray-600 mb-4">We're having trouble loading the reports. Please try refreshing the page.</p>
            <Button onClick={() => window.location.reload()}>Refresh Page</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function ReportsContent() {
  const appData = useAppData();
  const { transactions = [], categories = [] } = appData || {};
  const [activeTab, setActiveTab] = useState("weekly");

  // Add safety check for context data
  if (!appData) {
    return (
      <div className="reports-container w-full min-h-[400px] flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-4">Loading Reports...</h2>
          <p className="text-gray-600">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  /** ------------------ Weekly Data ------------------ **/
  const weeklyData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      const mock = [
        { week: "W1", amount: 500 },
        { week: "W2", amount: 700 },
        { week: "W3", amount: 650 },
        { week: "W4", amount: 800 }
      ];
      return mock;
    }
    const weeks = {};
    transactions.forEach((tx) => {
      if (tx.type === "expense") {
        const date = new Date(tx.date);
        const weekNum = Math.ceil(date.getDate() / 7);
        const key = `W${weekNum}`;
        weeks[key] = (weeks[key] || 0) + tx.amount;
      }
    });
    return Object.entries(weeks)
      .map(([week, amount]) => ({ week, amount }))
      .sort((a, b) => parseInt(a.week.slice(1)) - parseInt(b.week.slice(1)));
  }, [transactions]);

  /** ------------------ Monthly Data ------------------ **/
  const monthlyData = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [
        { month: "Jan", amount: 2000 },
        { month: "Feb", amount: 1800 },
        { month: "Mar", amount: 2200 },
        { month: "Apr", amount: 2100 }
      ];
    }
    const months = {};
    transactions.forEach((tx) => {
      if (tx.type === "expense") {
        const date = new Date(tx.date);
        const monthKey = date.toLocaleString("default", { month: "short" });
        const monthNum = date.getMonth();
        months[monthKey] = {
          amount: (months[monthKey]?.amount || 0) + tx.amount,
          monthNum
        };
      }
    });
    return Object.entries(months)
      .map(([month, data]) => ({ month, amount: data.amount, monthNum: data.monthNum }))
      .sort((a, b) => a.monthNum - b.monthNum)
      .map(({ month, amount }) => ({ month, amount }));
  }, [transactions]);

  /** ------------------ Category Data ------------------ **/
  const categoryDataForChart = useMemo(() => {
    if (!transactions || transactions.length === 0) {
      return [
        { name: "Food", value: 500 },
        { name: "Transport", value: 300 },
        { name: "Entertainment", value: 200 },
        { name: "Utilities", value: 400 }
      ];
    }
    const data = {};
    transactions.forEach((tx) => {
      const cat = categories.find((c) => String(c.id) === String(tx.category_id))?.name || "Uncategorized";
      data[cat] = (data[cat] || 0) + (tx.type === "expense" ? tx.amount : 0);
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);
  }, [transactions, categories]);

  /** ------------------ Predictions Data ------------------ **/
  const sampleExpenses = (transactions || [])
    .filter((tx) => tx.type === "expense")
    .map((tx) => ({ date: tx.date, actualAmount: tx.amount }));

  function predictExpenses(data, days = 5) {
    if (data.length < 2) return [];
    const diffs = [];
    for (let i = 1; i < data.length; i++) {
      diffs.push(data[i].actualAmount - data[i - 1].actualAmount);
    }
    const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

    const lastDate = new Date(data[data.length - 1].date);
    const predictions = [];
    let lastAmount = data[data.length - 1].actualAmount;

    for (let i = 1; i <= days; i++) {
      const nextDate = new Date(lastDate);
      nextDate.setDate(lastDate.getDate() + i);
      lastAmount += avgDiff;
      predictions.push({
        date: nextDate.toISOString().split("T")[0],
        predictedAmount: Math.round(lastAmount)
      });
    }
    return predictions;
  }

  const predictions = useMemo(() => {
    // Use mock prediction data if no transactions
    if (!transactions || transactions.length < 2) {
      const mockPred = [
        { date: "2025-09-01", actualAmount: 500 },
        { date: "2025-09-02", actualAmount: 600 },
        { date: "2025-09-03", actualAmount: 650 },
        { date: "2025-09-04", predictedAmount: 700 },
        { date: "2025-09-05", predictedAmount: 750 },
        { date: "2025-09-06", predictedAmount: 800 }
      ];
      // Using mock prediction data for demonstration
      return mockPred;
    }
    const preds = predictExpenses(sampleExpenses, 5);
    return [...sampleExpenses, ...preds];
  }, [transactions]);

  /** ------------------ Export Handler ------------------ **/
  const handleExport = (id, name) => {
    try {
      const chartContainer = document.getElementById(id);
      if (!chartContainer) {
        console.warn(`Chart container with id '${id}' not found`);
        return;
      }
      const svg = chartContainer.querySelector('svg');
      if (!svg) {
        console.warn(`SVG element not found in container '${id}'`);
        return;
      }
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svg);
      const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}-chart.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  };

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c"];

  /** ------------------ Render Graph ------------------ **/
  const renderGraph = () => {
    try {
      switch (activeTab) {
      case "weekly":
        return (
          <div id="weeklyChart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Weekly Expense"]} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} name="Weekly Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "monthly":
        return (
          <div id="monthlyChart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, "Monthly Expense"]} />
                <Legend />
                <Bar dataKey="amount" fill="#ef4444" name="Monthly Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case "category":
        return (
          <div id="categoryChart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryDataForChart}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, value }) => `${name}: ₹${value}`}
                >
                  {categoryDataForChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, "Amount"]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case "prediction":
        return (
          <div id="predictionChart">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value, name) => [`₹${value}`, name]} />
                <Legend />
                <Line type="monotone" dataKey="actualAmount" stroke="#2563eb" strokeWidth={2} name="Past Expenses" />
                <Line type="monotone" dataKey="predictedAmount" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" name="Predicted Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-gray-500">Chart type not available</p>
          </div>
        );
      }
    } catch (error) {
      console.error('Error rendering chart:', error);
      return (
        <div className="flex items-center justify-center h-[300px]">
          <p className="text-red-500">Error loading chart. Please try again.</p>
        </div>
      );
    }
  };

  return (
    <div className="reports-container w-full min-h-[400px] p-4">
      <h1 className="text-2xl font-bold text-center mb-4">Reports</h1>

      <div className="flex justify-center gap-2 mb-4">
        {["weekly", "monthly", "category", "prediction"].map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <div className="flex justify-end mb-2">
        <Button size="sm" onClick={() => handleExport(`${activeTab}Chart`, activeTab)}>Export</Button>
      </div>

      <div className="w-full min-h-[320px]">{renderGraph()}</div>
    </div>
  );
}

export default function Reports() {
  return (
    <ReportsErrorBoundary>
      <ReportsContent />
    </ReportsErrorBoundary>
  );
}
