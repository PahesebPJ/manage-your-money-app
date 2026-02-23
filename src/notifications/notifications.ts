import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ExpenseItem } from '../types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('subscriptions', {
            name: 'Subscriptions',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
        });
    }
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function scheduleSubscriptionNotification(
    expense: ExpenseItem
): Promise<string | null> {
    if (!expense.renewalDate) return null;

    const renewal = new Date(expense.renewalDate);
    const triggerDate = new Date(renewal);
    triggerDate.setDate(triggerDate.getDate() - 3); // 3 days before

    if (triggerDate <= new Date()) return null; // Already passed

    try {
        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: '⚠️ Suscripción por renovar',
                body: `"${expense.name}" se renueva en 3 días ($${expense.amount.toFixed(2)})`,
                data: { expenseId: expense.id },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
            },
        });
        return id;
    } catch {
        return null;
    }
}

export async function cancelNotification(notificationId: string): Promise<void> {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch { }
}

export async function rescheduleAll(expenses: ExpenseItem[]): Promise<void> {
    for (const expense of expenses) {
        if (expense.type === 'subscription' && expense.renewalDate) {
            if (expense.notificationId) {
                await cancelNotification(expense.notificationId);
            }
        }
    }
    // Re-schedule is handled on app open via useEffect in App.tsx
}
