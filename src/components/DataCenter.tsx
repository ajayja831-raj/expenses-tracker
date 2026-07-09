import React, { useState } from 'react';
import type { Expense } from '../types';
import { Download, Database, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';

interface DataCenterProps {
  expenses: Expense[];
  onResetDatabase: () => void;
}

export const DataCenter: React.FC<DataCenterProps> = ({ expenses, onResetDatabase }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'spenda_expense_ledger.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Amount', 'Date', 'Category', 'Merchant', 'Description', 'Department'];
    const rows = expenses.map((exp) => [
      exp.id,
      exp.amount.toFixed(2),
      exp.date,
      exp.category,
      `"${exp.merchant.replace(/"/g, '""')}"`,
      `"${exp.description.replace(/"/g, '""')}"`,
      exp.department || '',
    ]);
    
    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute('download', 'spenda_expense_ledger.csv');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetClick = () => {
    setShowConfirmReset(true);
    setResetCompleted(false);
  };

  const handleConfirmReset = () => {
    onResetDatabase();
    setShowConfirmReset(false);
    setResetCompleted(true);
    setTimeout(() => setResetCompleted(false), 3000);
  };

  const handleCancelReset = () => {
    setShowConfirmReset(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold font-display text-white mb-1">Workspace Data Center</h3>
        <p className="text-xs text-slate-400">
          Manage your expense ledger data, download backups, or reset your environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-900 border border-slate-800 text-violet-400 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-display text-slate-200">Export Ledger</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Download your full transactions ledger. Use CSV for spreadsheet analyses (Excel, Google Sheets) or JSON for integration backups.
            </p>
          </div>

          <div className="flex space-x-3 mt-auto">
            <button
              onClick={exportToCsv}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl border border-slate-750/60 transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer"
            >
              <span>Download CSV</span>
            </button>
            <button
              onClick={exportToJson}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 px-4 rounded-xl border border-slate-750/60 transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer"
            >
              <span>Download JSON</span>
            </button>
          </div>
        </div>

        {/* Database Management / Reset Card */}
        <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-slate-900 border border-slate-800 text-amber-500 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-display text-slate-200">Wipe & Reset Workspace</h4>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Clear all local custom transactions and reset the database schema to the initial preloaded mock dataset.
            </p>
          </div>

          <div className="mt-auto">
            {showConfirmReset ? (
              <div className="bg-rose-950/20 border border-rose-500/25 p-4 rounded-xl space-y-3 animate-fade-in">
                <p className="text-[10px] text-rose-450 font-semibold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Wipe all custom transactions. This cannot be undone.</span>
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={handleConfirmReset}
                    className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Wipe
                  </button>
                  <button
                    onClick={handleCancelReset}
                    className="flex-1 bg-slate-850 hover:bg-slate-800 text-slate-450 text-[10px] font-bold py-1.5 px-3 rounded-lg border border-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : resetCompleted ? (
              <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Workspace database reset complete.</span>
              </div>
            ) : (
              <button
                onClick={handleResetClick}
                className="w-full bg-rose-950/20 hover:bg-rose-900/20 text-rose-400 hover:text-rose-300 font-semibold py-2.5 px-4 rounded-xl border border-rose-900/20 hover:border-rose-900/35 transition-colors flex items-center justify-center space-x-2 text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local Data</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
