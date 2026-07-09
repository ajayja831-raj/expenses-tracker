export type ExpenseCategory = 'Software' | 'Travel' | 'Marketing' | 'Salaries' | 'Office' | 'Other';

export type Department = 'Engineering' | 'Marketing' | 'Sales' | 'Operations' | 'HR';

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category: ExpenseCategory;
  merchant: string;
  description: string;
  userEmail?: string;
  department?: Department; // Links expense to a corporate department
}

export interface Budget {
  monthlyLimit: number;
}

export interface User {
  email: string;
  companyName: string;
}

export interface Account {
  email: string;
  password?: string;
  companyName: string;
}
