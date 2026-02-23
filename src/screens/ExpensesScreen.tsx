import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { getExpenseItems, addExpenseItem, deleteExpenseItem } from '../storage/storage';
import { ExpenseItem } from '../types';
import ExpenseItemCard from '../components/ExpenseItemCard';
import AddItemModal, { AddItemFormData } from '../components/AddItemModal';
import {
    scheduleSubscriptionNotification,
    cancelNotification,
    requestNotificationPermissions,
} from '../notifications/notifications';

function uuid(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function ExpensesScreen() {
    const [items, setItems] = useState<ExpenseItem[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [filter, setFilter] = useState<'all' | 'regular' | 'subscription'>('all');
    const fabScale = useRef(new Animated.Value(1)).current;

    const onFabPressIn = () =>
        Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    const onFabPressOut = () =>
        Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

    const load = async () => {
        const data = await getExpenseItems();
        setItems(data);
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const handleSave = async (data: AddItemFormData) => {
        const newItem: ExpenseItem = {
            id: uuid(),
            name: data.name,
            amount: parseFloat(data.amount.replace(',', '.')),
            category: data.category,
            type: data.type,
            renewalDate: data.renewalDate || undefined,
            createdAt: new Date().toISOString(),
        };

        if (newItem.type === 'subscription' && newItem.renewalDate) {
            const granted = await requestNotificationPermissions();
            if (granted) {
                const notifId = await scheduleSubscriptionNotification(newItem);
                if (notifId) newItem.notificationId = notifId;
            }
        }

        await addExpenseItem(newItem);
        setModalVisible(false);
        load();
    };

    const handleDelete = async (id: string) => {
        const item = items.find((i) => i.id === id);
        if (item?.notificationId) {
            await cancelNotification(item.notificationId);
        }
        await deleteExpenseItem(id);
        load();
    };

    const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);
    const total = items.reduce((s, i) => s + i.amount, 0);
    const subTotal = items.filter((i) => i.type === 'subscription').reduce((s, i) => s + i.amount, 0);
    const fmt = (n: number) => n.toLocaleString('es-MX', { minimumFractionDigits: 2 });

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Gastos</Text>
                    <Text style={styles.subtitle}>{items.length} gasto{items.length !== 1 ? 's' : ''} registrado{items.length !== 1 ? 's' : ''}</Text>
                </View>
                <View style={styles.totalBadge}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>-${fmt(total)}</Text>
                </View>
            </View>

            {/* Sub chips row */}
            <View style={styles.subRow}>
                <View style={styles.subChip}>
                    <Ionicons name="sync-outline" size={12} color={colors.warning} style={{ marginRight: 4 }} />
                    <Text style={styles.subChipText}>Suscripciones: ${fmt(subTotal)}/mes</Text>
                </View>
            </View>

            {/* Filter tabs */}
            <View style={styles.filterRow}>
                {(['all', 'regular', 'subscription'] as const).map((f) => (
                    <TouchableOpacity
                        key={f}
                        style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                            {f === 'all' ? 'Todos' : f === 'regular' ? 'Regulares' : 'Suscripciones'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(i) => i.id}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => <ExpenseItemCard item={item} onDelete={handleDelete} index={index} />}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>💸</Text>
                        <Text style={styles.emptyTitle}>Sin gastos</Text>
                        <Text style={styles.emptyText}>Presiona el botón + para registrar un gasto o suscripción.</Text>
                    </View>
                }
            />

            {/* FAB */}
            <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    style={styles.fabInner}
                    onPress={() => setModalVisible(true)}
                    onPressIn={onFabPressIn}
                    onPressOut={onFabPressOut}
                >
                    <Ionicons name="add" size={28} color={colors.black} />
                </TouchableOpacity>
            </Animated.View>

            <AddItemModal
                visible={modalVisible}
                mode="expense"
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 6,
    },
    title: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
    subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
    totalBadge: {
        backgroundColor: colors.expenseBg,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.expense + '44',
        paddingHorizontal: 14,
        paddingVertical: 8,
        alignItems: 'flex-end',
    },
    totalLabel: { color: colors.expense, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    totalAmount: { color: colors.expense, fontSize: 18, fontWeight: '800' },
    subRow: { paddingHorizontal: 20, paddingVertical: 6 },
    subChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.warningBg,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: colors.warning + '33',
    },
    subChipText: { color: colors.warning, fontSize: 12, fontWeight: '600' },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 8,
    },
    filterBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    filterBtnActive: {
        backgroundColor: colors.accentGlow,
        borderColor: colors.accent,
    },
    filterText: { color: colors.textSecondary, fontSize: 13 },
    filterTextActive: { color: colors.accent, fontWeight: '700' },
    list: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 },
    empty: { alignItems: 'center', marginTop: 80 },
    emptyEmoji: { fontSize: 48, marginBottom: 16 },
    emptyTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 8 },
    emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 30 },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: colors.accent,
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    fabInner: {
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
