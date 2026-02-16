import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  type: 'income' | 'expense';
}

export interface CategoryBudget {
  [category: string]: number;
}

const TRANSACTIONS_KEY = '@finance_app_transactions';
const CURRENCY_KEY = '@finance_app_currency';
const BUDGET_KEY = '@finance_app_budget';
const CATEGORY_BUDGET_KEY = '@finance_app_category_budgets';

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading transactions', e);
    return [];
  }
};

export const saveTransaction = async (transaction: Transaction): Promise<Transaction[]> => {
  try {
    const currentTransactions = await getTransactions();
    const newTransactions = [transaction, ...currentTransactions];
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newTransactions));
    return newTransactions;
  } catch (e) {
    console.error('Error saving transaction', e);
    return [];
  }
};

export const clearTransactions = async () => {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  } catch (e) {
    console.error('Error clearing transactions', e);
  }
};

// Currency Helpers
export const getCurrency = async (): Promise<string> => {
  try {
    const currency = await AsyncStorage.getItem(CURRENCY_KEY);
    return currency || '₹'; // Default to Indian Rupee
  } catch (e) {
    return '₹';
  }
};

export const setCurrency = async (symbol: string) => {
  try {
    await AsyncStorage.setItem(CURRENCY_KEY, symbol);
  } catch (e) {
    console.error('Error saving currency', e);
  }
};

// Budget Helpers
export const getBudget = async (): Promise<number> => {
  try {
    const budget = await AsyncStorage.getItem(BUDGET_KEY);
    return budget ? parseFloat(budget) : 2000; // Default budget
  } catch (e) {
    return 2000;
  }
};

export const setBudget = async (amount: number) => {
  try {
    await AsyncStorage.setItem(BUDGET_KEY, amount.toString());
  } catch (e) {
    console.error('Error saving budget', e);
  }
};

// Category Budget Helpers
export const getCategoryBudgets = async (): Promise<CategoryBudget> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CATEGORY_BUDGET_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : {};
  } catch (e) {
    return {};
  }
};

export const setCategoryBudgets = async (budgets: CategoryBudget) => {
  try {
    await AsyncStorage.setItem(CATEGORY_BUDGET_KEY, JSON.stringify(budgets));
  } catch (e) {
    console.error('Error saving category budgets', e);
  }
};