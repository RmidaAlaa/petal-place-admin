import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
}

interface LanguageProviderProps {
  children: ReactNode;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation keys
const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.marketplace': 'Marketplace',
    'nav.bouquetBuilder': 'Bouquet Builder',
    'nav.giftBoxes': 'Gift Boxes',
    'nav.occasions': 'Occasions',
    'nav.partners': 'Partners',
    'nav.admin': 'Admin',
    'nav.signIn': 'Sign In',
    'nav.profile': 'Profile Settings',
    'nav.logout': 'Log out',
    'categories.naturalRoses': 'Natural Roses',
    'categories.giftBoxes': 'Gift Boxes',
    'categories.weddingServices': 'Wedding Services',
    'categories.bridalBouquets': 'Bridal Bouquets',
    'categories.specialOccasions': 'Special Occasions',
    'categories.premiumFlowers': 'Premium Flowers',
    'categories.wedding': 'Wedding',
    'categories.occasions': 'Occasions',
    'builder.customizeRibbon': 'Customize Ribbon',
    'builder.addCard': 'Add Card',
    'builder.flowerColors': 'Flower Colors',
    'builder.arrangement': 'Arrangement',
    'builder.price': 'Price',
    'builder.addToCart': 'Add to Cart',
    'builder.save': 'Save',
    'builder.share': 'Share',
    'builder.clear': 'Clear',
    'common.customGift': 'Create Custom Gift',
    'common.items': 'items',
  },
  ar: {
    'nav.marketplace': 'السوق',
    'nav.bouquetBuilder': 'صانع الباقات',
    'nav.giftBoxes': 'صناديق الهدايا',
    'nav.occasions': 'المناسبات',
    'nav.partners': 'الشركاء',
    'nav.admin': 'الإدارة',
    'nav.signIn': 'تسجيل الدخول',
    'nav.profile': 'إعدادات الملف الشخصي',
    'nav.logout': 'تسجيل الخروج',
    'categories.naturalRoses': 'الورود الطبيعية',
    'categories.giftBoxes': 'صناديق الهدايا',
    'categories.weddingServices': 'خدمات الأعراس',
    'categories.bridalBouquets': 'باقات العروس',
    'categories.specialOccasions': 'المناسبات الخاصة',
    'categories.premiumFlowers': 'الورود الفاخرة',
    'categories.wedding': 'الأعراس',
    'categories.occasions': 'المناسبات',
    'builder.customizeRibbon': 'تخصيص الشريط',
    'builder.addCard': 'إضافة بطاقة',
    'builder.flowerColors': 'ألوان الورود',
    'builder.arrangement': 'التنسيق',
    'builder.price': 'السعر',
    'builder.addToCart': 'إضافة للسلة',
    'builder.save': 'حفظ',
    'builder.share': 'مشاركة',
    'builder.clear': 'مسح',
    'common.customGift': 'إنشاء هدية مخصصة',
    'common.items': 'عناصر',
  },
  fr: {
    'nav.marketplace': 'Marché',
    'nav.bouquetBuilder': 'Créateur de Bouquet',
    'nav.giftBoxes': 'Coffrets Cadeaux',
    'nav.occasions': 'Occasions',
    'nav.partners': 'Partenaires',
    'nav.admin': 'Admin',
    'nav.signIn': 'Se Connecter',
    'nav.profile': 'Paramètres du Profil',
    'nav.logout': 'Se Déconnecter',
    'categories.naturalRoses': 'Roses Naturelles',
    'categories.giftBoxes': 'Coffrets Cadeaux',
    'categories.weddingServices': 'Services de Mariage',
    'categories.bridalBouquets': 'Bouquets de Mariée',
    'categories.specialOccasions': 'Occasions Spéciales',
    'categories.premiumFlowers': 'Fleurs Premium',
    'categories.wedding': 'Mariage',
    'categories.occasions': 'Occasions',
    'builder.customizeRibbon': 'Personnaliser le Ruban',
    'builder.addCard': 'Ajouter une Carte',
    'builder.flowerColors': 'Couleurs des Fleurs',
    'builder.arrangement': 'Arrangement',
    'builder.price': 'Prix',
    'builder.addToCart': 'Ajouter au Panier',
    'builder.save': 'Sauvegarder',
    'builder.share': 'Partager',
    'builder.clear': 'Effacer',
    'common.customGift': 'Créer un Cadeau Personnalisé',
    'common.items': 'articles',
  },
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('preferred-language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('preferred-language', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        dir: language === 'ar' ? 'rtl' : 'ltr',
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