export const siteConfig = {
  name: 'Tha Phae Gate (ประตูท่าแพ)',
  baseUrl: `https://${process.env.CURRENT_SITE_DOMAIN || 'thaphaegatechiangmai.com'}`,
  slug: 'tha-phae-gate',
  locales: ['th', 'en', 'zh'] as const,
  defaultLocale: 'th'
};
