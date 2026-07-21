export const siteConfig = {
  name: 'Tha Phae Gate (ประตูท่าแพ)',
  baseUrl: `https://${process.env.CURRENT_SITE_DOMAIN || 'thaphaegatechiangmai.com'}`,
  slug: 'tha-phae-gate',
  locales: ['zh', 'en', 'th'] as const,
};

export const ogLocale: Record<string, string> = {
  zh: 'zh_CN',
  en: 'en_US',
  th: 'th_TH',
};
