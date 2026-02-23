export type IncomeSource = {
  id: string;
  name: string;
  amount: number;
  category: string;
  createdAt: string;
};

export type ExpenseType = 'regular' | 'subscription';

export type ExpenseItem = {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: ExpenseType;
  renewalDate?: string; // ISO string, only for subscriptions
  notificationId?: string; // expo notification id
  createdAt: string;
};
