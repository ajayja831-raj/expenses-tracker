import React, { useState } from 'react';
import type { ExpenseCategory, Expense, Department } from '../types';
import { X, DollarSign, Calendar, Tag, User, AlignLeft, Building } from 'lucide-react';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id'>) => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ isOpen, onClose, onSave }) => {
  const categories: ExpenseCategory[] = ['Software', 'Travel', 'Marketing', 'Salaries', 'Office', 'Other'];
  const departments: Department[] = ['Engineering', 'Marketing', 'Sales', 'Operations', 'HR'];

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Software');
  const [department, setDepartment] = useState<Department>('Engineering');
  const [merchant, setMerchant] = useState('');
  const [description, setDescription] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    if (!date) {
      newErrors.date = 'Please select a date';
    }
    if (!merchant.trim()) {
      newErrors.merchant = 'Please enter a merchant name';
    }
    if (!description.trim()) {
      newErrors.description = 'Please enter a brief description';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit
    onSave({
      amount: Number(amount),
      date,
      category,
      department,
      merchant: merchant.trim(),
      description: description.trim(),
    });

    // Reset Form
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Software');
    setDepartment('Engineering');
    setMerchant('');
    setDescription('');
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl z-10 animate-fade-in mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold font-display text-white mb-6">Log New Expense</h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Amount Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full bg-slate-950 border ${
                  errors.amount ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                } rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-605 focus:outline-none focus:ring-4 transition-all`}
              />
            </div>
            {errors.amount && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium flex items-center">
                <span>{errors.amount}</span>
              </p>
            )}
          </div>

          {/* Grid for Date and Merchant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full bg-slate-950 border ${
                    errors.date ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                  } rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.date && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.date}</p>
              )}
            </div>

            {/* Merchant Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Merchant
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. AWS, Slack, Uber"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className={`w-full bg-slate-950 border ${
                    errors.merchant ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                  } rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-605 focus:outline-none focus:ring-4 transition-all`}
                />
              </div>
              {errors.merchant && (
                <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.merchant}</p>
              )}
            </div>
          </div>

          {/* Grid for Category and Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Category
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Tag className="w-4 h-4" />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Department Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Department
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Building className="w-4 h-4" />
                </div>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-0 pl-3.5 flex items-start pointer-events-none text-slate-500">
                <AlignLeft className="w-4 h-4" />
              </div>
              <textarea
                rows={3}
                placeholder="Describe what was purchased..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-slate-950 border ${
                  errors.description ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                } rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-605 focus:outline-none focus:ring-4 transition-all resize-none`}
              />
            </div>
            {errors.description && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700/80 text-slate-300 font-semibold py-3 px-4 rounded-xl border border-slate-700/50 transition-all cursor-pointer text-center text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-violet-650/10 hover:shadow-violet-650/20 transition-all cursor-pointer text-center text-sm"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
