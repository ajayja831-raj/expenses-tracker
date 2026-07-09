import type { Expense } from './types';

export const INITIAL_BUDGET = 50000; // $50,000 monthly budget

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    amount: 1250.00,
    date: '2026-07-08',
    category: 'Software',
    merchant: 'AWS Cloud Services',
    description: 'Monthly cloud hosting and database services',
    department: 'Engineering'
  },
  {
    id: 'exp-2',
    amount: 340.50,
    date: '2026-07-07',
    category: 'Office',
    merchant: 'Staples',
    description: 'Office stationery and standing desk accessories',
    department: 'Operations'
  },
  {
    id: 'exp-3',
    amount: 4500.00,
    date: '2026-07-05',
    category: 'Marketing',
    merchant: 'Google Ads',
    description: 'Q3 Search campaign advertising',
    department: 'Marketing'
  },
  {
    id: 'exp-4',
    amount: 1200.00,
    date: '2026-07-03',
    category: 'Travel',
    merchant: 'Delta Airlines',
    description: 'Flight to tech conference in Chicago for engineering team',
    department: 'Engineering'
  },
  {
    id: 'exp-5',
    amount: 28000.00,
    date: '2026-06-30',
    category: 'Salaries',
    merchant: 'Paychex Payroll',
    description: 'June payroll for full-time employees',
    department: 'HR'
  },
  {
    id: 'exp-6',
    amount: 320.00,
    date: '2026-06-25',
    category: 'Software',
    merchant: 'Slack Technologies',
    description: 'Monthly communication platform license',
    department: 'Operations'
  },
  {
    id: 'exp-7',
    amount: 850.00,
    date: '2026-06-18',
    category: 'Travel',
    merchant: 'Hilton Hotels',
    description: 'Accommodation for business development trip',
    department: 'Sales'
  },
  {
    id: 'exp-8',
    amount: 1500.00,
    date: '2026-06-15',
    category: 'Marketing',
    merchant: 'Facebook Ads',
    description: 'Retargeting campaigns for product launch',
    department: 'Marketing'
  },
  {
    id: 'exp-9',
    amount: 450.00,
    date: '2026-06-12',
    category: 'Office',
    merchant: 'Blue Bottle Coffee',
    description: 'Monthly office coffee and snacks subscription',
    department: 'Operations'
  },
  {
    id: 'exp-10',
    amount: 28000.00,
    date: '2026-05-31',
    category: 'Salaries',
    merchant: 'Paychex Payroll',
    description: 'May payroll for full-time employees',
    department: 'HR'
  },
  {
    id: 'exp-11',
    amount: 1800.00,
    date: '2026-05-24',
    category: 'Other',
    merchant: 'LegalZoom',
    description: 'IP protection and trademark consultation',
    department: 'Operations'
  },
  {
    id: 'exp-12',
    amount: 600.00,
    date: '2026-05-15',
    category: 'Software',
    merchant: 'GitHub',
    description: 'Annual copilot and team enterprise licenses',
    department: 'Engineering'
  },
  {
    id: 'exp-13',
    amount: 98.00,
    date: '2026-05-10',
    category: 'Other',
    merchant: 'Namecheap',
    description: 'Domain renewals for upcoming project sites',
    department: 'Engineering'
  }
];
