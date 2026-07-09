import React, { useState } from 'react';
import type { Expense, ExpenseCategory } from '../types';
import { 
  Search, 
  ArrowUpDown, 
  Trash2, 
  X, 
  ChevronUp, 
  ChevronDown, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface ExpenseTableProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';

export const ExpenseTable: React.FC<ExpenseTableProps> = ({ expenses, onDeleteExpense }) => {
  const categories: (ExpenseCategory | 'All')[] = ['All', 'Software', 'Travel', 'Marketing', 'Salaries', 'Office', 'Other'];

  const categoryConfig: Record<ExpenseCategory, { text: string; dot: string }> = {
    Software: { text: 'text-indigo-400', dot: 'bg-indigo-500' },
    Travel: { text: 'text-amber-400', dot: 'bg-amber-500' },
  		Marketing: { text: 'text-rose-400', dot: 'bg-rose-500' },
  		Salaries: { text: 'text-emerald-400', dot: 'bg-emerald-500' },
  		Office: { text: 'text-sky-400', dot: 'bg-sky-500' },
  		Other: { text: 'text-slate-400', dot: 'bg-slate-500' },
  };

  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | 'All'>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Handle Sort changes
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setStartDate('');
    setEndDate('');
  };

  // Filter and sort the expenses list
  const filteredExpenses = expenses
    .filter((exp) => {
      // 1. Search Term Filter
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        exp.merchant.toLowerCase().includes(term) || 
        exp.description.toLowerCase().includes(term);

      // 2. Category Filter
      const matchCategory = selectedCategory === 'All' || exp.category === selectedCategory;

      // 3. Date range filters
      let matchDate = true;
      if (startDate) {
        matchDate = matchDate && exp.date >= startDate;
      }
      if (endDate) {
        matchDate = matchDate && exp.date <= endDate;
      }

      return matchSearch && matchCategory && matchDate;
    })
    .sort((a, b) => {
      // 4. Sorting logic
      if (sortField === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'All' || startDate !== '' || endDate !== '';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1.5 opacity-50" />;
    return sortOrder === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 ml-1.5 text-violet-400" />
      : <ChevronDown className="w-3.5 h-3.5 ml-1.5 text-violet-400" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Filtering Actions Panel */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by merchant or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all"
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full lg:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as ExpenseCategory | 'All')}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all cursor-pointer appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filters */}
          <div className="flex items-center space-x-2 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-36">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                placeholder="From Date"
              />
            </div>
            <span className="text-slate-500 text-xs font-semibold">to</span>
            <div className="relative flex-1 lg:w-36">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-300 focus:outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all"
                placeholder="To Date"
              />
            </div>
          </div>

          {/* Clear button */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center space-x-1.5 px-4 py-2.5 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all text-xs font-semibold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Expense Table Panel */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold font-display text-slate-100 mb-1">Expense Ledger</h4>
            <p className="text-xs text-slate-400">
              Showing {filteredExpenses.length} of {expenses.length} records
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/50 text-[10px] text-slate-400 uppercase font-bold tracking-wider select-none bg-slate-900/20">
                <th className="py-4 px-6 font-bold">Merchant</th>
                <th className="py-4 px-6 font-bold">Category</th>
                <th 
                  className="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    {getSortIcon('date')}
                  </div>
                </th>
                <th 
                  className="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors text-right"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center justify-end">
                    <span>Amount</span>
                    {getSortIcon('amount')}
                  </div>
                </th>
                <th className="py-4 px-6 text-center font-bold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30 text-xs">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-900/35 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-200">{expense.merchant}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5 max-w-sm truncate font-medium">
                      {expense.description}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-805 ${categoryConfig[expense.category].text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${categoryConfig[expense.category].dot} mr-1.5`}></span>
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-semibold">
                    <div className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      <span>
                        {new Date(expense.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-white text-sm">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-850 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center space-y-2">
                      <AlertCircle className="w-8 h-8 text-slate-600" />
                      <span>No matching expenses found.</span>
                      {hasActiveFilters && (
                        <button
                          onClick={handleClearFilters}
                          className="text-xs text-violet-400 hover:underline font-semibold"
                        >
                          Clear all filters
                        </button>
                      )}
                    </div>
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
