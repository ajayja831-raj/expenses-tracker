import React, { useState } from 'react';
import type { Expense, Department } from '../types';
import { DollarSign, Edit3, Building, Save, X } from 'lucide-react';

interface DepartmentsProps {
  expenses: Expense[];
  deptBudgets: Record<Department, number>;
  onUpdateDeptBudget: (dept: Department, limit: number) => void;
}

export const Departments: React.FC<DepartmentsProps> = ({
  expenses,
  deptBudgets,
  onUpdateDeptBudget,
}) => {
  const departments: Department[] = ['Engineering', 'Marketing', 'Sales', 'Operations', 'HR'];

  // State for inline budget editing
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  // Get July spending for a department
  const getDeptSpending = (dept: Department) => {
    return expenses
      .filter((exp) => exp.department === dept && exp.date.startsWith('2026-07'))
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleEditClick = (dept: Department) => {
    setEditingDept(dept);
    setEditValue(deptBudgets[dept].toString());
    setError('');
  };

  const handleCancel = () => {
    setEditingDept(null);
    setError('');
  };

  const handleSave = (dept: Department) => {
    if (!editValue || isNaN(Number(editValue)) || Number(editValue) <= 0) {
      setError('Enter a budget limit > 0.');
      return;
    }

    onUpdateDeptBudget(dept, Number(editValue));
    setEditingDept(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold font-display text-white mb-1">Corporate Department Budgets</h3>
        <p className="text-xs text-slate-400">
          Track and set monthly budget caps per corporate department. Spending metrics represent **July 2026**.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => {
          const spending = getDeptSpending(dept);
          const limit = deptBudgets[dept] || 5000;
          const usagePercent = Math.min((spending / limit) * 100, 100);
          const isEditing = editingDept === dept;

          return (
            <div 
              key={dept}
              className="glass-panel rounded-2xl p-6 hover-lift border border-transparent flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-900 border border-slate-800 text-violet-400 rounded-xl">
                    <Building className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold font-display text-slate-200">{dept}</h4>
                </div>
                
                {!isEditing && (
                  <button
                    onClick={() => handleEditClick(dept)}
                    className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 hover:bg-slate-800 hover:text-white text-slate-400 transition-all cursor-pointer flex items-center space-x-1"
                    title="Change Budget Cap"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-semibold px-0.5">Cap</span>
                  </button>
                )}
              </div>

              {/* Inline Edit Form */}
              {isEditing ? (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 mb-5 animate-fade-in">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wide mb-1.5">
                    Set {dept} Budget (USD)
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-500">
                        <DollarSign className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => {
                          setEditValue(e.target.value);
                          setError('');
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg py-1.5 pl-7 pr-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => handleSave(dept)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                      title="Save"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {error && (
                    <p className="text-rose-450 text-[10px] mt-1 font-semibold">{error}</p>
                  )}
                </div>
              ) : (
                /* Stats Row */
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">July Spending</span>
                    <span className="text-lg font-bold text-white block mt-0.5">{formatCurrency(spending)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Budget Cap</span>
                    <span className="text-lg font-bold text-slate-350 block mt-0.5">{formatCurrency(limit)}</span>
                  </div>
                </div>
              )}

              {/* Progress Utilization */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                  <span>Utilization</span>
                  <span className={usagePercent > 90 ? 'text-rose-450 font-bold' : 'font-bold text-slate-300'}>
                    {usagePercent.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      usagePercent > 90 
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]' 
                        : usagePercent > 70 
                        ? 'bg-amber-500' 
                        : 'bg-violet-600'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
