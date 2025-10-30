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
        className="p-3 h-10 leading-none rounded-xl glass-card hover:scale-105 transition-all duration-200 text-sm text-gray-700 dark:text-gray-200 flex items-center gap-2"
        aria-label={`${t(lang, 'toggleLanguage')} (${label})`}
        title={`${t(lang, 'toggleLanguage')} (${label})`}
      >
        <span>{label}</span>
        <svg className="w-4 h-4 opacity-70" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
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


