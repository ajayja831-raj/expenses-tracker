import React from 'react';
import type { Expense, ExpenseCategory } from '../types';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  monthlyBudget: number;
  onSetBudgetClick: () => void;
  onViewAllClick: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  expenses,
  monthlyBudget,
  onSetBudgetClick,
  onViewAllClick,
}) => {
  // Category colors matching our styling theme
  const categoryConfig: Record<ExpenseCategory, { color: string; text: string; dot: string }> = {
    Software: { color: '#6366f1', text: 'text-indigo-400', dot: 'bg-indigo-500' },
    Travel: { color: '#f59e0b', text: 'text-amber-400', dot: 'bg-amber-500' },
    Marketing: { color: '#f43f5e', text: 'text-rose-400', dot: 'bg-rose-500' },
    Salaries: { color: '#10b981', text: 'text-emerald-400', dot: 'bg-emerald-500' },
    Office: { color: '#0ea5e9', text: 'text-sky-400', dot: 'bg-sky-500' },
    Other: { color: '#64748b', text: 'text-slate-400', dot: 'bg-slate-500' },
  };

  // Get current year and month (e.g. 2026-07)
  const today = new Date('2026-07-09'); // Using the user's date context
  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth(); // 0-indexed (6 is July)
  const currentMonthStr = `${currentYear}-${String(currentMonthNum + 1).padStart(2, '0')}`;

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonthStr));
  const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Lifetime stats
  const lifetimeTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Budget calculations
  const remainingBudget = monthlyBudget - currentMonthTotal;
  const budgetUsagePercent = Math.min((currentMonthTotal / monthlyBudget) * 100, 100);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // 1. Data for Category Pie/Donut Chart (All-time or Current Month)
  // Let's do overall category distribution to display more rich mock data, but we can display the totals clearly
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const donutData = Object.keys(categoryConfig).map(cat => {
    const category = cat as ExpenseCategory;
    const value = categoryTotals[category] || 0;
    return {
      name: category,
      value,
      percentage: lifetimeTotal > 0 ? (value / lifetimeTotal) * 100 : 0,
      config: categoryConfig[category]
    };
  }).filter(item => item.value > 0).sort((a, b) => b.value - a.value);

  // Donut SVG Parameters
  const radius = 35;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius; // ~219.91
  let accumulatedPercent = 0;

  // 2. Data for Monthly Trends Bar Chart (Last 6 Months)
  // Let's extract the last 6 months (Feb to Jul 2026)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Generate list of last 6 months starting from current month
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(currentYear, currentMonthNum - 5 + i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    return {
      key: monthKey,
      label: `${monthNames[m]} ${String(y).slice(-2)}`,
      total: 0,
    };
  });

  // Populate monthly totals
  expenses.forEach(exp => {
    const expMonthKey = exp.date.slice(0, 7); // "YYYY-MM"
    const foundMonth = last6Months.find(m => m.key === expMonthKey);
    if (foundMonth) {
      foundMonth.total += exp.amount;
    }
  });

  const maxMonthlySpending = Math.max(...last6Months.map(m => m.total), 1);

  // Recent expenses (max 5)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Month Spending */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover-lift border border-transparent">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <DollarSign className="w-24 h-24 text-violet-500" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">July Spending</p>
          <h3 className="text-3xl font-bold font-display text-white mt-2">
            {formatCurrency(currentMonthTotal)}
          </h3>
          <div className="flex items-center text-xs text-slate-400 mt-4 bg-slate-900/60 w-fit px-2.5 py-1 rounded-lg border border-slate-800">
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-violet-400" />
            <span>Lifetime: {formatCurrency(lifetimeTotal)}</span>
          </div>
        </div>

        {/* Card 2: Remaining Budget */}
        <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover-lift border border-transparent">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-300">
            <Calendar className="w-24 h-24 text-teal-500" />
          </div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Remaining Budget</p>
          <h3 className={`text-3xl font-bold font-display mt-2 ${remainingBudget < 0 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
            {formatCurrency(remainingBudget)}
          </h3>
          <div className="flex items-center text-xs text-slate-400 mt-4 bg-slate-900/60 w-fit px-2.5 py-1 rounded-lg border border-slate-800">
            <AlertCircle className={`w-3.5 h-3.5 mr-1 ${remainingBudget < 0 ? 'text-rose-400' : 'text-teal-400'}`} />
            <span>Budget: {formatCurrency(monthlyBudget)}</span>
          </div>
        </div>

        {/* Card 3: Monthly Budget Health */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between hover-lift border border-transparent">
          <div>
            <div className="flex justify-between items-center">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Utilization</p>
              <button 
                onClick={onSetBudgetClick}
                className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
              >
                Edit Limit
              </button>
            </div>
            <div className="flex items-baseline space-x-1.5 mt-2">
              <span className="text-3xl font-bold font-display text-white">{budgetUsagePercent.toFixed(1)}%</span>
              <span className="text-slate-400 text-xs font-medium">used</span>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  budgetUsagePercent > 90
                    ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                    : budgetUsagePercent > 70
                    ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                    : 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                }`}
                style={{ width: `${budgetUsagePercent}%` }}
              ></div>
            </div>
            {budgetUsagePercent > 90 && (
              <p className="text-[10px] text-rose-400 font-medium mt-1.5 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>Warning: Spending has exceeded 90% of the budget.</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown (Donut Chart) */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between hover-lift border border-transparent">
          <div>
            <h4 className="text-base font-bold font-display text-slate-100 mb-1">Category Breakdown</h4>
            <p className="text-xs text-slate-400 mb-6">Distribution of overall company expenditures</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut Chart */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg 
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth={strokeWidth}
                />
                {/* Segments */}
                {donutData.map((item, index) => {
                  const strokeLength = (item.percentage / 100) * circumference;
                  const strokeOffset = circumference - (accumulatedPercent / 100) * circumference;
                  
                  // Accumulate percentage
                  accumulatedPercent += item.percentage;
                  
                  return (
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={item.config.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${strokeLength} ${circumference}`}
                      strokeDashoffset={strokeOffset}
                      strokeLinecap="round"
                      className="transition-all duration-500 hover:stroke-[12px] cursor-pointer"
                      style={{ transformOrigin: '50% 50%' }}
                    >
                      <title>{`${item.name}: ${formatCurrency(item.value)} (${item.percentage.toFixed(1)}%)`}</title>
                    </circle>
                  );
                })}
              </svg>
              {/* Central Text */}
              <div className="absolute text-center">
                <p className="text-xs text-slate-400 font-medium">All-time Total</p>
                <p className="text-lg font-bold font-display text-white mt-0.5">{formatCurrency(lifetimeTotal)}</p>
              </div>
            </div>

            {/* Legend list */}
            <div className="flex-1 space-y-2.5 max-h-48 overflow-y-auto pr-2">
              {donutData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs group">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.config.dot} transition-transform group-hover:scale-125`}></span>
                    <span className="text-slate-300 font-medium group-hover:text-slate-100 transition-colors">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-200 font-semibold">{formatCurrency(item.value)}</span>
                    <span className="text-[10px] text-slate-500 font-medium ml-1.5">({item.percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
              {donutData.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center">No expenses recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Monthly Trends (Bar Chart) */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between hover-lift border border-transparent">
          <div>
            <h4 className="text-base font-bold font-display text-slate-100 mb-1">Monthly Trends</h4>
            <p className="text-xs text-slate-400 mb-6">Spending pattern over the last 6 months</p>
          </div>

          <div className="flex flex-col h-full justify-end">
            <div className="flex items-end justify-between h-48 px-2 border-b border-slate-800 pb-1.5 gap-3.5">
              {last6Months.map((m, idx) => {
                const heightPercent = (m.total / maxMonthlySpending) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-slate-950/90 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none border border-slate-800 shadow-xl whitespace-nowrap z-20">
                      {formatCurrency(m.total)}
                    </div>
                    
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-900 rounded-t-lg h-44 flex items-end overflow-hidden border border-slate-800/40">
                      <div 
                        className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-md group-hover:from-violet-500 group-hover:to-indigo-400 transition-all duration-500 ease-out relative cursor-pointer"
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    </div>
                    
                    {/* Month Label */}
                    <span className="text-[10px] text-slate-400 font-semibold mt-2.5 truncate max-w-full">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Transactions */}
      <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="text-base font-bold font-display text-slate-100 mb-1">Recent Activity</h4>
            <p className="text-xs text-slate-400">Latest expenses logged across the company</p>
          </div>
          <button 
            onClick={onViewAllClick}
            className="flex items-center text-xs font-semibold text-violet-400 hover:text-violet-300 transition-all cursor-pointer group"
          >
            <span>View Ledger</span>
            <ChevronRight className="w-4 h-4 ml-0.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 text-xs">
              {recentExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-900/30 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-200">
                    <div>
                      <p>{expense.merchant}</p>
                      <p className="text-[10px] text-slate-500 font-normal truncate max-w-xs">{expense.description}</p>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-800 ${categoryConfig[expense.category].text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${categoryConfig[expense.category].dot} mr-1.5`}></span>
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-medium">
                    {new Date(expense.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-white">
                    {formatCurrency(expense.amount)}
                  </td>
                </tr>
              ))}
              {recentExpenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-500 italic">
                    No transactions recorded. Click "Log Expense" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
