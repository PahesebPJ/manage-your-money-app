import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { IncomeSource } from '../types';

type Props = {
    item: IncomeSource;
    onDelete: (id: string) => void;
};

const CATEGORY_ICONS: Record<string, string> = {
    Salario: 'briefcase',
    Freelance: 'laptop',
    Inversiones: 'trending-up',
    Negocio: 'storefront',
    Renta: 'home',
    Otro: 'cash',
};

export default function IncomeItemCard({ item, onDelete }: Props) {
    const iconName = (CATEGORY_ICONS[item.category] || 'cash') as any;

    const handleDelete = () => {
        Alert.alert(
            'Eliminar ingreso',
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
            <View style={styles.iconWrap}>
                <Ionicons name={iconName} size={20} color={colors.accent} />
            </View>
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.amount}>${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Text>
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
        backgroundColor: colors.accentGlow,
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
    category: {
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    amount: {
        color: colors.accent,
        fontSize: 15,
        fontWeight: '700',
        marginRight: 10,
    },
    deleteBtn: {
        padding: 4,
    },
});
