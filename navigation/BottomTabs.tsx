import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';
import DashboardScreen from '../src/screens/DashboardScreen';
import IncomeScreen from '../src/screens/IncomeScreen';
import ExpensesScreen from '../src/screens/ExpensesScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
    const insets = useSafeAreaInsets();

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: true,
                headerStyle: { backgroundColor: colors.background, borderBottomWidth: 0 },
                headerTintColor: 'transparent',
                headerTitle: '',
                headerShadowVisible: false,
                tabBarStyle: [styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10), height: 70 + Math.max(insets.bottom, 0) }],
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: styles.label,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';
                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Income') {
                        iconName = focused ? 'trending-up' : 'trending-up-outline';
                    } else if (route.name === 'Expenses') {
                        iconName = focused ? 'wallet' : 'wallet-outline';
                    }
                    return (
                        <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                            <Ionicons name={iconName} size={22} color={color} />
                        </View>
                    );
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Inicio' }} />
            <Tab.Screen name="Income" component={IncomeScreen} options={{ tabBarLabel: 'Ingresos' }} />
            <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ tabBarLabel: 'Gastos' }} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.tabBar,
        borderTopColor: colors.tabBarBorder,
        borderTopWidth: 1,
        paddingTop: 6,
        elevation: 0,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -2,
    },
    iconWrap: {
        width: 44,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    iconWrapActive: {
        backgroundColor: 'rgba(0, 229, 176, 0.12)',
    },
});
