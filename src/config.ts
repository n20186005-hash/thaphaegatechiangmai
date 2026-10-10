// 规范域名统一使用主域（去掉 www 前缀），避免同一内容出现两个主机名
const DOMAIN = (process.env.CURRENT_SITE_DOMAIN || 'thaphaegatechiangmai.com').replace(/^www\./i, '');

export const siteConfig = {
  name: 'Tha Phae Gate (ประตูท่าแพ)',
  baseUrl: `https://${DOMAIN}`,
  slug: 'tha-phae-gate',
  locales: ['zh', 'en', 'th'] as const,
};

export const ogLocale: Record<string, string> = {
  zh: 'zh_CN',
  en: 'en_US',
  th: 'th_TH',
};

/**
 * 单景点 SEO 实体绑定配置（Entity Binding Config）
 *
 * 结构化数据 / TDK / Open Graph / 地图嵌入 / 权威外链 / PWA 统一从本对象取值，
 * 确保同一景点实体在整站以一致的名称、地址、坐标与别名出现，
 * 便于搜索引擎在 Knowledge Graph 中精确锚定该节点。
 *
 * 最新数据来源：Google 地图商户信息（Tha Phae Gate / ประตูท่าแพ）
 * 评分 4.4 · 29,846 条评价（同步时间 2026-10，见 ratingSyncedAt）
 */
export const attraction = {
  domain: DOMAIN,
  baseUrl: `https://${DOMAIN}`,

  // 名称与别名
  fullName: 'Tha Phae Gate',
  localName: 'ประตูท่าแพ',
  shortName: 'Tha Phae Gate',
  alternateNames: [
    'Tha Phae Gate',
    'Thapae Gate',
    'Pratu Tha Phae',
    'ประตูท่าแพ',
    'Chiang Mai Tha Phae Gate',
    'Chiang Mai Old City Gate',
    '塔佩门',
    '清邁塔佩門',
  ],

  // 地理层级与地址
  city: 'Chiang Mai',
  oldCity: 'Chiang Mai Old City',
  subDistrict: 'Chang Khlan Sub-district',
  district: 'Mueang Chiang Mai District',
  streetAddress: 'Tha Phae Road, Chang Khlan Sub-district',
  province: 'Chiang Mai',
  country: 'Thailand',
  countryCode: 'TH',
  postalCode: '50200',
  plusCode: 'QXQV+48 Chiang Mai',
  latitude: 18.7878,
  longitude: 98.9933,

  // 位置与评价链接（评价入口统一使用地点页链接，Google 地图地点页内含全部评价）
  mapsShareUrl: 'https://maps.app.goo.gl/J8vLsp9TYAQarv1k9',
  reviewsShareUrl: 'https://maps.app.goo.gl/J8vLsp9TYAQarv1k9',
  mapsEmbedSrc: 'https://www.google.com/maps?q=18.7878,98.9933&output=embed',

  // 权威外链（.org / .go.th）
  govtTourismUrl: 'https://www.tourismthailand.org',
  municipalityUrl: 'https://www.chiangmai.go.th',
  meteoUrl: 'https://www.tmd.go.th',
  thaiTravelUrl: 'https://www.thai.travel',

  // 周边核心地标（用于正文语义集群）
  nearbyLandmarks: ['Three Kings Monument', 'Wat Chedi Luang', 'Wat Phra Singh'],

  // 评分与评价：手动同步自 Google 地图商户页（更新时需同步修改以下位置）
  //   - 本文件 ratingValue / reviewCount / ratingSyncedAt
  //   - i18n 三语的 hero.rating、reviews.rating、reviews.total、reviews.updatedLabel、
  //     sources.ratingValue、sources.ratingCount、meta.description
  //   页面必须同时标注来源（Google 地图使用者评价）+ 可点击的“全部评价”链接 + 同步时间
  ratingValue: '4.4',
  reviewCount: 29846,
  bestRating: '5',
  worstRating: '1',
  ratingSyncedAt: '2026-10',

  // 图片资源
  heroImage: '/gallery/tha-phae-gate-24.jpg',
  ogImage: '/gallery/tha-phae-gate-23.jpg',
  ogImageWidth: 1023,
  ogImageHeight: 521,
  images: [
    '/gallery/tha-phae-gate-24.jpg',
    '/gallery/tha-phae-gate-1.jpg',
    '/gallery/tha-phae-gate-23.jpg',
    '/gallery/tha-phae-gate-6.jpg',
  ],

  // 统计与 PWA
  gaMeasurementId: 'G-HXM22WWPKP',
  themeColor: '#1a3a24',
};
