import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Animated,
    Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LanguageContext';
import { IncomeSource } from '../types';

type Props = {
    item: IncomeSource;
    onDelete: (id: string) => void;
    index?: number;
    onEdit?: (item: IncomeSource) => void;
};

const CATEGORY_ICONS: Record<string, string> = {
    Salario: 'briefcase',
    Freelance: 'laptop',
    Inversiones: 'trending-up',
    Negocio: 'storefront',
    Renta: 'home',
    Otro: 'cash',
};

export default function IncomeItemCard({ item, onDelete, index = 0, onEdit }: Props) {
    const iconName = (CATEGORY_ICONS[item.category] || 'cash') as any;
    const { colors } = useTheme();
    const { t } = useTranslation();

    // Entrance animation (staggered by index)
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(18)).current;
    const scale = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(opacity, {
                toValue: 1,
                useNativeDriver: true,
                tension: 20,
                friction: 7,
                delay: index * 60,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                tension: 25,
                friction: 6,
                delay: index * 60,
            }),
        ]).start();
    }, []);

    const handlePressIn = () =>
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
    const handlePressOut = () =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 4 }).start();

    const handleDelete = () => {
        Alert.alert(
            t.alertDeleteIncomeTitle,
            t.alertDeleteIncomeMsg.replace('{name}', item.name),
            [
                { text: t.alertCancel, style: 'cancel' },
                {
                    text: t.alertDelete,
                    style: 'destructive',
                    onPress: () => onDelete(item.id),
                },
            ]
        );
    };

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
        actions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
        },
        actionBtn: {
            padding: 6,
        },
    });

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
            <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <View style={styles.card}>
                    <View style={styles.iconWrap}>
                        <Ionicons name={iconName} size={20} color={colors.accent} />
                    </View>
                    <View style={styles.info}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.category}>{(t.categories as any)[item.category] || item.category}</Text>
                    </View>
                    <Text style={styles.amount}>${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</Text>
                    <View style={styles.actions}>
                        {onEdit && (
                            <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionBtn}>
                                <Ionicons name="pencil-outline" size={18} color={colors.textSecondary} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleDelete} style={styles.actionBtn}>
                            <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>
            </Pressable>
        </Animated.View>
    );
}
