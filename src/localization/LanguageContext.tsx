import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { en } from './en';
import { es } from './es';
import { AppLanguage, getSettings, saveSettings } from '../storage/settings';

export type Translations = typeof es;

interface LanguageContextType {
    language: AppLanguage;
    t: Translations;
    setLanguage: (lang: AppLanguage) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguageState] = useState<AppLanguage>('es');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        getSettings().then((settings) => {
            setLanguageState(settings.language);
            setIsLoaded(true);
        });
    }, []);

    const setLanguage = (newLanguage: AppLanguage) => {
        setLanguageState(newLanguage);
        getSettings().then((settings) => {
            saveSettings({ ...settings, language: newLanguage });
        });
    };

    const t = language === 'en' ? en : es;

    if (!isLoaded) return null;

    return (
        <LanguageContext.Provider value={{ language, t, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
