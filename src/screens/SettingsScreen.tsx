import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Check, DollarSign } from 'lucide-react-native';
import { getCurrency, setCurrency, getBudget, setBudget, getCategoryBudgets, setCategoryBudgets, CategoryBudget } from '../utils/storage';

const CURRENCIES = [
  { symbol: '$', name: 'US Dollar' },
  { symbol: '€', name: 'Euro' },
  { symbol: '£', name: 'British Pound' },
  { symbol: '₹', name: 'Indian Rupee' },
  { symbol: '¥', name: 'Japanese Yen' },
  { symbol: 'A$', name: 'Australian Dollar' },
  { symbol: 'C$', name: 'Canadian Dollar' },
];

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health'];

const SettingsScreen = ({ navigation }) => {
  const [currentCurrency, setCurrentCurrency] = useState('$');
  const [totalBudget, setTotalBudget] = useState('');
  const [categoryBudgets, setCategoryBudgetsState] = useState<CategoryBudget>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const symbol = await getCurrency();
    const budget = await getBudget();
    const catBudgets = await getCategoryBudgets();

    setCurrentCurrency(symbol);
    setTotalBudget(budget.toString());
    setCategoryBudgetsState(catBudgets);
  };

  const handleSelectCurrency = async (symbol: string) => {
    await setCurrency(symbol);
    setCurrentCurrency(symbol);
  };

  const handleSaveTotalBudget = async () => {
    const amount = parseFloat(totalBudget);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid positive number.');
      return;
    }
    await setBudget(amount);
    Alert.alert('Success', 'Total monthly budget updated!');
  };

  const handleCategoryBudgetChange = (category: string, value: string) => {
    setCategoryBudgetsState(prev => ({
      ...prev,
      [category]: parseFloat(value) || 0
    }));
  };

  const handleSaveCategoryBudgets = async () => {
    const totalAllocated = Object.values(categoryBudgets).reduce((sum, val) => sum + val, 0);
    const maxBudget = parseFloat(totalBudget);

    if (totalAllocated > maxBudget) {
      Alert.alert(
        'Budget Exceeded',
        `Total allocation (${totalAllocated}) exceeds your monthly budget (${maxBudget}). Please adjust.`
      );
      return;
    }

    await setCategoryBudgets(categoryBudgets);
    Alert.alert('Success', 'Category budgets saved!');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-6 py-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-slate-900">Settings</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">

        {/* Total Budget Section */}
        <Text className="text-slate-500 text-sm font-bold uppercase mb-4">Total Monthly Budget</Text>
        <View className="bg-white p-4 rounded-2xl border border-slate-100 mb-8">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
              <Text className="text-lg font-bold text-indigo-600">{currentCurrency}</Text>
            </View>
            <TextInput
              className="flex-1 text-xl font-bold text-slate-900 h-12"
              value={totalBudget}
              onChangeText={setTotalBudget}
              keyboardType="numeric"
              placeholder="2000"
            />
          </View>
          <TouchableOpacity
            onPress={handleSaveTotalBudget}
            className="bg-indigo-600 py-3 rounded-xl items-center"
          >
            <Text className="text-white font-bold">Update Total Budget</Text>
          </TouchableOpacity>
        </View>

        {/* Category Allocation Section */}
        <Text className="text-slate-500 text-sm font-bold uppercase mb-4">Category Allocation</Text>
        <View className="bg-white p-4 rounded-2xl border border-slate-100 mb-8">
          {CATEGORIES.map((cat) => (
            <View key={cat} className="flex-row items-center justify-between mb-4 last:mb-0">
              <Text className="text-slate-700 font-medium w-1/3">{cat}</Text>
              <View className="flex-row items-center bg-slate-50 rounded-lg px-3 py-2 w-1/2 border border-slate-200">
                <Text className="text-slate-500 mr-1">{currentCurrency}</Text>
                <TextInput
                  className="flex-1 text-slate-900 font-bold"
                  value={categoryBudgets[cat]?.toString() || ''}
                  onChangeText={(val) => handleCategoryBudgetChange(cat, val)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>
          ))}
          <View className="mt-4 pt-4 border-t border-slate-100">
            <View className="flex-row justify-between mb-4">
              <Text className="text-slate-500">Total Allocated:</Text>
              <Text className={`font-bold ${
                Object.values(categoryBudgets).reduce((a, b) => a + b, 0) > parseFloat(totalBudget || '0')
                  ? 'text-red-500'
                  : 'text-green-600'
              }`}>
                {currentCurrency}{Object.values(categoryBudgets).reduce((a, b) => a + b, 0)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleSaveCategoryBudgets}
              className="bg-slate-900 py-3 rounded-xl items-center"
            >
              <Text className="text-white font-bold">Save Allocations</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currency Section */}
        <Text className="text-slate-500 text-sm font-bold uppercase mb-4">Currency</Text>
        <View className="bg-white rounded-2xl overflow-hidden border border-slate-100 mb-8">
          {CURRENCIES.map((item, index) => (
            <TouchableOpacity
              key={item.symbol}
              onPress={() => handleSelectCurrency(item.symbol)}
              className={`flex-row items-center justify-between p-4 ${
                index !== CURRENCIES.length - 1 ? 'border-b border-slate-50' : ''
              }`}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-lg font-bold text-slate-700">{item.symbol}</Text>
                </View>
                <Text className="text-slate-900 font-medium text-base">{item.name}</Text>
              </View>
              {currentCurrency === item.symbol && (
                <Check size={20} color="#4f46e5" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;