import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, TrendingDown, Filter } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, Transaction, getCurrency, getCategoryBudgets, CategoryBudget } from '../utils/storage';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Income'];

const AllTransactionsScreen = ({ navigation }) => {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [currency, setCurrency] = useState('$');
  const [categoryBudgets, setCategoryBudgetsState] = useState<CategoryBudget>({});

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getTransactions();
    const curr = await getCurrency();
    const budgets = await getCategoryBudgets();

    setCurrency(curr);
    setCategoryBudgetsState(budgets);
    // Sort by date descending (newest first)
    const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAllTransactions(sortedData);
  };

  // Extract available filters (Years and Month-Years)
  const availableDateFilters = useMemo(() => {
    const months = new Set<string>();
    const years = new Set<string>();

    allTransactions.forEach(t => {
      const d = new Date(t.date);
      const monthYear = d.toLocaleString('en-US', { month: 'short', year: 'numeric' }); // e.g. "Oct 2023"
      const year = d.getFullYear().toString(); // e.g. "2023"

      months.add(monthYear);
      years.add(year);
    });

    // Combine: All -> Years -> Months
    return ['All', ...Array.from(years).sort().reverse(), ...Array.from(months)];
  }, [allTransactions]);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date);
      const monthYear = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      const year = d.getFullYear().toString();

      const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

      let matchesDate = true;
      if (selectedDateFilter !== 'All') {
        // Check if the filter is a 4-digit year
        if (selectedDateFilter.length === 4 && !isNaN(Number(selectedDateFilter))) {
           matchesDate = year === selectedDateFilter;
        } else {
           matchesDate = monthYear === selectedDateFilter;
        }
      }

      return matchesCategory && matchesDate;
    });
  }, [allTransactions, selectedCategory, selectedDateFilter]);

  // Calculate Totals for the filtered view
  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { totalIncome: income, totalExpense: expense };
  }, [filteredTransactions]);

  // Calculate Budget Status for selected category
  const budgetStatus = useMemo(() => {
    if (selectedCategory === 'All' || selectedCategory === 'Income') return null;

    const budget = categoryBudgets[selectedCategory] || 0;
    if (budget === 0) return null;

    // Calculate expense for this category in the selected period
    // Note: Budget is typically monthly. If filter is "All" or "Year", comparison might be tricky.
    // Assuming budget is monthly, we should probably only show this if a specific Month is selected.
    // But user asked for "expenses of month, year and all time... based on budget allocated".
    // Let's show the comparison regardless, but label it clearly.

    return {
      budget,
      spent: totalExpense,
      remaining: budget - totalExpense,
      percent: Math.min((totalExpense / budget) * 100, 100)
    };
  }, [selectedCategory, totalExpense, categoryBudgets]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-slate-100 bg-white">
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${item.type === 'income' ? 'bg-green-100' : 'bg-orange-100'}`}>
          {item.type === 'income' ? (
            <TrendingUp size={20} color="#16a34a" />
          ) : (
            <TrendingDown size={20} color="#ea580c" />
          )}
        </View>
        <View>
          <Text className="text-slate-900 font-bold text-base">{item.title}</Text>
          <Text className="text-slate-500 text-xs">{item.category} • {item.date}</Text>
        </View>
      </View>
      <Text className={`font-bold text-base ${item.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
        {item.type === 'income' ? '+' : '-'}{currency}{Math.abs(item.amount).toFixed(2)}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <ArrowLeft size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-slate-900">All Transactions</Text>
        </View>
      </View>

      {/* Summary Card for Filtered View */}
      <View className="mx-6 mt-4 mb-2 bg-indigo-600 p-4 rounded-2xl shadow-sm">
        <Text className="text-indigo-100 text-xs font-medium mb-2 text-center uppercase tracking-wider">
          {selectedDateFilter === 'All' ? 'All Time' : selectedDateFilter} Summary
        </Text>
        <View className="flex-row justify-between mb-2">
          <View className="items-center flex-1 border-r border-indigo-500/30">
            <Text className="text-indigo-200 text-xs mb-1">Income</Text>
            <Text className="text-white text-lg font-bold">+{currency}{totalIncome.toFixed(2)}</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-indigo-200 text-xs mb-1">Expense</Text>
            <Text className="text-white text-lg font-bold">-{currency}{totalExpense.toFixed(2)}</Text>
          </View>
        </View>

        {/* Budget Comparison (Only if a specific category is selected) */}
        {budgetStatus && (
          <View className="mt-2 pt-2 border-t border-indigo-500/30">
            <View className="flex-row justify-between mb-1">
              <Text className="text-indigo-200 text-xs">Budget: {currency}{budgetStatus.budget}</Text>
              <Text className="text-indigo-200 text-xs">
                {budgetStatus.remaining >= 0 ? 'Remaining: ' : 'Over: '}
                <Text className={budgetStatus.remaining < 0 ? 'text-red-300 font-bold' : 'text-white font-bold'}>
                  {currency}{Math.abs(budgetStatus.remaining).toFixed(2)}
                </Text>
              </Text>
            </View>
            <View className="h-2 bg-indigo-900/50 rounded-full overflow-hidden">
              <View
                className={`h-full ${budgetStatus.remaining < 0 ? 'bg-red-400' : 'bg-green-400'}`}
                style={{ width: `${budgetStatus.percent}%` }}
              />
            </View>
          </View>
        )}
      </View>

      {/* Filters Section */}
      <View className="bg-slate-50 pb-2">
        {/* Date Filter */}
        <View className="py-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {availableDateFilters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedDateFilter(filter)}
                className={`mr-2 px-4 py-2 rounded-full border ${
                  selectedDateFilter === filter
                    ? 'bg-slate-900 border-slate-900'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold ${selectedDateFilter === filter ? 'text-white' : 'text-slate-600'}`}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Category Filter */}
        <View className="pb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`mr-2 px-4 py-2 rounded-full border ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold ${selectedCategory === cat ? 'text-white' : 'text-slate-600'}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredTransactions}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View className="p-8 items-center mt-10">
            <Filter size={48} color="#cbd5e1" />
            <Text className="text-slate-400 text-center mt-4">No transactions match your filters.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default AllTransactionsScreen;