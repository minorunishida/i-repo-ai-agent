export type AppLanguage = 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'th';

export const supportedLanguages: { value: AppLanguage; label: string }[] = [
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
  { value: 'zh-Hans', label: '简体中文' },
  { value: 'zh-Hant', label: '繁體中文' },
  { value: 'th', label: 'ไทย' },
];

export const languageNames: Record<AppLanguage, string> = {
  ja: 'Japanese',
  en: 'English',
  'zh-Hans': 'Simplified Chinese',
  'zh-Hant': 'Traditional Chinese',
  th: 'Thai',
};

type Dict = Record<string, string>;

const ja: Dict = {
  appTitle: 'i-Repo AI AGENT',
  emptyPromptLead: 'メッセージを入力してチャットを開始してください',
  emptyPromptSub: 'AIアシスタントがお手伝いします',
  thinking: 'アイれぽちゃんAIが考えています...',
  inputPlaceholder: 'メッセージを入力...',
  send: '送信',
  sending: '送信中',
  stop: '停止',
  footerBrand: 'CIMTOPS AI ENGINE',
  toggleDark: 'ダークモード切替',
  toggleLanguage: '言語を変更',
  sidebarTitle: '会話履歴',
  newConversation: '新しい会話',
  searchConversationsPlaceholder: '会話を検索...',
  noResults: '検索結果が見つかりません',
  noHistory: '会話履歴がありません',
  showThreads: 'スレッド一覧を表示',
  createNewThread: '新しいスレッドを作成',
  closeSidebar: 'サイドバーを閉じる',
  deleteThread: 'スレッドを削除',
  deleteTitle: '会話を削除',
  deleteConfirm: 'この会話を削除しますか？この操作は元に戻せません。',
  cancel: 'キャンセル',
  delete: '削除',
  messagesUnit: '件',
  openLinks: '関連リンクを開く',
  linkKnowledgeBase: 'i-Reporterナレッジベース',
  linkSupportWeb: 'サポートウェブ',
  linkKaizenClub: '現場帳票カイゼン部',
  linkHomepage: 'i-Reporter ホームページ',
  linkTechSupportForm: 'テクニカルサポート受付フォーム',
};

const en: Dict = {
  appTitle: 'i-Repo AI AGENT',
  emptyPromptLead: 'Type a message to start chatting',
  emptyPromptSub: 'The AI assistant will help you',
  thinking: 'Thinking...',
  inputPlaceholder: 'Type a message...',
  send: 'Send',
  sending: 'Sending',
  stop: 'Stop',
  footerBrand: 'CIMTOPS AI ENGINE',
  toggleDark: 'Toggle dark mode',
  toggleLanguage: 'Change language',
  sidebarTitle: 'Conversations',
  newConversation: 'New conversation',
  searchConversationsPlaceholder: 'Search conversations...',
  noResults: 'No results found',
  noHistory: 'No conversation history',
  showThreads: 'Show thread list',
  createNewThread: 'Create new thread',
  closeSidebar: 'Close sidebar',
  deleteThread: 'Delete thread',
  deleteTitle: 'Delete conversation',
  deleteConfirm: 'Delete this conversation? This action cannot be undone.',
  cancel: 'Cancel',
  delete: 'Delete',
  messagesUnit: 'msgs',
  openLinks: 'Open related links',
  linkKnowledgeBase: 'i-Reporter Knowledge Base',
  linkSupportWeb: 'Support Web',
  linkKaizenClub: 'Genba Form Kaizen Club',
  linkHomepage: 'i-Reporter Homepage',
  linkTechSupportForm: 'Technical Support Request Form',
};

const zhHans: Dict = {
  appTitle: 'i-Repo AI AGENT',
  emptyPromptLead: '输入消息开始聊天',
  emptyPromptSub: 'AI 助手将为您提供帮助',
  thinking: '思考中...',
  inputPlaceholder: '输入消息...',
  send: '发送',
  sending: '发送中',
  stop: '停止',
  footerBrand: 'CIMTOPS AI ENGINE',
  toggleDark: '切换深色模式',
  toggleLanguage: '更改语言',
  sidebarTitle: '会话记录',
  newConversation: '新会话',
  searchConversationsPlaceholder: '搜索会话...',
  noResults: '未找到结果',
  noHistory: '暂无会话记录',
  showThreads: '显示线程列表',
  createNewThread: '创建新线程',
  closeSidebar: '关闭侧边栏',
  deleteThread: '删除线程',
  deleteTitle: '删除会话',
  deleteConfirm: '确定删除此会话？该操作无法撤销。',
  cancel: '取消',
  delete: '删除',
  messagesUnit: '条',
  openLinks: '打开相关链接',
  linkKnowledgeBase: 'i-Reporter 知识库',
  linkSupportWeb: '支持网站',
  linkKaizenClub: '现场表单改善部',
  linkHomepage: 'i-Reporter 首页',
  linkTechSupportForm: '技术支持申请表',
};

