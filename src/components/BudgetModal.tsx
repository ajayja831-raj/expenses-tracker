import React, { useState, useEffect } from 'react';
import { X, DollarSign, Target } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
  onSave: (newBudget: number) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  currentBudget,
  onSave,
}) => {
  const [budgetInput, setBudgetInput] = useState('');
  const [error, setError] = useState('');

  // Sync state with currentBudget when modal opens
  useEffect(() => {
    if (isOpen) {
      setBudgetInput(currentBudget.toString());
      setError('');
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetInput || isNaN(Number(budgetInput)) || Number(budgetInput) <= 0) {
      setError('Please enter a valid monthly budget limit greater than $0.');
      return;
    }

    onSave(Number(budgetInput));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 relative shadow-2xl z-10 animate-fade-in mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="p-2 bg-violet-600/10 border border-violet-500/20 text-violet-400 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold font-display text-white">Adjust Monthly Budget</h3>
        </div>

        <p className="text-xs text-slate-400 mb-6 leading-relaxed">
          Set a monthly spending limit for Acme Corp. This limit will be used to calculate budget health, warning notices, and remaining balance calculations on the main dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Budget Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Monthly Budget (USD)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                step="100"
                placeholder="e.g. 50000"
                value={budgetInput}
                onChange={(e) => {
                  setBudgetInput(e.target.value);
                  setError('');
                }}
                className={`w-full bg-slate-950 border ${
                  error ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                } rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-650 focus:outline-none focus:ring-4 transition-all`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-rose-400 text-xs mt-1.5 font-medium">{error}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
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
              Update Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
