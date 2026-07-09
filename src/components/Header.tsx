import React from 'react';
import { Bell, Calendar } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  totalExpenses: number;
  monthlyBudget: number;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, totalExpenses, monthlyBudget }) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'expenses':
        return 'Expense Ledger';
      default:
        return 'Expense Tracker';
    }
  };

  const getTodayDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  const budgetUsagePercent = Math.min((totalExpenses / monthlyBudget) * 100, 100);

  return (
    <header className="bg-slate-950/40 backdrop-blur-md border-b border-slate-800/80 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-2xl font-bold font-display text-white tracking-tight leading-tight">
          {getTabTitle()}
        </h2>
        <div className="flex items-center text-xs text-slate-400 mt-1 font-medium">
          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-500" />
          <span>{getTodayDate()}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Quick Budget Health Indicator */}
        <div className="hidden md:flex flex-col items-end">
          <div className="flex items-center text-xs space-x-1.5 mb-1 font-medium">
            <span className="text-slate-400">Budget Usage:</span>
            <span className={`font-semibold ${budgetUsagePercent > 90 ? 'text-rose-400' : budgetUsagePercent > 70 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {budgetUsagePercent.toFixed(0)}%
            </span>
          </div>
          <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700/50">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetUsagePercent > 90
                  ? 'bg-rose-500'
                  : budgetUsagePercent > 70
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${budgetUsagePercent}%` }}
            ></div>
          </div>
        </div>

        {/* Notifications and Profile */}
        <div className="flex items-center space-x-3 border-l border-slate-850 pl-6">
          <button className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all duration-150 relative cursor-pointer">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-violet-500 rounded-full"></span>
          </button>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center space-x-2 text-xs font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Sync</span>
          </div>
        </div>
      </div>
    </header>
  );
};
