'use client';

import { useEffect, useRef, useState } from 'react';
import { AppLanguage, t } from '@/lib/i18n';

type Props = {
  language: AppLanguage;
  knowledgeUrl?: string;
  supportUrl?: string;
  kaizenUrl?: string;
  homepageUrl?: string;
  techSupportUrl?: string;
};

export default function ResourceLinks({
  language,
  knowledgeUrl = 'https://help.i-reporter.jp/knowledge',
  supportUrl = 'https://cimtops-support.com/i-Reporter/ja/',
  kaizenUrl = 'https://kaizenbu.i-reporter.jp/',
  homepageUrl = 'https://i-reporter.jp/',
  techSupportUrl = 'https://application.i-reporter.jp/support_form',
}: Props) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-3 h-10 w-10 leading-none rounded-xl glass-card hover:scale-105 transition-all duration-200 flex items-center justify-center"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t(language, 'openLinks')}
        title={t(language, 'openLinks')}
      >
        {/* Link icon */}
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3.9 12a5 5 0 015-5h3a1 1 0 110 2H8.9a3 3 0 100 6h3a1 1 0 110 2h-3a5 5 0 01-5-5zm7-1a1 1 0 011-1h3a3 3 0 110 6h-3a1 1 0 110-2h3a1 1 0 000-2h-3a1 1 0 01-1-1z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl glass-card py-2 z-50">
          <a
            href={homepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100"
          >
            {t(language, 'linkHomepage')}
          </a>
          <a
            href={knowledgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100"
          >
            {t(language, 'linkKnowledgeBase')}
          </a>
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100"
          >
            {t(language, 'linkSupportWeb')}
          </a>
          <a
            href={techSupportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100"
          >
            {t(language, 'linkTechSupportForm')}
          </a>
          <a
            href={kaizenUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`block px-4 py-2 hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-gray-100 ${kaizenUrl === '#' ? 'opacity-60 cursor-not-allowed' : ''}`}
            aria-disabled={kaizenUrl === '#'}
            onClick={(e) => {
              if (kaizenUrl === '#') e.preventDefault();
            }}
          >
            {t(language, 'linkKaizenClub')}
          </a>
        </div>
      )}
    </div>
  );
}


