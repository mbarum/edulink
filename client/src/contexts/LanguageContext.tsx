import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  SupportedLanguage, 
  SUPPORTED_LANGUAGES, 
  LanguageOption, 
  translations 
} from '../i18n/translations';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  currentLanguageOption: LanguageOption;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('app_language') as SupportedLanguage;
    if (saved && ['en', 'es', 'fr', 'sw', 'ar'].includes(saved)) {
      return saved;
    }
    // Check browser preference if available
    const browserLang = navigator.language?.slice(0, 2);
    if (browserLang && ['es', 'fr', 'sw', 'ar'].includes(browserLang)) {
      return browserLang as SupportedLanguage;
    }
    return 'en';
  });

  const currentLanguageOption = 
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const isRTL = currentLanguageOption.direction === 'rtl';

  useEffect(() => {
    localStorage.setItem('app_language', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguageOption.direction;
    if (isRTL) {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [currentLanguage, currentLanguageOption, isRTL]);

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
  };

  const t = (key: string, fallback?: string): string => {
    const parts = key.split('.');
    if (parts.length === 2) {
      const [section, field] = parts;
      const langDict = translations[currentLanguage] || translations.en;
      if (langDict?.[section]?.[field]) {
        return langDict[section][field];
      }
      // Fallback to English dictionary
      if (translations.en?.[section]?.[field]) {
        return translations.en[section][field];
      }
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        currentLanguageOption,
        setLanguage,
        t,
        isRTL,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
