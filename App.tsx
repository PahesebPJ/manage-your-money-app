import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from './src/notifications/notifications';
import { getExpenseItems, updateExpenseItem } from './src/storage/storage';
import { scheduleSubscriptionNotification } from './src/notifications/notifications';
import BottomTabs from './navigation/BottomTabs';

import { ThemeProvider } from './src/theme/ThemeContext';
import { LanguageProvider } from './src/localization/LanguageContext';

export default function App() {
  useEffect(() => {
    const init = async () => {
      const granted = await requestNotificationPermissions();
      if (!granted) return;

      const expenses = await getExpenseItems();
      for (const expense of expenses) {
        if (expense.type === 'subscription' && expense.renewalDate) {
          // Cancel existing and re-schedule
          if (expense.notificationId) {
            try {
              await Notifications.cancelScheduledNotificationAsync(expense.notificationId);
            } catch { }
          }
          const newId = await scheduleSubscriptionNotification(expense);
          if (newId !== expense.notificationId) {
            await updateExpenseItem({ ...expense, notificationId: newId ?? undefined });
          }
        }
      }
    };
    init();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <BottomTabs />
          </NavigationContainer>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
