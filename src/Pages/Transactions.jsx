import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";
import TransactionForm from "../Components/transactions/TransactionForm";
import { useAppData } from "../Contexts/AppDataContext";
import OCRScanner from "@/Components/OCRScanner";

export default function Transactions() {
  const { transactions, setTransactions, categories } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  const handleAdd = () => {
    setEditingTx(null);
    setShowForm(true);
  };

  const handleEdit = (tx) => {
    setEditingTx(tx);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    const updatedTransactions = transactions.filter((tx) => tx.id !== id);
    setTransactions(updatedTransactions);
    const data = JSON.parse(localStorage.getItem("appData")) || {};
    localStorage.setItem(
      "appData",
      JSON.stringify({ ...data, transactions: updatedTransactions, categories })
    );
  };

  const handleSubmit = (tx) => {
    const updatedTx = {
      ...tx,
      id: editingTx ? editingTx.id : Date.now().toString(),
      category_id: tx.category_id,
      category: tx.category || "Uncategorized",
    };

    const updatedTransactions = editingTx
      ? transactions.map((t) => (t.id === editingTx.id ? updatedTx : t))
      : [...transactions, updatedTx];

    setTransactions(updatedTransactions);

    const data = JSON.parse(localStorage.getItem("appData")) || {};
    localStorage.setItem(
      "appData",
      JSON.stringify({ ...data, transactions: updatedTransactions, categories })
    );

    setShowForm(false);
    setEditingTx(null);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500">Transactions</h1>
        <Button onClick={handleAdd} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:opacity-90 text-white shadow-lg hover:scale-105 transition-transform">
          Add Transaction
        </Button>
      </div>

      {/* OCR Scanner */}
      <section className="mb-10">
        <OCRScanner onSubmit={handleSubmit} />
      </section>

      {/* Empty State */}
      {transactions.length === 0 && (
        <p className="text-center text-lg text-muted-foreground mb-4">No transactions yet.</p>
      )}

      {/* Transactions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {transactions.map((tx) => {
          const category = categories.find((c) => c.id === tx.category_id);
          const categoryName = category?.name || tx.category || "Uncategorized";

          const overspent =
            category && category.budget
              ? tx.amount +
                transactions
                  .filter((t) => t.category_id === category.id && t.id !== tx.id)
                  .reduce((sum, t) => sum + t.amount, 0) >
                category.budget
              : false;

          return (
            <Card
              key={tx.id}
              className={`bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-2xl shadow-lg border-2 ${overspent ? "border-red-500" : "border-transparent"}`}
            >
              <CardHeader className="flex justify-between items-center p-4 bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 dark:from-gray-700/50 dark:via-gray-600/50 dark:to-gray-700/50">
                <CardTitle className="font-semibold text-lg text-foreground">{categoryName}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(tx)}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tx.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                <p className="text-sm font-medium text-foreground">
                  Amount:{" "}
                  <span className="font-bold text-primary">₹{tx.amount.toLocaleString()}</span> ({tx.type})
                </p>
                <p className="text-sm text-muted-foreground">Description: {tx.description}</p>
                <p className="text-sm text-muted-foreground">Date: {tx.date}</p>
                {overspent && <p className="text-red-600 dark:text-red-500 font-bold mt-1">Overspent!</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction Form Modal */}
      {showForm && (
        <TransactionForm
          transaction={editingTx}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
