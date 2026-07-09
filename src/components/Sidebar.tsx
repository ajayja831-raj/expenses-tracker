import React from 'react';
import type { User } from '../types';
import { 
  LayoutDashboard, 
  Receipt, 
  DollarSign, 
  PieChart, 
  PlusCircle, 
  LogOut, 
  TrendingUp, 
  Building, 
  Database 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onAddExpenseClick: () => void;
  onSetBudgetClick: () => void;
  currentUser: User;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  onAddExpenseClick,
  onSetBudgetClick,
  currentUser,
  onLogout,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'departments', label: 'Departments', icon: Building },
    { id: 'datacenter', label: 'Data Center', icon: Database },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'CO';
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 flex-shrink-0">
      <div className="p-6 flex-1 flex flex-col min-h-0">
        {/* Logo / Brand */}
        <div className="flex items-center space-x-3 mb-10">
          <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-violet-500/20 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display tracking-tight text-white leading-none">Spenda</h1>
            <span className="text-xs text-slate-400 font-medium">Expense Tracker</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onAddExpenseClick}
          className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium py-3 px-4 rounded-xl shadow-lg shadow-violet-600/20 flex items-center justify-center space-x-2 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer mb-8 text-sm flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log Expense</span>
        </button>

        {/* Navigation Menu */}
        <nav className="space-y-1 overflow-y-auto flex-1 pr-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer text-sm ${
                  isActive
                    ? 'bg-slate-800 text-violet-400 font-medium border-l-4 border-violet-500 pl-3'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 border-t border-slate-800/80 flex-shrink-0">
        <button
          onClick={onSetBudgetClick}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 rounded-xl transition-all duration-150 cursor-pointer text-left text-sm"
        >
          <PieChart className="w-4 h-4 text-slate-400" />
          <span>Adjust Budget</span>
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 rounded-xl transition-all duration-150 cursor-pointer text-left text-sm mt-1"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        {/* User Card */}
        <div className="mt-6 flex items-center space-x-3 px-2 border-t border-slate-800/60 pt-4">
          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-violet-400 border border-slate-700 uppercase">
            {getInitials(currentUser.companyName)}
          </div>
          <div className="truncate flex-1">
            <p className="text-sm font-medium text-slate-200 truncate" title={currentUser.companyName}>
              {currentUser.companyName}
            </p>
            <p className="text-[10px] text-slate-500 truncate" title={currentUser.email}>
              {currentUser.email}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
