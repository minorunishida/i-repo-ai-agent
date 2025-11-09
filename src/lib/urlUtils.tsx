import React from 'react';

/**
 * URL検出用の正規表現パターン
 * - http:// または https:// で始まるURL
 * - www. で始まるURL（https://を補完）
 * 句読点（.、。、,、!、?）で終わるURLも検出（句読点はURLに含めない）
 */
const URL_PATTERN = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;

/**
 * URL文字列を完全なURLに変換する
 * www. で始まる場合は https:// を追加
 */
function normalizeUrl(url: string): string {
  if (url.startsWith('www.')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * テキスト内のURLを検出し、React要素に変換する
 *
 * @param text - 検出対象のテキスト
 * @returns React要素の配列（テキストとリンクが混在）
 */
export function parseUrlsToElements(text: string): (string | React.ReactElement)[] {
  const parts: (string | React.ReactElement)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let partIndex = 0;

  // 正規表現をリセット
  URL_PATTERN.lastIndex = 0;

  while ((match = URL_PATTERN.exec(text)) !== null) {
    // URLの前のテキストを追加
    if (match.index > lastIndex) {
      const beforeText = text.substring(lastIndex, match.index);
      if (beforeText) {
        parts.push(<React.Fragment key={`text-${partIndex++}`}>{beforeText}</React.Fragment>);
      }
    }

    // URLをリンク要素に変換
    const url = match[0];
    const normalizedUrl = normalizeUrl(url);
    const key = `link-${partIndex++}-${match.index}`;

    parts.push(
      <a
        key={key}
        href={normalizedUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="chat-link"
      >
        {url}
      </a>
    );

    lastIndex = match.index + url.length;
  }

  // 残りのテキストを追加
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(<React.Fragment key={`text-${partIndex++}`}>{remainingText}</React.Fragment>);
    }
  }

  // URLが見つからない場合は元のテキストをそのまま返す
  if (parts.length === 0) {
    return [text];
  }

  return parts;
}

