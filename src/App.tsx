import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseForm } from './components/ExpenseForm';
import { BudgetModal } from './components/BudgetModal';
import { Auth } from './components/Auth';
import { Analytics } from './components/Analytics';
import { Departments } from './components/Departments';
import { DataCenter } from './components/DataCenter';
import type { Expense, User, Department } from './types';
import { INITIAL_BUDGET, INITIAL_EXPENSES } from './mockData';
import { supabase, isSupabaseConfigured } from './supabaseClient';

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (isSupabaseConfigured) return null; // Let useEffect load it from Supabase session
    const saved = localStorage.getItem('ajay_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global database of all expenses across all users
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => {
    if (isSupabaseConfigured) return []; // Loaded from Supabase DB
    const saved = localStorage.getItem('ajay_expenses');
    if (saved) {
      return JSON.parse(saved);
    } else {
      // Seed default expenses with demo email
      const seeded = INITIAL_EXPENSES.map(exp => ({
        ...exp,
        userEmail: 'demo@company.com'
      }));
      localStorage.setItem('ajay_expenses', JSON.stringify(seeded));
      return seeded;
    }
  });

  // User-specific monthly budget
  const [monthlyBudget, setMonthlyBudget] = useState<number>(INITIAL_BUDGET);

  // User-specific department budgets
  const [deptBudgets, setDeptBudgets] = useState<Record<Department, number>>({
    Engineering: 15000,
    Marketing: 10000,
    Sales: 8000,
    Operations: 5000,
    HR: 4000
  });

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // 1. Supabase Session Sync on Load
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setCurrentUser(null);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email || '');
      } else {
        setCurrentUser(null);
        setAllExpenses([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_name, monthly_limit, dept_budgets')
      .eq('id', userId)
      .single();

    if (profile) {
      setCurrentUser({ email, companyName: profile.company_name });
      setMonthlyBudget(Number(profile.monthly_limit));
      if (profile.dept_budgets) {
        setDeptBudgets(profile.dept_budgets as Record<Department, number>);
      }
    } else {
      // Setup a default company if profile hasn't initialized from trigger
      setCurrentUser({ email, companyName: 'My Company' });
    }

    // Fetch expenses
    fetchUserExpenses(userId, email);
  };

  const fetchUserExpenses = async (userId: string, email: string) => {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (data && !error) {
      const mapped: Expense[] = data.map((item) => ({
        id: item.id,
        amount: Number(item.amount),
        date: item.date,
        category: item.category as any,
        merchant: item.merchant,
        description: item.description,
        department: item.department as any,
        userEmail: email,
      }));
      setAllExpenses(mapped);
    }
  };

  // 2. Sync session and database state (Local Storage mode only)
  useEffect(() => {
    if (isSupabaseConfigured) return;
    if (currentUser) {
      localStorage.setItem('ajay_current_user', JSON.stringify(currentUser));
      const savedBudget = localStorage.getItem(`ajay_budget_${currentUser.email}`);
      setMonthlyBudget(savedBudget ? Number(savedBudget) : INITIAL_BUDGET);

      const savedDeptBudgets = localStorage.getItem(`ajay_dept_budgets_${currentUser.email}`);
      if (savedDeptBudgets) {
        setDeptBudgets(JSON.parse(savedDeptBudgets));
      } else {
        const defaultDepts: Record<Department, number> = {
          Engineering: 15000,
          Marketing: 10000,
          Sales: 8000,
          Operations: 5050,
          HR: 4000
        };
        setDeptBudgets(defaultDepts);
        localStorage.setItem(`ajay_dept_budgets_${currentUser.email}`, JSON.stringify(defaultDepts));
      }
    } else {
      localStorage.removeItem('ajay_current_user');
    }
  }, [currentUser]);

  // Sync expenses updates to localStorage (Local Storage mode only)
  useEffect(() => {
    if (isSupabaseConfigured) return;
    localStorage.setItem('ajay_expenses', JSON.stringify(allExpenses));
  }, [allExpenses]);

  // Filter expenses for the current active user
  const userExpenses = isSupabaseConfigured 
    ? allExpenses // In Supabase mode, allExpenses is already scoped to the logged-in user
    : (currentUser ? allExpenses.filter(exp => !exp.userEmail || exp.userEmail === currentUser.email) : []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    
    // For newly registered accounts (Local Storage mode only), seed 2 sample onboarding expenses
    if (!isSupabaseConfigured) {
      const isNewUser = user.email !== 'demo@company.com' && !allExpenses.some(exp => exp.userEmail === user.email);
      if (isNewUser) {
        const onboardingExpenses: Expense[] = [
          {
            id: `exp-onboard-1`,
            amount: 1250.00,
            date: '2026-07-09',
            category: 'Software',
            merchant: 'AWS Cloud Services',
            description: 'Hosting infrastructure servers',
            userEmail: user.email,
            department: 'Engineering'
          },
          {
            id: `exp-onboard-2`,
            amount: 3500.00,
            date: '2026-07-08',
            category: 'Marketing',
            merchant: 'Google Ads',
            description: 'Search network campaign Q3',
            userEmail: user.email,
            department: 'Marketing'
          }
        ];
        setAllExpenses(prev => [...onboardingExpenses, ...prev]);
      }
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleAddExpense = async (newExpenseData: Omit<Expense, 'id' | 'userEmail'>) => {
    if (!currentUser) return;

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('expenses')
        .insert({
          amount: newExpenseData.amount,
          date: newExpenseData.date,
          category: newExpenseData.category,
          merchant: newExpenseData.merchant,
          description: newExpenseData.description,
          department: newExpenseData.department || 'Operations',
          user_id: user.id
        })
        .select()
        .single();
      
      if (data && !error) {
        const added: Expense = {
          id: data.id,
          amount: Number(data.amount),
          date: data.date,
          category: data.category as any,
          merchant: data.merchant,
          description: data.description,
          department: data.department as any,
          userEmail: currentUser.email,
        };
        setAllExpenses((prev) => [added, ...prev]);
      }
    } else {
      const newExpense: Expense = {
        ...newExpenseData,
        id: `exp-${Date.now()}`,
        userEmail: currentUser.email
      };
      setAllExpenses((prev) => [newExpense, ...prev]);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
      
      if (!error) {
        setAllExpenses((prev) => prev.filter((exp) => exp.id !== id));
      }
    } else {
      setAllExpenses((prev) => prev.filter((exp) => exp.id !== id));
    }
  };

  const handleSaveBudget = async (newBudget: number) => {
    if (!currentUser) return;

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ monthly_limit: newBudget })
        .eq('id', user.id);
      
      if (!error) {
        setMonthlyBudget(newBudget);
      }
    } else {
      setMonthlyBudget(newBudget);
      localStorage.setItem(`ajay_budget_${currentUser.email}`, newBudget.toString());
    }
  };

  const handleUpdateDeptBudget = async (dept: Department, limit: number) => {
    if (!currentUser) return;

    const updatedBudgets = {
      ...deptBudgets,
      [dept]: limit
    };

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ dept_budgets: updatedBudgets })
        .eq('id', user.id);
      
      if (!error) {
        setDeptBudgets(updatedBudgets);
      }
    } else {
      setDeptBudgets(updatedBudgets);
      localStorage.setItem(`ajay_dept_budgets_${currentUser.email}`, JSON.stringify(updatedBudgets));
    }
  };

  const handleResetDatabase = async () => {
    if (!currentUser) return;

    if (isSupabaseConfigured) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Wipe current user's expenses
      await supabase.from('expenses').delete().eq('user_id', user.id);

      // Seed initial default data for user in Supabase
      const insertData = INITIAL_EXPENSES.map(exp => ({
        amount: exp.amount,
        date: exp.date,
        category: exp.category,
        merchant: exp.merchant,
        description: exp.description,
        department: exp.department || 'Operations',
        user_id: user.id
      }));

      await supabase.from('expenses').insert(insertData);

      // Reset budget profiles
      const defaultDepts = {
        Engineering: 15000,
        Marketing: 10000,
        Sales: 8000,
        Operations: 5000,
        HR: 4000
      };

      await supabase.from('profiles').update({
        monthly_limit: INITIAL_BUDGET,
        dept_budgets: defaultDepts
      }).eq('id', user.id);

      // Re-fetch profile and budgets
      fetchProfile(user.id, currentUser.email);
    } else {
      const filtered = allExpenses.filter(exp => exp.userEmail !== currentUser.email);
      const seeded = INITIAL_EXPENSES.map(exp => ({
        ...exp,
        userEmail: currentUser.email
      }));
      
      setAllExpenses([...seeded, ...filtered]);
      setMonthlyBudget(INITIAL_BUDGET);
      localStorage.removeItem(`ajay_budget_${currentUser.email}`);
      
      const defaultDepts: Record<Department, number> = {
        Engineering: 15000,
        Marketing: 10000,
        Sales: 8000,
        Operations: 5000,
        HR: 4000
      };
      setDeptBudgets(defaultDepts);
      localStorage.setItem(`ajay_dept_budgets_${currentUser.email}`, JSON.stringify(defaultDepts));
    }
  };

  // If not logged in, render the login/signup screen
  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // Calculate current month July spending
  const currentMonthSpending = userExpenses
    .filter((exp) => exp.date.startsWith('2026-07'))
    .reduce((sum, exp) => sum + exp.amount, 0);

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            expenses={userExpenses}
            monthlyBudget={monthlyBudget}
            onSetBudgetClick={() => setIsBudgetModalOpen(true)}
            onViewAllClick={() => setCurrentTab('expenses')}
          />
        );
      case 'expenses':
        return (
          <ExpenseTable
            expenses={userExpenses}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'analytics':
        return <Analytics expenses={userExpenses} />;
      case 'departments':
        return (
          <Departments
            expenses={userExpenses}
            deptBudgets={deptBudgets}
            onUpdateDeptBudget={handleUpdateDeptBudget}
          />
        );
      case 'datacenter':
        return (
          <DataCenter
            expenses={userExpenses}
            onResetDatabase={handleResetDatabase}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col bg-[#0b0f19] min-h-screen text-slate-100 font-sans">
      {/* Configuration Status Banner */}
      {!isSupabaseConfigured && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-600/15 to-amber-500/10 border-b border-amber-500/15 py-2.5 px-4 text-center text-[10.5px] font-semibold text-amber-400 select-none z-20 flex items-center justify-center space-x-2">
          <span>⚠️ Local Sandbox Active. To persist data in the cloud with Supabase, copy the <code>.env.example</code> file to <code>.env</code> and fill in your keys.</span>
        </div>
      )}

      <div className="flex flex-1 min-h-0">
        {/* Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onAddExpenseClick={() => setIsExpenseModalOpen(true)}
          onSetBudgetClick={() => setIsBudgetModalOpen(true)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* Main Content Pane */}
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
          <Header
            currentTab={currentTab}
            totalExpenses={currentMonthSpending}
            monthlyBudget={monthlyBudget}
          />

          <main className="p-8 max-w-7xl w-full mx-auto flex-1">
            {renderActiveTab()}
          </main>
        </div>
      </div>

      {/* Modals & Overlays */}
      <ExpenseForm
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleAddExpense}
      />

      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentBudget={monthlyBudget}
        onSave={handleSaveBudget}
      />
    </div>
  );
}

export default App;
