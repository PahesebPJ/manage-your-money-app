import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = '@moneyapp:settings';

export type AppLanguage = 'es' | 'en';
export type AppTheme = 'dark' | 'light';

export interface AppSettings {
    language: AppLanguage;
    theme: AppTheme;
}

const DEFAULT_SETTINGS: AppSettings = {
    language: 'es',
    theme: 'dark',
};

export async function getSettings(): Promise<AppSettings> {
    try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        }
        return DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
    try {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
        console.error('Failed to save settings');
    }
}