const zhHant: Dict = {
  appTitle: 'i-Repo AI AGENT',
  emptyPromptLead: '輸入訊息開始聊天',
  emptyPromptSub: 'AI 助手將協助您',
  thinking: '思考中...',
  inputPlaceholder: '輸入訊息...',
  send: '送出',
  sending: '送出中',
  stop: '停止',
  footerBrand: 'CIMTOPS AI ENGINE',
  toggleDark: '切換深色模式',
  toggleLanguage: '變更語言',
  sidebarTitle: '會話紀錄',
  newConversation: '新會話',
  searchConversationsPlaceholder: '搜尋會話...',
  noResults: '查無結果',
  noHistory: '沒有會話紀錄',
  showThreads: '顯示執行緒清單',
  createNewThread: '建立新執行緒',
  closeSidebar: '關閉側邊欄',
  deleteThread: '刪除執行緒',
  deleteTitle: '刪除會話',
  deleteConfirm: '要刪除此會話嗎？此操作無法復原。',
  cancel: '取消',
  delete: '刪除',
  messagesUnit: '則',
  openLinks: '開啟相關連結',
  linkKnowledgeBase: 'i-Reporter 知識庫',
  linkSupportWeb: '支援網站',
  linkKaizenClub: '現場表單改善部',
  linkHomepage: 'i-Reporter 首頁',
  linkTechSupportForm: '技術支援申請表單',
};

const th: Dict = {
  appTitle: 'i-Repo AI AGENT',
  emptyPromptLead: 'พิมพ์ข้อความเพื่อเริ่มสนทนา',
  emptyPromptSub: 'ผู้ช่วย AI จะช่วยคุณ',
  thinking: 'กำลังคิด...',
  inputPlaceholder: 'พิมพ์ข้อความ...',
  send: 'ส่ง',
  sending: 'กำลังส่ง',
  stop: 'หยุด',
  footerBrand: 'CIMTOPS AI ENGINE',
  toggleDark: 'สลับโหมดมืด',
  toggleLanguage: 'เปลี่ยนภาษา',
  sidebarTitle: 'ประวัติการสนทนา',
  newConversation: 'เริ่มสนทนาใหม่',
  searchConversationsPlaceholder: 'ค้นหาการสนทนา...',
  noResults: 'ไม่พบผลลัพธ์',
  noHistory: 'ยังไม่มีประวัติการสนทนา',
  showThreads: 'แสดงรายการเธรด',
  createNewThread: 'สร้างเธรดใหม่',
  closeSidebar: 'ปิดแถบข้าง',
  deleteThread: 'ลบเธรด',
  deleteTitle: 'ลบการสนทนา',
  deleteConfirm: 'ต้องการลบการสนทนานี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้',
  cancel: 'ยกเลิก',
  delete: 'ลบ',
  messagesUnit: 'ข้อความ',
  openLinks: 'เปิดลิงก์ที่เกี่ยวข้อง',
  linkKnowledgeBase: 'ฐานความรู้ i-Reporter',
  linkSupportWeb: 'เว็บไซต์สนับสนุน',
  linkKaizenClub: 'ชมรมปรับปรุงแบบฟอร์มหน้างาน',
  linkHomepage: 'โฮมเพจ i-Reporter',
  linkTechSupportForm: 'แบบฟอร์มติดต่อฝ่ายสนับสนุนเทคนิค',
};

export const translations: Record<AppLanguage, Dict> = {
  ja,
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
  th,
};

const STORAGE_KEY = 'app_language';

export function getSavedLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'ja';
  const v = window.localStorage.getItem(STORAGE_KEY) as AppLanguage | null;
  return v && translations[v] ? v : 'ja';
}

export function saveLanguage(lang: AppLanguage) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, lang);
}

export function t(lang: AppLanguage, key: keyof typeof ja): string {
  const dict = translations[lang] || translations.ja;
  return dict[key as string] ?? translations.ja[key as string];
}


