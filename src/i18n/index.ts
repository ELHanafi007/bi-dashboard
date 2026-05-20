import en from './en';
import fr from './fr';
import ar from './ar';

export type Language = 'en' | 'fr' | 'ar';

export const translations = { en, fr, ar };

export const languageConfig: Record<Language, { name: string; nativeName: string; flag: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  ar: { name: 'Arabic', nativeName: 'العربية', flag: '🇲🇦', dir: 'rtl' },
};

export type TranslationKeys = keyof typeof en;
