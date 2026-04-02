import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    Animated,
    TouchableOpacity,
    LayoutAnimation,
    Platform,
    UIManager
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { differenceInDays, parseISO, format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LanguageContext';
import { getIncomeSources, getExpenseItems } from '../storage/storage';
import { IncomeSource, ExpenseItem } from '../types';
import FadeSlideIn from '../components/FadeSlideIn';
import SettingsModal from '../components/SettingsModal';

export default function DashboardScreen() {
    const [income, setIncome] = useState<IncomeSource[]>([]);
    const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [displayBalance, setDisplayBalance] = useState(0);
    const [settingsVisible, setSettingsVisible] = useState(false);

    const { colors } = useTheme();
    const { t, language } = useTranslation();

    // Animated values
    const balanceAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(0)).current;

    const load = async () => {
        const [inc, exp] = await Promise.all([getIncomeSources(), getExpenseItems()]);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIncome(inc);
        setExpenses(exp);
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const totalIncome = income.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const balance = totalIncome - totalExpenses;
    const spentPct = totalIncome > 0 ? Math.min(totalExpenses / totalIncome, 1) : 0;

    useEffect(() => {
        const startVal = displayBalance;
        balanceAnim.setValue(startVal);
        const listener = balanceAnim.addListener(({ value }) => {
            setDisplayBalance(value);
        });
        Animated.timing(balanceAnim, {
            toValue: balance,
            duration: 700,
            useNativeDriver: false,
        }).start(() => balanceAnim.removeListener(listener));
        return () => balanceAnim.removeListener(listener);
    }, [balance]);

    useEffect(() => {
        Animated.spring(progressAnim, {
            toValue: spentPct,
            useNativeDriver: false,
            tension: 20,
            friction: 7,
        }).start();
    }, [spentPct]);

    const onRefresh = async () => {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    };

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

    const dateLocale = language === 'en' ? enUS : es;
    const monthName = t.months[new Date().getMonth()];
    const year = new Date().getFullYear();
    const today = `${monthName} ${year}`;

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
        progressFillWrap: { height: 6 },
        progressFill: { flex: 1, height: 6, borderRadius: 3 },
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

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
            {/* Header */}
            <FadeSlideIn delay={0}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>{t.dashCapital}</Text>
                        <Text style={styles.month}>{today}</Text>
                    </View>
                    <TouchableOpacity style={styles.avatarWrap} onPress={() => setSettingsVisible(true)}>
                        <Ionicons name="settings" size={18} color={colors.accent} />
                    </TouchableOpacity>
                </View>
            </FadeSlideIn>

            {/* Balance Card */}
            <FadeSlideIn delay={80} distance={24}>
                <LinearGradient
                    colors={[colors.card, colors.backgroundSecondary]}
                    style={styles.balanceCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.glowDot} />
                    <Text style={styles.balanceLabel}>{t.dashMonthlyBalance}</Text>
                    <Text style={[styles.balanceAmount, { color: displayBalance >= 0 ? colors.accent : colors.expense }]}>
                        {displayBalance < 0 ? '-' : ''}${fmt(Math.abs(displayBalance))}
                    </Text>
                    <View style={styles.balanceRow}>
                        <View style={styles.balanceStat}>
                            <Ionicons name="arrow-up-circle" size={14} color={colors.accent} style={{ marginRight: 4 }} />
                            <Text style={styles.balanceStatLabel}>{t.dashIncome}</Text>
                            <Text style={styles.balanceStatValue}>${fmt(totalIncome)}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.balanceStat}>
                            <Ionicons name="arrow-down-circle" size={14} color={colors.expense} style={{ marginRight: 4 }} />
                            <Text style={styles.balanceStatLabel}>{t.dashExpenses}</Text>
                            <Text style={[styles.balanceStatValue, { color: colors.expense }]}>${fmt(totalExpenses)}</Text>
                        </View>
                    </View>

                    {totalIncome > 0 && (
                        <View style={styles.progressWrap}>
                            <View style={styles.progressTrack}>
                                <Animated.View
                                    style={[
                                        styles.progressFillWrap,
                                        {
                                            width: progressAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: ['0%', '100%'],
                                            }),
                                        },
                                    ]}
                                >
                                    <LinearGradient
                                        colors={[colors.accentDim, colors.accent]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.progressFill}
                                    />
                                </Animated.View>
                            </View>
                            <Text style={styles.progressLabel}>
                                {Math.round(spentPct * 100)}% {t.dashSpent}
                            </Text>
                        </View>
                    )}
                </LinearGradient>
            </FadeSlideIn>

            {expiringAlerts.length > 0 && (
                <FadeSlideIn delay={160}>
                    <View style={styles.alertSection}>
                        <Text style={styles.sectionTitle}>{t.dashUpcomingSubs}</Text>
                        {expiringAlerts.map((sub) => {
                            const d = differenceInDays(parseISO(sub.renewalDate!), new Date());
                            const alertColor = d <= 3 ? colors.danger : colors.warning;
                            return (
                                <View key={sub.id} style={[styles.alertCard, { borderColor: alertColor + '44' }]}>
                                    <View style={[styles.alertDot, { backgroundColor: alertColor }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.alertName}>{sub.name}</Text>
                                        <Text style={[styles.alertDays, { color: alertColor }]}>
                                            {d < 0 ? t.dashExpired : d === 0 ? t.dashToday : `${d} ${d !== 1 ? t.dashDaysLeft : t.dashDayLeft}`}
                                        </Text>
                                    </View>
                                    <Text style={styles.alertAmount}>${fmt(sub.amount)}</Text>
                                </View>
                            );
                        })}
                    </View>
                </FadeSlideIn>
            )}

            <FadeSlideIn delay={220}>
                <Text style={styles.sectionTitle}>{t.dashSummary}</Text>
                <View style={styles.statsRow}>
                    <View style={[styles.statCard, { borderColor: colors.accentGlow }]}>
                        <Text style={styles.statEmoji}>💰</Text>
                        <Text style={styles.statNum}>{income.length}</Text>
                        <Text style={styles.statLabel}>{t.dashIncomeSources}</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: colors.expenseBg }]}>
                        <Text style={styles.statEmoji}>💸</Text>
                        <Text style={styles.statNum}>{expenses.length}</Text>
                        <Text style={styles.statLabel}>{t.dashRegisteredExpenses}</Text>
                    </View>
                    <View style={[styles.statCard, { borderColor: colors.warningBg }]}>
                        <Text style={styles.statEmoji}>🔄</Text>
                        <Text style={styles.statNum}>{subscriptions.length}</Text>
                        <Text style={styles.statLabel}>{t.dashSubscriptions}</Text>
                    </View>
                </View>
            </FadeSlideIn>

            {subscriptions.length > 0 && (
                <FadeSlideIn delay={300}>
                    <Text style={styles.sectionTitle}>{t.dashUpcomingRenewals}</Text>
                    {subscriptions.slice(0, 3).map((sub) => {
                        const d = differenceInDays(parseISO(sub.renewalDate!), new Date());
                        const dotColor = d < 0 ? colors.danger : d <= 3 ? colors.danger : d <= 7 ? colors.warning : colors.accent;
                        return (
                            <View key={sub.id} style={styles.subRow}>
                                <View style={[styles.subDot, { backgroundColor: dotColor }]} />
                                <Text style={styles.subName}>{sub.name}</Text>
                                <Text style={[styles.subDate, { color: dotColor }]}>
                                    {d < 0 ? t.dashExpired : d === 0 ? t.dashToday : t.dashDaysIn.replace('{d}', d.toString())}
                                </Text>
                                <Text style={styles.subAmount}>${fmt(sub.amount)}</Text>
                            </View>
                        );
                    })}
                </FadeSlideIn>
            )}

            {income.length === 0 && expenses.length === 0 && (
                <FadeSlideIn delay={200} distance={30}>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🚀</Text>
                        <Text style={styles.emptyTitle}>{t.dashStartNowTitle}</Text>
                        <Text style={styles.emptyText}>{t.dashStartNowText}</Text>
                    </View>
                </FadeSlideIn>
            )}

            <SettingsModal visible={settingsVisible} onClose={() => setSettingsVisible(false)} />
        </ScrollView>
    );
}
