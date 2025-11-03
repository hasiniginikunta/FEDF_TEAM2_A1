import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Dummy data: replace with your own from context or API
const sampleExpenses = [
  { date: "2025-09-01", amount: 120 },
  { date: "2025-09-02", amount: 150 },
  { date: "2025-09-03", amount: 100 },
  { date: "2025-09-04", amount: 170 },
  { date: "2025-09-05", amount: 140 },
  { date: "2025-09-06", amount: 160 },
];

// Simple prediction function (linear growth based on average difference)
function predictExpenses(data, days = 5) {
  if (data.length < 2) return [];
  const diffs = [];
  for (let i = 1; i < data.length; i++) {
    diffs.push(data[i].amount - data[i - 1].amount);
  }
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;

  const lastDate = new Date(data[data.length - 1].date);
  const predictions = [];
  let lastAmount = data[data.length - 1].amount;

  for (let i = 1; i <= days; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);
    lastAmount += avgDiff;
    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      amount: Math.round(lastAmount),
      predicted: true,
    });
  }
  return predictions;
}

export default function PredictionGraph() {
  const predictions = useMemo(() => predictExpenses(sampleExpenses, 5), []);
  const data = [...sampleExpenses, ...predictions];

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md mt-8">
      <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">
        Expense Prediction
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          {/* Past data */}
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#2563eb"
            dot={false}
            isAnimationActive={true}
            strokeWidth={2}
            connectNulls
            name="Past Expenses"
            strokeDasharray="0"
          />
          {/* Predicted data */}
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#ef4444"
            dot={false}
            strokeWidth={2}
            connectNulls
            name="Predicted Expenses"
            strokeDasharray="5 5"
            data={data.filter((d) => d.predicted)}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
