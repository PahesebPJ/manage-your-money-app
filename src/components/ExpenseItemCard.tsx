import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { differenceInDays, parseISO } from 'date-fns';
import { colors } from '../theme/colors';
import { ExpenseItem } from '../types';

type Props = {
    item: ExpenseItem;
    onDelete: (id: string) => void;
};

const CATEGORY_ICONS: Record<string, string> = {
    'Suscripción': 'refresh-circle',
    'Crédito': 'card',
    'Servicios': 'flash',
    'Alimentación': 'fast-food',
    'Transporte': 'car',
    'Salud': 'medkit',
    'Entretenimiento': 'game-controller',
    'Otro': 'wallet',
};

function getDaysStatus(renewalDate: string): { days: number; color: string; label: string } {
    const days = differenceInDays(parseISO(renewalDate), new Date());
    if (days < 0) return { days, color: colors.danger, label: 'Vencida' };
    if (days <= 3) return { days, color: colors.danger, label: `${days}d` };
    if (days <= 7) return { days, color: colors.warning, label: `${days}d` };
    return { days, color: colors.accent, label: `${days}d` };
}

export default function ExpenseItemCard({ item, onDelete }: Props) {
    const iconName = (CATEGORY_ICONS[item.category] || 'wallet') as any;
    const isSubscription = item.type === 'subscription';
    const daysStatus = isSubscription && item.renewalDate ? getDaysStatus(item.renewalDate) : null;

    const handleDelete = () => {
        Alert.alert(
            'Eliminar gasto',
            `¿Eliminar "${item.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: () => onDelete(item.id),
                },
            ]
        );
    };

    return (
        <View style={styles.card}>
            <View style={[styles.iconWrap, { backgroundColor: colors.expenseBg }]}>
                <Ionicons name={iconName} size={20} color={colors.expense} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <View style={styles.meta}>
                    <Text style={styles.category}>{item.category}</Text>
                    {isSubscription && (
                        <View style={[styles.badge, { backgroundColor: daysStatus ? daysStatus.color + '22' : colors.accentGlow }]}>
                            <Ionicons name="sync-outline" size={10} color={daysStatus?.color || colors.accent} style={{ marginRight: 3 }} />
                            <Text style={[styles.badgeText, { color: daysStatus?.color || colors.accent }]}>
                                {daysStatus ? daysStatus.label : 'Sub'}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
            <Text style={styles.amount}>-${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Text>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    name: {
        color: colors.textPrimary,
        fontSize: 15,
        fontWeight: '600',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        gap: 6,
    },
    category: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
    },
    amount: {
        color: colors.expense,
        fontSize: 15,
        fontWeight: '700',
        marginRight: 10,
    },
    deleteBtn: {
        padding: 4,
    },
});
