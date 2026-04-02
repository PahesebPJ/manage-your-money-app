import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { darkColors, lightColors, ColorsSchema } from './colors';
import { AppTheme, getSettings, saveSettings } from '../storage/settings';

interface ThemeContextType {
    theme: AppTheme;
    colors: ColorsSchema;
    toggleTheme: () => void;
    setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setThemeState] = useState<AppTheme>('dark');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        getSettings().then((settings) => {
            setThemeState(settings.theme);
            setIsLoaded(true);
        });
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    };

    const setTheme = (newTheme: AppTheme) => {
        setThemeState(newTheme);
        getSettings().then((settings) => {
            saveSettings({ ...settings, theme: newTheme });
        });
    };

    const colors = theme === 'dark' ? darkColors : lightColors;

    if (!isLoaded) return null;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
