import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { colors } from '../theme/colors';
import { getIncomeSources, getExpenseItems } from '../storage/storage';
import { IncomeSource, ExpenseItem } from '../types';

export default function DashboardScreen() {
    const [income, setIncome] = useState<IncomeSource[]>([]);
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const load = async () => {
        const [inc, exp] = await Promise.all([getIncomeSources(), getExpenseItems()]);
        setIncome(inc);
        setExpenses(exp);
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

    const totalIncome = income.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpenses;

    const subscriptions = expenses.filter(
        (e) => e.type === 'subscription' && e.renewalDate
    ).sort((a, b) => {
        const dA = differenceInDays(parseISO(a.renewalDate!), new Date());
        const dB = differenceInDays(parseISO(b.renewalDate!), new Date());
        return dA - dB;
    });

    const expiringAlerts = subscriptions.filter((e) => {
        const d = differenceInDays(parseISO(e.renewalDate!), new Date());
        return d <= 7;
    });

    const fmt = (n: number) =>
        n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const today = format(new Date(), "MMMM yyyy", { locale: es });

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.greeting}>Capital</Text>
                    <Text style={styles.month}>{today}</Text>
                </View>
                <View style={styles.avatarWrap}>
                    <Ionicons name="person" size={18} color={colors.accent} />
                </View>
            </View>

            {/* Balance Card */}
            <LinearGradient
                colors={['#0D2A24', '#091A14']}
                style={styles.balanceCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.glowDot} />
                <Text style={styles.balanceLabel}>Balance mensual</Text>
                <Text style={[styles.balanceAmount, { color: balance >= 0 ? colors.accent : colors.expense }]}>
                    {balance < 0 ? '-' : ''}${fmt(Math.abs(balance))}
                </Text>
                <View style={styles.balanceRow}>
                    <View style={styles.balanceStat}>
                        <Ionicons name="arrow-up-circle" size={14} color={colors.accent} style={{ marginRight: 4 }} />
                        <Text style={styles.balanceStatLabel}>Ingresos</Text>
                        <Text style={styles.balanceStatValue}>${fmt(totalIncome)}</Text>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.balanceStat}>
                        <Ionicons name="arrow-down-circle" size={14} color={colors.expense} style={{ marginRight: 4 }} />
                        <Text style={styles.balanceStatLabel}>Gastos</Text>
                        <Text style={[styles.balanceStatValue, { color: colors.expense }]}>${fmt(totalExpenses)}</Text>
                    </View>
                </View>

                {/* Progress bar */}
                {totalIncome > 0 && (
                    <View style={styles.progressWrap}>
                        <View style={styles.progressTrack}>
                            <LinearGradient
                                colors={[colors.accentDim, colors.accent]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={[
                                    styles.progressFill,
                                    { width: `${Math.min((totalExpenses / totalIncome) * 100, 100)}%` },
                                ]}
                            />
                        </View>
                        <Text style={styles.progressLabel}>
                            {Math.round((totalExpenses / totalIncome) * 100)}% gastado
                        </Text>
                    </View>
                )}
            </LinearGradient>

            {/* Alerts */}
            {expiringAlerts.length > 0 && (
                <View style={styles.alertSection}>
                    <Text style={styles.sectionTitle}>⚠️ Suscripciones próximas</Text>
                    {expiringAlerts.map((sub) => {
                        const d = differenceInDays(parseISO(sub.renewalDate!), new Date());
                        const alertColor = d <= 3 ? colors.danger : colors.warning;
                        return (
                            <View key={sub.id} style={[styles.alertCard, { borderColor: alertColor + '44' }]}>
                                <View style={[styles.alertDot, { backgroundColor: alertColor }]} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.alertName}>{sub.name}</Text>
                                    <Text style={[styles.alertDays, { color: alertColor }]}>
                                        {d < 0 ? 'Vencida' : d === 0 ? 'Hoy' : `${d} día${d !== 1 ? 's' : ''} restante${d !== 1 ? 's' : ''}`}
                                    </Text>
                                </View>
                                <Text style={styles.alertAmount}>${fmt(sub.amount)}</Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Quick stats */}
            <Text style={styles.sectionTitle}>Resumen</Text>
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { borderColor: colors.accentGlow }]}>
                    <Text style={styles.statEmoji}>💰</Text>
                    <Text style={styles.statNum}>{income.length}</Text>
                    <Text style={styles.statLabel}>Fuentes de ingreso</Text>
                </View>
                <View style={[styles.statCard, { borderColor: colors.expenseBg }]}>
                    <Text style={styles.statEmoji}>💸</Text>
                    <Text style={styles.statNum}>{expenses.length}</Text>
                    <Text style={styles.statLabel}>Gastos registrados</Text>
                </View>
                <View style={[styles.statCard, { borderColor: colors.warningBg }]}>
                    <Text style={styles.statEmoji}>🔄</Text>
                    <Text style={styles.statNum}>{subscriptions.length}</Text>
                    <Text style={styles.statLabel}>Suscripciones</Text>
                </View>
            </View>

            {/* Upcoming subscriptions */}
            {subscriptions.length > 0 && (
                <>
                    <Text style={styles.sectionTitle}>Próximas renovaciones</Text>
                    {subscriptions.slice(0, 3).map((sub) => {
                        const d = differenceInDays(parseISO(sub.renewalDate!), new Date());
                        const dotColor = d < 0 ? colors.danger : d <= 3 ? colors.danger : d <= 7 ? colors.warning : colors.accent;
                        return (
                            <View key={sub.id} style={styles.subRow}>
                                <View style={[styles.subDot, { backgroundColor: dotColor }]} />
                                <Text style={styles.subName}>{sub.name}</Text>
                                <Text style={[styles.subDate, { color: dotColor }]}>
                                    {d < 0 ? 'Vencida' : d === 0 ? 'Hoy' : `en ${d}d`}
                                </Text>
                                <Text style={styles.subAmount}>${fmt(sub.amount)}</Text>
                            </View>
                        );
                    })}
                </>
            )}

            {income.length === 0 && expenses.length === 0 && (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🚀</Text>
                    <Text style={styles.emptyTitle}>¡Comienza ahora!</Text>
                    <Text style={styles.emptyText}>Agrega tus ingresos y gastos usando las tabs de abajo.</Text>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 8,
    },
    greeting: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
    month: { color: colors.textSecondary, fontSize: 13, textTransform: 'capitalize', marginTop: 2 },
    avatarWrap: {
        width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1, borderColor: colors.cardBorder,
        alignItems: 'center', justifyContent: 'center',
    },
    balanceCard: {
        borderRadius: 20,
        padding: 22,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.accentGlow,
    },
    glowDot: {
        position: 'absolute', bottom: -60, right: -60,
        width: 180, height: 180, borderRadius: 90,
        backgroundColor: colors.accentGlowStrong,
    },
    balanceLabel: { color: colors.textSecondary, fontSize: 13, fontWeight: '600', letterSpacing: 0.4 },
    balanceAmount: { fontSize: 42, fontWeight: '800', marginVertical: 6, letterSpacing: -1 },
    balanceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    balanceStat: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    balanceStatLabel: { color: colors.textSecondary, fontSize: 12, marginRight: 6 },
    balanceStatValue: { color: colors.accent, fontSize: 14, fontWeight: '700' },
    divider: { width: 1, height: 28, backgroundColor: colors.cardBorder, marginHorizontal: 16 },
    progressWrap: { marginTop: 16 },
    progressTrack: { height: 6, backgroundColor: colors.inputBorder, borderRadius: 3, overflow: 'hidden' },
    progressFill: { height: 6, borderRadius: 3 },
    progressLabel: { color: colors.textMuted, fontSize: 11, marginTop: 4 },
    alertSection: { marginBottom: 20 },
    alertCard: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.card, borderRadius: 12, padding: 12,
        marginTop: 8, borderWidth: 1,
    },
    alertDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    alertName: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
    alertDays: { fontSize: 12, marginTop: 2 },
    alertAmount: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
    sectionTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12, marginTop: 4 },
    statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
    statCard: {
        flex: 1, backgroundColor: colors.card, borderRadius: 14, padding: 14,
        borderWidth: 1, alignItems: 'center',
    },
    statEmoji: { fontSize: 22, marginBottom: 6 },
    statNum: { color: colors.textPrimary, fontSize: 22, fontWeight: '800' },
    statLabel: { color: colors.textMuted, fontSize: 11, textAlign: 'center', marginTop: 2 },
    subRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: colors.card, borderRadius: 12, padding: 12,
        marginBottom: 8, borderWidth: 1, borderColor: colors.cardBorder,
    },
    subDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
    subName: { color: colors.textPrimary, fontSize: 14, flex: 1 },
    subDate: { fontSize: 12, fontWeight: '700', marginRight: 10 },
    subAmount: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: '800', marginBottom: 8 },
    emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
