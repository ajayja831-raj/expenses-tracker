import React from 'react';
import type { Expense } from '../types';
import { Award, Activity, Sparkles } from 'lucide-react';

interface AnalyticsProps {
  expenses: Expense[];
}

export const Analytics: React.FC<AnalyticsProps> = ({ expenses }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const transactionCount = expenses.length;
  const averageSpent = transactionCount > 0 ? totalSpent / transactionCount : 0;
  const largestExpense = transactionCount > 0 
    ? [...expenses].sort((a, b) => b.amount - a.amount)[0] 
    : null;

  // Merchant aggregation
  const merchantTotals = expenses.reduce((acc, exp) => {
    const name = exp.merchant.trim();
    acc[name] = (acc[name] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedMerchants = Object.keys(merchantTotals)
    .map((name) => ({
      name,
      total: merchantTotals[name],
      percentage: totalSpent > 0 ? (merchantTotals[name] / totalSpent) * 100 : 0,
      // Find the most common department/category for this merchant
      merchantDetail: expenses.find(e => e.merchant === name)
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5); // Top 5 merchants

  // Category average transaction
  const categoryStats = expenses.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = { total: 0, count: 0 };
    }
    acc[exp.category].total += exp.amount;
    acc[exp.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const sortedCategories = Object.keys(categoryStats).map((cat) => {
    const stats = categoryStats[cat];
    return {
      name: cat,
      total: stats.total,
      count: stats.count,
      avg: stats.total / stats.count,
    };
  }).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Average Expense */}
        <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent flex items-center space-x-5">
          <div className="p-4 bg-violet-600/10 border border-violet-550/20 text-violet-400 rounded-2xl flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Expense</p>
            <h3 className="text-2xl font-bold font-display text-white mt-1">
              {formatCurrency(averageSpent)}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Across {transactionCount} logged items</p>
          </div>
        </div>

        {/* Card 2: Largest Transaction */}
        <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent flex items-center space-x-5">
          <div className="p-4 bg-amber-600/10 border border-amber-550/20 text-amber-400 rounded-2xl flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Largest Expense</p>
            <h3 className="text-2xl font-bold font-display text-white mt-1 truncate" title={largestExpense ? largestExpense.merchant : ''}>
              {largestExpense ? formatCurrency(largestExpense.amount) : '$0.00'}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 truncate">
              {largestExpense ? `${largestExpense.merchant} (${largestExpense.category})` : 'No data available'}
            </p>
          </div>
        </div>

        {/* Card 3: Total Transactions */}
        <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent flex items-center space-x-5">
          <div className="p-4 bg-teal-600/10 border border-teal-550/20 text-teal-400 rounded-2xl flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ledger Size</p>
            <h3 className="text-2xl font-bold font-display text-white mt-1">
              {transactionCount}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Total registered transactions</p>
          </div>
        </div>
      </div>

      {/* Grid for top merchants & category metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Merchants List */}
        <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent">
          <div className="mb-6">
            <h4 className="text-base font-bold font-display text-slate-100 mb-1">Top Vendors by Spending</h4>
            <p className="text-xs text-slate-400">Merchants where the company spends the most money</p>
          </div>

          <div className="space-y-4">
            {sortedMerchants.map((merchant, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-200">{merchant.name}</span>
                    {merchant.merchantDetail?.department && (
                      <span className="ml-2 text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase">
                        {merchant.merchantDetail.department}
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-white">{formatCurrency(merchant.total)}</span>
                </div>
                {/* Visual percentage bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
                    style={{ width: `${merchant.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}

            {sortedMerchants.length === 0 && (
              <p className="text-xs text-slate-500 italic text-center py-6">No merchant records available.</p>
            )}
          </div>
        </div>

        {/* Category Breakdown Table with Averages */}
        <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent">
          <div className="mb-6">
            <h4 className="text-base font-bold font-display text-slate-100 mb-1">Category Insights</h4>
            <p className="text-xs text-slate-400">Averages and volume breakdown per expense category</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/60 text-[10px] text-slate-400 uppercase font-bold tracking-wider pb-3">
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-center">Transactions</th>
                  <th className="py-2.5 px-3 text-right">Avg Item Cost</th>
                  <th className="py-2.5 px-3 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30 text-xs">
                {sortedCategories.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/30 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-200">{item.name}</td>
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{item.count}</td>
                    <td className="py-3 px-3 text-right text-slate-350 font-bold">{formatCurrency(item.avg)}</td>
                    <td className="py-3 px-3 text-right text-violet-400 font-extrabold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}

                {sortedCategories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500 italic">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
