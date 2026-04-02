import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { useTranslation } from '../localization/LanguageContext';

type Props = {
    visible: boolean;
    onClose: () => void;
};

export default function SettingsModal({ visible, onClose }: Props) {
    const { colors, theme, setTheme } = useTheme();
    const { t, language, setLanguage } = useTranslation();

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
        sectionTitle: {
            color: colors.textSecondary,
            fontSize: 13,
            fontWeight: '600',
            marginTop: 20,
            marginBottom: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
        },
        optionRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: colors.cardBorder,
        },
        optionRowActive: {
            borderColor: colors.accent,
            backgroundColor: colors.accentGlow,
        },
        optionText: {
            fontSize: 15,
            fontWeight: '600',
            color: colors.textPrimary,
        },
        optionTextActive: {
            color: colors.accent,
        }
    });

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={styles.sheet}>
                    <View style={styles.header}>
                        <View style={styles.handle} />
                        <Text style={styles.title}>{t.settingsTitle}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Theme Section */}
                        <Text style={styles.sectionTitle}>{t.settingsTheme}</Text>
                        <TouchableOpacity
                            style={[styles.optionRow, theme === 'dark' && styles.optionRowActive]}
                            onPress={() => setTheme('dark')}
                        >
                            <Text style={[styles.optionText, theme === 'dark' && styles.optionTextActive]}>🌙 {t.settingsDark}</Text>
                            {theme === 'dark' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionRow, theme === 'light' && styles.optionRowActive]}
                            onPress={() => setTheme('light')}
                        >
                            <Text style={[styles.optionText, theme === 'light' && styles.optionTextActive]}>☀️ {t.settingsLight}</Text>
                            {theme === 'light' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                        </TouchableOpacity>

                        {/* Language Section */}
                        <Text style={styles.sectionTitle}>{t.settingsLanguage}</Text>
                        <TouchableOpacity
                            style={[styles.optionRow, language === 'es' && styles.optionRowActive]}
                            onPress={() => setLanguage('es')}
                        >
                            <Text style={[styles.optionText, language === 'es' && styles.optionTextActive]}>🇪🇸 {t.settingsES}</Text>
                            {language === 'es' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.optionRow, language === 'en' && styles.optionRowActive]}
                            onPress={() => setLanguage('en')}
                        >
                            <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>🇬🇧 {t.settingsEN}</Text>
                            {language === 'en' && <Ionicons name="checkmark-circle" size={20} color={colors.accent} />}
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
