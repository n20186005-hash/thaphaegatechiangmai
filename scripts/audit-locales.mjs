import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const locales = ['th', 'en', 'zh'];
const failures = [];
const roots = Object.fromEntries(locales.map(lang => [lang, JSON.parse(readFileSync(`src/i18n/${lang}.json`, 'utf8'))]));
const walkKeys = (value, prefix = '', result = []) => {
  if (Array.isArray(value)) value.forEach((v, i) => walkKeys(v, `${prefix}[${i}]`, result));
  else if (value && typeof value === 'object') Object.entries(value).forEach(([k,v]) => walkKeys(v, prefix ? `${prefix}.${k}` : k, result));
  else result.push(prefix);
  return result;
};
const baseline = walkKeys(roots.zh).sort();
for (const lang of locales) {
  const keys = walkKeys(roots[lang]).sort();
  if (JSON.stringify(keys) !== JSON.stringify(baseline)) failures.push(`${lang}: translation-key structure differs from zh`);
}
const listHtml = (directory, found = []) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) listHtml(full, found);
    else if (entry.name === 'index.html') found.push(relative('dist', full));
  }
  return found;
};
const perLocale = Object.fromEntries(locales.map(lang => {
  const base = join('dist', lang);
  return [lang, listHtml(base).map(path => path.replace(/^(?:th|en|zh)\//, '')).sort()];
}));
for (const lang of locales) {
  if (JSON.stringify(perLocale[lang]) !== JSON.stringify(perLocale.zh)) failures.push(`${lang}: route list differs from zh`);
  for (const path of perLocale[lang]) {
    const html = readFileSync(join('dist', lang, path), 'utf8');
    const expected = lang === 'zh' ? 'zh-CN' : lang;
    if (!html.includes(`<html lang="${expected}"`)) failures.push(`${lang}/${path}: html lang mismatch`);
    if (!/<h1\b/.test(html)) failures.push(`${lang}/${path}: missing H1`);
    const footer = [...html.matchAll(/<footer\b[\s\S]*?<\/footer>/g)].at(-1)?.[0] ?? '';
    if (!footer.includes('© 2026') || !footer.includes('independent') && lang === 'en') failures.push(`${lang}/${path}: footer text missing`);
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? '';
    const visibleText = main.replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    if (lang !== 'zh' && /版本待补|待翻译/.test(visibleText)) failures.push(`${lang}/${path}: untranslated Chinese interface marker`);
    if (lang === 'th' && /\bwhere\b/.test(visibleText)) failures.push(`${lang}/${path}: English where in Thai content`);
    const wrongInternalLinks = [...main.matchAll(/href="(\/(?:th|en|zh)\/[^"#?]*)"/g)].filter(match => !match[1].startsWith(`/${lang}/`));
    if (wrongInternalLinks.length) failures.push(`${lang}/${path}: cross-locale internal links ${wrongInternalLinks.map(x=>x[1]).slice(0,3).join(', ')}`);
  }
}
console.log(`Localization parity: ${baseline.length} translation keys; ${perLocale.zh.length} pages per language (${perLocale.zh.length * locales.length} total).`);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else console.log('Translation key parity, route parity, HTML language, footer, and simple cross-language checks passed.');
