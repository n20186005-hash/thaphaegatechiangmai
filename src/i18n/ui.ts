import zh from './zh.json';
import en from './en.json';
import th from './th.json';

export const defaultLang = 'th';
export const languagesList = ['th', 'en', 'zh'] as const;

export const languages: Record<string, string> = {
  th: 'ไทย',
  en: 'English',
  zh: '中文',
};

const ui: Record<string, any> = { zh, en, th };

export function getLangFromUrl(url: URL): string {
  const seg = url.pathname.split('/').filter(Boolean);
  const lang = seg[0];
  return (languagesList as readonly string[]).includes(lang) ? lang : defaultLang;
}

export function getI18n(url: URL) {
  const lang = getLangFromUrl(url);
  const messages = ui[lang];
  const t = (key: string): string => {
    const found = key
      .split('.')
      .reduce<any>((o, i) => (o == null ? undefined : o[i]), messages);
    return found ?? '';
  };
  return { lang, messages, t };
}

export function buildAlternates(path = ''): Record<string, string> {
  const base = `https://${process.env.CURRENT_SITE_DOMAIN || 'thaphaegatechiangmai.com'}`;
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const mk = (l: string) => `${base}/${l}${clean ? '/' + clean : ''}`;
  return {
    th: mk('th'),
    en: mk('en'),
    zh: mk('zh'),
    xDefault: mk('th'),
  };
}

export function htmlLangAttr(lang: string): string {
  if (lang === 'zh') return 'zh-CN';
  return lang;
}
