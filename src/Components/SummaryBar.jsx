import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useAppData } from "../Contexts/AppDataContext";

export function SummaryBar() {
  const { totalBudget, totalSpent, remaining } = useAppData();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="shadow-md bg-white">
        <CardContent className="p-4 flex justify-between font-semibold text-gray-700">
          <span>Total Budget</span>
          <span>₹{totalBudget.toLocaleString()}</span>
        </CardContent>
      </Card>
      <Card className="shadow-md bg-white">
        <CardContent className="p-4 flex justify-between font-semibold text-gray-700">
          <span>Total Spent</span>
          <span>₹{totalSpent.toLocaleString()}</span>
        </CardContent>
      </Card>
      <Card className="shadow-md bg-white">
        <CardContent className="p-4 flex justify-between font-semibold text-gray-700">
          <span>Remaining</span>
          <span>₹{remaining.toLocaleString()}</span>
        </CardContent>
      </Card>
    </div>
  );
}
export default SummaryBar;
