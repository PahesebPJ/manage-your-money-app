import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
    KeyboardAvoidingView,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type Mode = 'income' | 'expense';

export type AddItemFormData = {
    name: string;
    amount: string;
    category: string;
    type: 'regular' | 'subscription';
    renewalDate: string; // YYYY-MM-DD
};

type Props = {
    visible: boolean;
    mode: Mode;
    onClose: () => void;
    onSave: (data: AddItemFormData) => void;
};

const INCOME_CATEGORIES = ['Salario', 'Freelance', 'Inversiones', 'Negocio', 'Renta', 'Otro'];
const EXPENSE_CATEGORIES = ['Suscripción', 'Crédito', 'Servicios', 'Alimentación', 'Transporte', 'Salud', 'Entretenimiento', 'Otro'];

export default function AddItemModal({ visible, mode, onClose, onSave }: Props) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [isSubscription, setIsSubscription] = useState(false);
    const [renewalDay, setRenewalDay] = useState('');
    const [error, setError] = useState('');

    const categories = mode === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    const reset = () => {
        setName('');
        setAmount('');
        setCategory('');
        setIsSubscription(false);
        setRenewalDay('');
        setError('');
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSave = () => {
        if (!name.trim()) { setError('Ingresa un nombre'); return; }
        const parsed = parseFloat(amount.replace(',', '.'));
        if (isNaN(parsed) || parsed <= 0) { setError('Ingresa un monto válido'); return; }
        if (!category) { setError('Selecciona una categoría'); return; }

        let renewalDate = '';
        if (mode === 'expense' && isSubscription) {
            const day = parseInt(renewalDay, 10);
            if (isNaN(day) || day < 1 || day > 31) { setError('Ingresa un día válido (1-31)'); return; }
            const now = new Date();
            let nextRenewal = new Date(now.getFullYear(), now.getMonth(), day);
            if (nextRenewal <= now) {
                nextRenewal = new Date(now.getFullYear(), now.getMonth() + 1, day);
            }
            renewalDate = nextRenewal.toISOString().split('T')[0];
        }

        onSave({
            name: name.trim(),
            amount,
            category,
            type: mode === 'expense' && isSubscription ? 'subscription' : 'regular',
            renewalDate,
        });
        reset();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
                <View style={styles.sheet}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <Text style={styles.title}>
                            {mode === 'income' ? '➕ Nuevo ingreso' : '➕ Nuevo gasto'}
                        </Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                        {/* Name */}
                        <Text style={styles.label}>Nombre</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={mode === 'income' ? 'ej. Salario principal' : 'ej. Netflix'}
                            placeholderTextColor={colors.textMuted}
                            value={name}
                            onChangeText={setName}
                            selectionColor={colors.accent}
                            returnKeyType="next"
                        />

                        {/* Amount */}
                        <Text style={styles.label}>Monto mensual ($)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0.00"
                            placeholderTextColor={colors.textMuted}
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                            selectionColor={colors.accent}
                        />

                        {/* Category */}
                        <Text style={styles.label}>Categoría</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.catChip,
                                        category === cat && styles.catChipActive,
                                    ]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Subscription toggle (only for expenses) */}
                        {mode === 'expense' && (
                            <View style={styles.switchRow}>
                                <View>
                                    <Text style={styles.label}>¿Es suscripción?</Text>
                                    <Text style={styles.subLabel}>Recibirás notificación antes de renovarse</Text>
                                </View>
                                <Switch
                                    value={isSubscription}
                                    onValueChange={setIsSubscription}
                                    trackColor={{ false: colors.inputBorder, true: colors.accentDim }}
                                    thumbColor={isSubscription ? colors.accent : colors.textMuted}
                                />
                            </View>
                        )}

                        {/* Renewal day */}
                        {mode === 'expense' && isSubscription && (
                            <>
                                <Text style={styles.label}>Día de renovación (del mes)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ej. 15"
                                    placeholderTextColor={colors.textMuted}
                                    value={renewalDay}
                                    onChangeText={setRenewalDay}
                                    keyboardType="number-pad"
                                    selectionColor={colors.accent}
                                />
                            </>
                        )}

                        {/* Error */}
                        {!!error && <Text style={styles.error}>{error}</Text>}

                        {/* Save */}
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>Guardar</Text>
                        </TouchableOpacity>
                        <View style={{ height: 30 }} />
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: colors.overlay,
    },
    sheet: {
        backgroundColor: colors.backgroundSecondary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: colors.cardBorder,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        flexWrap: 'wrap',
    },
    closeBtn: { padding: 4 },
    title: {
        color: colors.textPrimary,
        fontSize: 17,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    label: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    subLabel: {
        color: colors.textMuted,
        fontSize: 11,
        marginTop: -4,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.inputBg,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        color: colors.textPrimary,
        fontSize: 15,
    },
    catScroll: {
        marginBottom: 4,
    },
    catChip: {
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: colors.inputBorder,
        marginRight: 8,
        backgroundColor: colors.inputBg,
    },
    catChipActive: {
        backgroundColor: colors.accentGlow,
        borderColor: colors.accent,
    },
    catText: {
        color: colors.textSecondary,
        fontSize: 13,
    },
    catTextActive: {
        color: colors.accent,
        fontWeight: '700',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 16,
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    error: {
        color: colors.danger,
        fontSize: 13,
        marginTop: 12,
        textAlign: 'center',
    },
    saveBtn: {
        backgroundColor: colors.accent,
        borderRadius: 14,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 22,
    },
    saveBtnText: {
        color: colors.black,
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
