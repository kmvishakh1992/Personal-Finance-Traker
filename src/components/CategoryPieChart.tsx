import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { Transaction } from '../utils/storage';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#4f46e5', // indigo-600
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions }) => {
  // 1. Filter expenses only
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

  if (totalExpense === 0) {
    return (
      <View className="items-center justify-center h-48 bg-white rounded-2xl m-6 border border-slate-100">
        <Text className="text-slate-400">No expenses to show</Text>
      </View>
    );
  }

  // 2. Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  // 3. Prepare data for chart
  const data = Object.keys(categoryTotals).map((cat, index) => ({
    name: cat,
    value: categoryTotals[cat],
    color: COLORS[index % COLORS.length],
    percentage: (categoryTotals[cat] / totalExpense) * 100
  })).sort((a, b) => b.value - a.value);

  // 4. Calculate SVG paths
  let startAngle = 0;
  const radius = 60;
  const center = 80;

  const slices = data.map((slice, index) => {
    const angle = (slice.value / totalExpense) * 360;
    const endAngle = startAngle + angle;

    // Convert angles to radians
    const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180);
    const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180);
    const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180);
    const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180);

    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    startAngle = endAngle;

    return (
      <Path
        key={slice.name}
        d={pathData}
        fill={slice.color}
      />
    );
  });

  return (
    <View className="bg-white mx-6 p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <Text className="text-slate-900 text-lg font-bold mb-4">Spending by Category</Text>

      <View className="flex-row items-center">
        {/* Chart */}
        <View className="items-center justify-center mr-6">
          <Svg height="160" width="160" viewBox="0 0 160 160">
            {slices}
            {/* Inner white circle for Donut effect */}
            <Circle cx={center} cy={center} r={radius * 0.6} fill="white" />
          </Svg>
          <View className="absolute items-center justify-center">
             <Text className="text-xs text-slate-400 font-medium">Total</Text>
             <Text className="text-sm font-bold text-slate-900">${totalExpense.toFixed(0)}</Text>
          </View>
        </View>

        {/* Legend */}
        <View className="flex-1">
          {data.map((item) => (
            <View key={item.name} className="flex-row items-center mb-2">
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <View className="flex-1 flex-row justify-between">
                <Text className="text-slate-600 text-xs font-medium">{item.name}</Text>
                <Text className="text-slate-900 text-xs font-bold">{Math.round(item.percentage)}%</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default CategoryPieChart;