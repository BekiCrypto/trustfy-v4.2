import translations from '../constants/translations';

export const useTranslation = () => {
  const t = (key: string, options?: Record<string, any>) => {
    const keys = key.split('.');
    let value: any = translations;
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    if (typeof value === 'string' && options) {
      return Object.keys(options).reduce((acc, optionKey) => {
        return acc.replace(new RegExp(`{{${optionKey}}}`, 'g'), options[optionKey]);
      }, value);
    }
    
    return value;
  };

  return { 
    t, 
    i18n: { 
      language: 'en', 
      changeLanguage: () => Promise.resolve(),
      dir: () => 'ltr',
      exists: () => true
    } 
  };
};

export const withTranslation = () => (Component: any) => (props: any) => {
  const { t } = useTranslation();
  // @ts-ignore
  return <Component {...props} t={t} />;
};

export const Trans = ({ children, i18nKey }: any) => {
  const { t } = useTranslation();
  if (children) return <>{children}</>;
  if (i18nKey) return <>{t(i18nKey)}</>;
  return null;
};
