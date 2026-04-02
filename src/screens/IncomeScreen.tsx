import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    Animated,
    LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LanguageContext';
import { getIncomeSources, addIncomeSource, deleteIncomeSource, updateIncomeSource } from '../storage/storage';
import { IncomeSource } from '../types';
import IncomeItemCard from '../components/IncomeItemCard';
import AddItemModal, { AddItemFormData } from '../components/AddItemModal';

function uuid(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export default function IncomeScreen() {
    const [items, setItems] = useState<IncomeSource[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editData, setEditData] = useState<AddItemFormData | null>(null);
    const fabScale = useRef(new Animated.Value(1)).current;

    const { colors } = useTheme();
    const { t } = useTranslation();

    const onFabPressIn = () =>
        Animated.spring(fabScale, { toValue: 0.88, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    const onFabPressOut = () =>
        Animated.spring(fabScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 10 }).start();

    const load = async () => {
        const data = await getIncomeSources();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setItems(data);
    };

    useFocusEffect(
        useCallback(() => {
            load();
        }, [])
    );

    const handleOpenAdd = () => {
        setEditData(null);
        setModalVisible(true);
    };

    const handleOpenEdit = (item: IncomeSource) => {
        setEditData({
            id: item.id,
            name: item.name,
            amount: item.amount.toString(),
            category: item.category,
            type: 'regular',
            renewalDate: '',
        });
        setModalVisible(true);
    };

    const handleSave = async (data: AddItemFormData) => {
        if (data.id) {
            // Update
            const existing = items.find(i => i.id === data.id);
            if (existing) {
                const updatedItem: IncomeSource = {
                    ...existing,
                    name: data.name,
                    amount: parseFloat(data.amount.replace(',', '.')),
                    category: data.category,
                };
                await updateIncomeSource(updatedItem);
            }
        } else {
            // Add new
            const newItem: IncomeSource = {
                id: uuid(),
                name: data.name,
                amount: parseFloat(data.amount.replace(',', '.')),
                category: data.category,
                createdAt: new Date().toISOString(),
            };
            await addIncomeSource(newItem);
        }
        setModalVisible(false);
        setEditData(null);
        load();
    };

    const handleDelete = async (id: string) => {
        await deleteIncomeSource(id);
        load();
    };

    const total = items.reduce((s, i) => s + i.amount, 0);
    const fmt = (n: number) =>
        n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const styles = StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.background },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 10,
        },
        title: { color: colors.textPrimary, fontSize: 24, fontWeight: '800' },
        subtitle: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
        totalBadge: {
            backgroundColor: colors.incomeBg,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.accent + '44',
            paddingHorizontal: 14,
            paddingVertical: 8,
            alignItems: 'flex-end',
        },
        totalLabel: { color: colors.accent, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
        totalAmount: { color: colors.accent, fontSize: 18, fontWeight: '800' },
        list: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 100 },
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

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t.incTitle}</Text>
                    <Text style={styles.subtitle}>{t.incSourceCount.replace('{count}', items.length.toString())}</Text>
                </View>
                <View style={styles.totalBadge}>
                    <Text style={styles.totalLabel}>{t.incTotal}</Text>
                    <Text style={styles.totalAmount}>${fmt(total)}</Text>
                </View>
            </View>

            <FlatList
                data={items}
                keyExtractor={(i) => i.id}
                contentContainerStyle={styles.list}
                renderItem={({ item, index }) => (
                    <IncomeItemCard item={item} onDelete={handleDelete} onEdit={handleOpenEdit} index={index} />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Text style={styles.emptyEmoji}>💰</Text>
                        <Text style={styles.emptyTitle}>{t.incEmptyTitle}</Text>
                        <Text style={styles.emptyText}>{t.incEmptyText}</Text>
                    </View>
                }
            />

            <Animated.View style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    style={styles.fabInner}
                    onPress={handleOpenAdd}
                    onPressIn={onFabPressIn}
                    onPressOut={onFabPressOut}
                >
                    <Ionicons name="add" size={28} color={colors.white} />
                </TouchableOpacity>
            </Animated.View>

            <AddItemModal
                visible={modalVisible}
                mode="income"
                initialData={editData}
                onClose={() => setModalVisible(false)}
                onSave={handleSave}
            />
        </SafeAreaView>
    );
}
