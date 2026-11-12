import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
const locales = ['th', 'en', 'zh'];
const problems = [];
const summary = [];
for (const lang of locales) {
  const guideRoot = join(root, lang, 'guides');
  const slugs = readdirSync(guideRoot, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
  let photos = 0;
  for (const slug of slugs) {
    const html = readFileSync(join(guideRoot, slug, 'index.html'), 'utf8');
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0] ?? '';
    const text = main.replace(/<[^>]+>/g, '').replace(/&(?:#\d+|[a-z]+);/gi, ' ');
    const images = [...main.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]);
    photos += images.length;
    const expectedLang = lang === 'zh' ? 'zh-CN' : lang;
    if (!html.includes(`<html lang="${expectedLang}"`)) problems.push(`${lang}/${slug}: wrong html lang`);
    if (!/<h1\b/.test(main)) problems.push(`${lang}/${slug}: missing heading`);
    if (!/google\.com\/maps\/search\/\?api=1|maps\.app\.goo\.gl/.test(main)) problems.push(`${lang}/${slug}: missing map link`);
    if (images.length < 1 || images.length > 5) problems.push(`${lang}/${slug}: ${images.length} images (expected 1–5)`);
    if (lang === 'en' && /[\u0e00-\u0e7f\u4e00-\u9fff]/.test(text)) problems.push(`${lang}/${slug}: unexpected Thai or Han characters in main`);
    if (lang === 'zh' && /[\u0e00-\u0e7f]/.test(text)) problems.push(`${lang}/${slug}: unexpected Thai in main`);
    if (lang === 'th' && /[\u4e00-\u9fff]/.test(text)) problems.push(`${lang}/${slug}: unexpected Han characters in main`);
  }
  summary.push(`${lang}: ${slugs.length} guides; ${photos} image references`);
}
console.log(summary.join('\n'));
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else {
  console.log('No structural, image-count, or obvious script-mixing problems found. Translation meaning and image loads still require human/browser QA.');
}
