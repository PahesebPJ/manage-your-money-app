import AsyncStorage from '@react-native-async-storage/async-storage';
import { IncomeSource, ExpenseItem } from '../types';

const INCOME_KEY = '@moneyapp:income';
const EXPENSE_KEY = '@moneyapp:expenses';

// ─── Income ────────────────────────────────────────────────────────────────

export async function getIncomeSources(): Promise<IncomeSource[]> {
    try {
        const raw = await AsyncStorage.getItem(INCOME_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function saveIncomeSources(items: IncomeSource[]): Promise<void> {
    await AsyncStorage.setItem(INCOME_KEY, JSON.stringify(items));
}

export async function addIncomeSource(item: IncomeSource): Promise<void> {
    const existing = await getIncomeSources();
    existing.push(item);
    await saveIncomeSources(existing);
}

export async function deleteIncomeSource(id: string): Promise<void> {
    const existing = await getIncomeSources();
    await saveIncomeSources(existing.filter((i) => i.id !== id));
}

export async function updateIncomeSource(updated: IncomeSource): Promise<void> {
    const existing = await getIncomeSources();
    await saveIncomeSources(existing.map((i) => (i.id === updated.id ? updated : i)));
}

// ─── Expenses ──────────────────────────────────────────────────────────────

export async function getExpenseItems(): Promise<ExpenseItem[]> {
    try {
        const raw = await AsyncStorage.getItem(EXPENSE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export async function saveExpenseItems(items: ExpenseItem[]): Promise<void> {
    await AsyncStorage.setItem(EXPENSE_KEY, JSON.stringify(items));
}

export async function addExpenseItem(item: ExpenseItem): Promise<void> {
    const existing = await getExpenseItems();
    existing.push(item);
    await saveExpenseItems(existing);
}

export async function deleteExpenseItem(id: string): Promise<void> {
    const existing = await getExpenseItems();
    await saveExpenseItems(existing.filter((i) => i.id !== id));
}

export async function updateExpenseItem(updated: ExpenseItem): Promise<void> {
    const existing = await getExpenseItems();
    await saveExpenseItems(existing.map((i) => (i.id === updated.id ? updated : i)));
}

