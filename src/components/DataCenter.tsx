import React, { useState } from 'react';
import type { Expense } from '../types';
import { 
  Download, 
  Database, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle,
  Copy,
  Check,
  Terminal
} from 'lucide-react';

interface DataCenterProps {
  expenses: Expense[];
  onResetDatabase: () => void;
}

export const DataCenter: React.FC<DataCenterProps> = ({ expenses, onResetDatabase }) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  const exportToJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'ajay_expense_ledger.json');
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
    downloadAnchor.setAttribute('download', 'ajay_expense_ledger.csv');
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

  const sqlSetupCode = `-- 1. Create Profile / Budgets table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  company_name text not null,
  monthly_limit numeric default 50000 not null,
  dept_budgets jsonb default '{"Engineering":15000,"Marketing":10000,"Sales":8000,"Operations":5000,"HR":4000}'::jsonb not null
);

-- 2. Create Expenses table
create table public.expenses (
  id uuid default gen_random_uuid() primary key,
  amount numeric not null,
  date date not null,
  category text not null,
  merchant text not null,
  description text not null,
  department text not null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;

-- 4. Create RLS Policies for Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- 5. Create RLS Policies for Expenses
create policy "Users can view own expenses" on public.expenses for select using (auth.uid() = user_id);
create policy "Users can insert own expenses" on public.expenses for insert with check (auth.uid() = user_id);
create policy "Users can update own expenses" on public.expenses for update using (auth.uid() = user_id);
create policy "Users can delete own expenses" on public.expenses for delete using (auth.uid() = user_id);

-- 6. Trigger to automate profile creation on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, company_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'company_name', 'My Company'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlSetupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overview */}
      <div className="glass-panel rounded-2xl p-6">
        <h3 className="text-lg font-bold font-display text-white mb-1">Workspace Data Center</h3>
        <p className="text-xs text-slate-400">
          Manage your expense ledger data, download backups, or configure cloud settings.
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

      {/* Supabase SQL Setup Card */}
      <div className="glass-panel rounded-2xl p-6 hover-lift border border-transparent">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 border border-slate-800 text-teal-400 rounded-xl">
              <Terminal className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold font-display text-slate-200">Supabase Cloud Database Setup</h4>
          </div>
          <button
            onClick={copyToClipboard}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl border ${
              copied 
                ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-750/50 hover:text-white'
            } transition-all duration-200 text-[10px] font-bold cursor-pointer`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied SQL!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy SQL Code</span>
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-4">
          Copy and run this SQL script in your Supabase project's **SQL Editor** to automatically generate your tables, set up relational joins, enable Row Level Security, and configure automation triggers for signup synchronization.
        </p>
        <div className="relative bg-slate-950 rounded-xl border border-slate-900 overflow-hidden">
          <pre className="text-[10px] text-slate-450 p-4 font-mono overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950 text-left">
            {sqlSetupCode}
          </pre>
        </div>
      </div>
    </div>
  );
};
