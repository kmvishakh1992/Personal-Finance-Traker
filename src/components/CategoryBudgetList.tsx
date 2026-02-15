import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Transaction, CategoryBudget } from '../utils/storage';

interface CategoryBudgetListProps {
  transactions: Transaction[];
  categoryBudgets: CategoryBudget;
  currency: string;
}

const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health'];

const CategoryBudgetList: React.FC<CategoryBudgetListProps> = ({ transactions, categoryBudgets, currency }) => {

  const budgetData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Calculate spending per category for current month
    const spending: Record<string, number> = {};

    transactions.forEach(t => {
      const d = new Date(t.date);
      if (
        t.type === 'expense' &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      ) {
        spending[t.category] = (spending[t.category] || 0) + t.amount;
      }
    });

    // 2. Map to display data
    return EXPENSE_CATEGORIES.map(cat => {
      const spent = spending[cat] || 0;
      const budget = categoryBudgets[cat] || 0;

      // Skip if no budget and no spending
      if (spent === 0 && budget === 0) return null;

      const percent = budget > 0 ? (spent / budget) * 100 : 0;
      const isOverBudget = spent > budget && budget > 0;

      return {
        category: cat,
        spent,
        budget,
        percent: Math.min(percent, 100),
        isOverBudget,
        excess: isOverBudget ? spent - budget : 0
      };
    }).filter(Boolean); // Remove nulls
  }, [transactions, categoryBudgets]);

  if (budgetData.length === 0) return null;

  return (
    <View className="px-6 mb-8">
      <Text className="text-slate-900 text-lg font-bold mb-4">Category Budgets</Text>
      <View className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
        {budgetData.map((item: any) => (
          <View key={item.category} className="mb-4 last:mb-0">
            <View className="flex-row justify-between items-end mb-2">
              <View>
                <Text className="text-slate-900 font-bold text-sm">{item.category}</Text>
                <Text className="text-slate-500 text-xs">
                  {currency}{item.spent.toFixed(0)} / {currency}{item.budget.toFixed(0)}
                </Text>
              </View>
              {item.isOverBudget ? (
                <Text className="text-red-500 text-xs font-bold">
                  +{currency}{item.excess.toFixed(0)} Over
                </Text>
              ) : (
                <Text className="text-slate-400 text-xs">
                  {item.budget > 0 ? `${Math.round(item.percent)}%` : 'No Limit'}
                </Text>
              )}
            </View>

            {/* Progress Bar */}
            <View className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <View
                className={`h-full rounded-full ${
                  item.isOverBudget ? 'bg-red-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${item.budget > 0 ? item.percent : 0}%` }}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default CategoryBudgetList;