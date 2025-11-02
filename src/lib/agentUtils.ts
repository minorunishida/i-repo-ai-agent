import { AppLanguage } from './i18n';

// 環境変数の名前の順番: en, ja, zh-Hans, zh-Hant, th
const LANGUAGE_ORDER: AppLanguage[] = ['en', 'ja', 'zh-Hans', 'zh-Hant', 'th'];

/**
 * 環境変数からカンマ区切りのエージェント名をパースし、指定された言語の名前を返す
 *
 * @param envValue - 環境変数の値（例: "Expert,専門家,专家,專家,ผู้เชี่ยวชาญ"）
 * @param lang - 取得したい言語
 * @returns 指定言語のエージェント名
 *
 * @example
 * parseAgentName("Expert,専門家,专家,專家,ผู้เชี่ยวชาญ", "ja") // => "専門家"
 * parseAgentName("Agent", "en") // => "Agent" (単一値の場合はすべての言語で同じ)
 * parseAgentName("Expert,専門家", "th") // => "専門家" (不足している場合は日本語にフォールバック)
 */
export function parseAgentName(envValue: string | undefined, lang: AppLanguage): string {
  if (!envValue) return 'Agent';

  const names = envValue.split(',').map(s => s.trim());

  // 1つだけの場合はそれをすべての言語で使う
  if (names.length === 1) return names[0];

  // 言語のインデックスを取得
  const langIndex = LANGUAGE_ORDER.indexOf(lang);
  if (langIndex === -1 || langIndex >= names.length) {
    // フォールバック: 日本語 > 英語 > 最初の値
    const jaIndex = LANGUAGE_ORDER.indexOf('ja');
    const enIndex = LANGUAGE_ORDER.indexOf('en');
    return names[jaIndex] || names[enIndex] || names[0];
  }

  return names[langIndex];
}

