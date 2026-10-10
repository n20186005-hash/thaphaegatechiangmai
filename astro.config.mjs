import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.CURRENT_SITE_DOMAIN ? `https://${process.env.CURRENT_SITE_DOMAIN}` : 'https://thaphaegatechiangmai.com',
  // 页面为静态生成；天气数据接口按需在边缘运行时执行
  output: 'static',
  adapter: cloudflare(),
  // 站点内所有页面路径统一以 / 结尾，避免同一页面出现带斜杠/不带斜杠两个版本
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'th',
    locales: ['th', 'en', 'zh'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [
    sitemap({
      // 在 sitemap 中声明语言分支，帮助搜索引擎理解三语互相对应关系
      i18n: {
        defaultLocale: 'th',
        locales: { th: 'th-TH', en: 'en-US', zh: 'zh-Hans' },
      },
      // 接口不收录；根路径是跳转页（301 到默认语言），也不放进站点地图
      filter: (page) => !page.includes('/api/') && page !== 'https://thaphaegatechiangmai.com/',
      changefreq: 'weekly',
      lastmod: new Date(),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
