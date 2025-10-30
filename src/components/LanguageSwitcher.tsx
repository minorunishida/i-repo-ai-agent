'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AppLanguage, getSavedLanguage, saveLanguage, supportedLanguages, t } from '@/lib/i18n';

type Props = {
  value?: AppLanguage;
  onChange?: (lang: AppLanguage) => void;
};

export default function LanguageSwitcher({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<AppLanguage>(value || getSavedLanguage());
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLang(value || getSavedLanguage());
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const label = useMemo(() => {
    // 表示は短縮のため、ラベルの先頭2文字
    const item = supportedLanguages.find((l) => l.value === lang);
    return item ? item.label : '日本語';
  }, [lang]);

  const handleSelect = (l: AppLanguage) => {
    saveLanguage(l);
    setLang(l);
    onChange?.(l);
    setOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-3 rounded-xl glass-card hover:scale-105 transition-all duration-200"
        aria-label={t(lang, 'toggleLanguage')}
        title={t(lang, 'toggleLanguage')}
      >
        {/* Language icon */}
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 3a9 9 0 100 18 9 9 0 000-18zm7 9a7 7 0 01-2.05 4.95 9.04 9.04 0 00-2.3-3.45c.2-.48.36-.98.47-1.5H19zm-3.52-2a7.97 7.97 0 00-.91-2.07A6.99 6.99 0 0119 11h-3.52zM12 5c.8 0 1.57.12 2.29.35-.43.74-.96 1.6-1.58 2.48-.22.03-.45.05-.71.05-.26 0-.49-.02-.71-.05A19.7 19.7 0 019.71 5.35 6.96 6.96 0 0112 5zM8.43 7.93A7.97 7.97 0 007.52 10H5a7 7 0 013.43-2.07zM5 13h2.52c.11.52.27 1.02.47 1.5-.9.98-1.7 2.16-2.3 3.45A7 7 0 015 13zm3.71 5.65c.62-.89 1.15-1.74 1.58-2.48.22-.03.45-.05.71-.05.26 0 .49.02.71.05.62.88 1.15 1.74 1.58 2.48A6.96 6.96 0 0112 19a6.96 6.96 0 01-2.29-.35zM13.3 12c-.12.43-.28.84-.48 1.23-.26.5-.56.98-.9 1.43-.34-.45-.64-.93-.9-1.43-.2-.39-.36-.8-.48-1.23h2.76zM8.48 12c.1-.52.26-1.02.47-1.5.26-.49.56-.97.9-1.42.34.45.64.93.9 1.42.21.48.37.98.47 1.5H8.48z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl glass-card py-2 z-50">
          {supportedLanguages.map((l) => (
            <button
              key={l.value}
              onClick={() => handleSelect(l.value)}
              className={`w-full text-left px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100 ${l.value === lang ? 'font-semibold' : ''}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


