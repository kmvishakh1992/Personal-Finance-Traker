import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, TrendingDown, Wallet, Settings, PieChart } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTransactions, Transaction, getCurrency, getBudget } from '../utils/storage';

const DashboardScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [monthlySpend, setMonthlySpend] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(2000); // Default budget
  const [currency, setCurrency] = useState('$');

  const loadData = async () => {
    const data = await getTransactions();
    const curr = await getCurrency();
    const budget = await getBudget();

    setCurrency(curr);
    setMonthlyBudget(budget);
    setTransactions(data);
    calculateFinances(data);
  };

  const calculateFinances = (data: Transaction[]) => {
    let income = 0;
    let expense = 0;

    data.forEach(item => {
      if (item.type === 'income') {
        income += item.amount;
      } else {
        expense += item.amount;
      }
    });

    setTotalBalance(income - expense);
    setMonthlySpend(expense);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const remainingBudget = monthlyBudget - monthlySpend;
  const budgetProgress = Math.min((monthlySpend / monthlyBudget) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View className="px-6 pt-4 pb-6">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-slate-500 text-sm font-medium">Good Morning,</Text>
              <Text className="text-slate-900 text-2xl font-bold">Vishakh</Text>
            </View>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('Analytics')}
                className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center"
              >
                <PieChart size={20} color="#4f46e5" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => navigation.navigate('Settings')}
                className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
              >
                <Settings size={20} color="#475569" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Balance Card */}
          <View className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-200">
            <Text className="text-indigo-100 text-sm font-medium mb-1">Total Balance</Text>
            <Text className="text-white text-4xl font-bold mb-6">{currency}{totalBalance.toLocaleString()}</Text>

            <View className="flex-row justify-between">
              <View className="bg-indigo-500/50 px-4 py-2 rounded-xl flex-1 mr-3">
                <View className="flex-row items-center mb-1">
                  <TrendingDown size={16} color="#e0e7ff" />
                  <Text className="text-indigo-100 text-xs ml-1">Spent</Text>
                </View>
                <Text className="text-white font-semibold">{currency}{monthlySpend.toFixed(2)}</Text>
              </View>
              <View className="bg-indigo-500/50 px-4 py-2 rounded-xl flex-1 ml-3">
                <View className="flex-row items-center mb-1">
                  <Wallet size={16} color="#e0e7ff" />
                  <Text className="text-indigo-100 text-xs ml-1">Budget</Text>
                </View>
                <Text className="text-white font-semibold">{currency}{remainingBudget.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Budget Progress Section */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-end mb-3">
            <Text className="text-slate-900 text-lg font-bold">Monthly Budget</Text>
            <Text className="text-slate-500 text-sm">{Math.round(budgetProgress)}% used</Text>
          </View>
          <View className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <View
              className="h-full bg-indigo-500 rounded-full"
              style={{ width: `${budgetProgress}%` }}
            />
          </View>
          <Text className="text-slate-400 text-xs mt-2 text-right">
            {currency}{remainingBudget.toFixed(2)} remaining of {currency}{monthlyBudget}
          </Text>
        </View>

        {/* Recent Transactions Section */}
        <View className="px-6 pb-24">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-slate-900 text-lg font-bold">Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllTransactions')}>
              <Text className="text-indigo-600 font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100">
            {transactions.length === 0 ? (
              <View className="p-8 items-center">
                <Text className="text-slate-400 text-center">No transactions yet. Tap + to add one!</Text>
              </View>
            ) : (
              transactions.slice(0, 5).map((item) => (
                <View key={item.id} className="flex-row items-center justify-between p-4 border-b border-slate-50 last:border-0">
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
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-8 right-6 w-16 h-16 bg-indigo-600 rounded-full items-center justify-center shadow-xl shadow-indigo-300"
        onPress={() => navigation.navigate('AddTransaction')}
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default DashboardScreen;