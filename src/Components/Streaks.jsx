import React from "react";
import { Flame } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { updateStreak } from "@/utils";   // since you have utils.js

export default function Streaks({ expenses }) {
  const streak = updateStreak(expenses);

  return (
    <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-xl">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Flame className="w-8 h-8 text-orange-500" />
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {streak}-day streak
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You’ve logged expenses {streak} days in a row
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
