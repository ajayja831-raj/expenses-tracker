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

function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ajay_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global database of all expenses across all users
  const [allExpenses, setAllExpenses] = useState<Expense[]>(() => {
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

  // Sync session and database state when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('ajay_current_user', JSON.stringify(currentUser));
      // Load user-specific budget
      const savedBudget = localStorage.getItem(`ajay_budget_${currentUser.email}`);
      setMonthlyBudget(savedBudget ? Number(savedBudget) : INITIAL_BUDGET);

      // Load user-specific department budgets
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

  // Sync expenses updates to localStorage
  useEffect(() => {
    localStorage.setItem('ajay_expenses', JSON.stringify(allExpenses));
  }, [allExpenses]);

  // Filter expenses for the current active user
  const userExpenses = currentUser
    ? allExpenses.filter(exp => !exp.userEmail || exp.userEmail === currentUser.email)
    : [];

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    
    // For newly registered accounts, check if they have any expenses. If none, seed 2 sample onboarding expenses so the charts look good!
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id' | 'userEmail'>) => {
    if (!currentUser) return;
    const newExpense: Expense = {
      ...newExpenseData,
      id: `exp-${Date.now()}`,
      userEmail: currentUser.email
    };
    setAllExpenses((prev) => [newExpense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setAllExpenses((prev) => prev.filter((exp) => exp.id !== id));
  };

  const handleSaveBudget = (newBudget: number) => {
    if (!currentUser) return;
    setMonthlyBudget(newBudget);
    localStorage.setItem(`ajay_budget_${currentUser.email}`, newBudget.toString());
  };

  const handleUpdateDeptBudget = (dept: Department, limit: number) => {
    if (!currentUser) return;
    const updated = {
      ...deptBudgets,
      [dept]: limit
    };
    setDeptBudgets(updated);
    localStorage.setItem(`ajay_dept_budgets_${currentUser.email}`, JSON.stringify(updated));
  };

  const handleResetDatabase = () => {
    if (!currentUser) return;
    
    // Clear user's expenses from global list
    const filtered = allExpenses.filter(exp => exp.userEmail !== currentUser.email);
    
    // Create new seeded expenses for this user
    const seeded = INITIAL_EXPENSES.map(exp => ({
      ...exp,
      userEmail: currentUser.email
    }));
    
    setAllExpenses([...seeded, ...filtered]);
    
    // Reset user budget
    setMonthlyBudget(INITIAL_BUDGET);
    localStorage.removeItem(`ajay_budget_${currentUser.email}`);
    
    // Reset department budgets
    const defaultDepts: Record<Department, number> = {
      Engineering: 15000,
      Marketing: 10000,
      Sales: 8000,
      Operations: 5000,
      HR: 4000
    };
    setDeptBudgets(defaultDepts);
    localStorage.setItem(`ajay_dept_budgets_${currentUser.email}`, JSON.stringify(defaultDepts));
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
    <div className="flex bg-[#0b0f19] min-h-screen text-slate-100 font-sans">
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
