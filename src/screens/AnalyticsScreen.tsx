import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, Transaction, getCurrency, getCategoryBudgets, CategoryBudget } from '../utils/storage';
import CategoryPieChart from '../components/CategoryPieChart';
import CategoryBudgetList from '../components/CategoryBudgetList';

const AnalyticsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currency, setCurrency] = useState('$');
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget>({});

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const data = await getTransactions();
    const curr = await getCurrency();
    const budgets = await getCategoryBudgets();

    setTransactions(data);
    setCurrency(curr);
    setCategoryBudgets(budgets);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Analytics & Budgets</Text>
      </View>

      <ScrollView className="flex-1 pt-6" showsVerticalScrollIndicator={false}>
        {/* Pie Chart Section */}
        <CategoryPieChart transactions={transactions} />

        {/* Category Budgets List */}
        <CategoryBudgetList
          transactions={transactions}
          categoryBudgets={categoryBudgets}
          currency={currency}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AnalyticsScreen;