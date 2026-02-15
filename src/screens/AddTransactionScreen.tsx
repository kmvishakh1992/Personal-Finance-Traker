import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Calendar, Tag, DollarSign } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveTransaction, getCurrency } from '../utils/storage';

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Health', 'Income'];

const AddTransactionScreen = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currency, setCurrency] = useState('$');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    const symbol = await getCurrency();
    setCurrency(symbol);
  };

  const handleSave = async () => {
    if (!amount || !title) {
      Alert.alert('Missing Information', 'Please enter an amount and description.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid number.');
      return;
    }

    const formattedDate = date.toISOString().split('T')[0];

    const newTransaction = {
      id: Date.now().toString(),
      title,
      amount: numericAmount,
      category,
      date: formattedDate,
      type: category === 'Income' ? 'income' : 'expense'
    };

    await saveTransaction(newTransaction);
    navigation.goBack();
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-6 py-4 border-b border-slate-100 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-slate-900">Add Transaction</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-slate-100 rounded-full">
          <X size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" keyboardShouldPersistTaps="handled">
        {/* Amount Input */}
        <View className="mb-8">
          <Text className="text-slate-500 text-sm font-medium mb-2">Amount</Text>
          <View className="flex-row items-center border-b-2 border-indigo-500 pb-2">
            {/* Dynamic Currency Display */}
            <Text className="text-3xl font-bold text-indigo-600 mr-2">{currency}</Text>
            <TextInput
              className="flex-1 text-4xl font-bold text-slate-900 ml-2 h-16"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              autoFocus={false}
            />
          </View>
        </View>

        {/* Title Input */}
        <View className="mb-6">
          <Text className="text-slate-500 text-sm font-medium mb-2">Description</Text>
          <TextInput
            className="bg-slate-50 p-4 rounded-xl text-slate-900 text-base border border-slate-200"
            placeholder="What is this for?"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Category Selection */}
        <View className="mb-6">
          <Text className="text-slate-500 text-sm font-medium mb-3">Category</Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                className={`px-4 py-2 rounded-full border ${
                  category === cat
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    category === cat ? 'text-white' : 'text-slate-600'
                  }`}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Date Input (Picker) */}
        <View className="mb-8">
          <Text className="text-slate-500 text-sm font-medium mb-2">Date</Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="bg-slate-50 p-4 rounded-xl flex-row items-center border border-slate-200"
          >
            <Calendar size={20} color="#64748b" />
            <Text className="ml-3 text-slate-900 font-medium">
              {date.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-indigo-600 py-4 rounded-xl items-center shadow-lg shadow-indigo-200 mb-8"
          onPress={handleSave}
        >
          <Text className="text-white font-bold text-lg">Save Transaction</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddTransactionScreen;