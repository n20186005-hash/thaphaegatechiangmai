/**
 * 天气数据服务（服务端）
 *
 * 在服务器端（构建期 / 边缘运行时）获取景点所在地的实时天气、多日预报与空气质量，
 * 并按语言整理成可直接渲染的视图数据（含面向游客的可执行建议）。结果带 TTL 缓存，避免重复请求。
 *
 * 设计要点：
 * - 全部在服务端完成，前端只消费已整理好的字段，不接触任何上游细节。
 * - 任何异常都优雅降级（返回 null / 留空），不影响页面构建与渲染。
 * - 建议文案由「条件规则库」生成：满足条件的条目才输出，不满足的直接隐藏。
 */

import { attraction } from '../config';

export type WeatherLang = 'zh' | 'en' | 'th';

export interface WeatherDay {
  date: string;
  code: number;
  tMax: number;
  tMin: number;
  feelsMax: number;
  feelsMin: number;
  precipProb: number;
  precipSum: number;
  uv: number;
  windMax: number;
  gustMax: number;
  sunrise: string;
  sunset: string;
}

export interface AirQuality {
  pm25: number;
  usAqi: number;
}

export interface WeatherSnapshot {
  current: {
    time: string;
    temp: number;
    feelsLike: number;
    code: number;
    humidity: number;
    wind: number;
    gust: number;
    visibility: number;
    precipitation: number;
    isDay: boolean;
  };
  days: WeatherDay[];
  air: AirQuality | null;
  fetchedAt: number;
}

/** 一条可执行建议：图标 + 面向游客的短句 */
export interface AdviceItem {
  icon: string;
  text: string;
}

/** 结构化建议：风险提醒置顶，其余按「穿搭 / 安排 / 随身」三类归口 */
export interface WeatherAdvice {
  alerts: AdviceItem[];
  outfit: AdviceItem[];
  plan: AdviceItem[];
  items: AdviceItem[];
}

export interface AirView {
  level: 'good' | 'fair' | 'poor' | 'bad';
  text: string;
  pm25: number;
  usAqi: number;
}

export interface WeatherDayView {
  date: string;
  weekday: number;
  desc: string;
  icon: string;
  tMax: number;
  tMin: number;
  precipProb: number;
  uv: number;
  sunrise: string;
  sunset: string;
  rainLikely: boolean;
  uvHigh: boolean;
}

export interface WeatherView {
  ok: boolean;
  time: string;
  tempText: string;
  desc: string;
  icon: string;
  feelsText: string;
  humidity: number;
  windText: string;
  precipText: string;
  isDay: boolean;
  updatedAt: string;
  air: AirView | null;
  advice: WeatherAdvice;
  days: WeatherDayView[];
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 分钟
const UPSTREAM_TIMEOUT_MS = 6000;

let memoryCache: { at: number; data: WeatherSnapshot } | null = null;

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';
const AIR_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';

function buildUrl(): string {
  const params = new URLSearchParams({
    latitude: String(attraction.latitude),
    longitude: String(attraction.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max',
    timezone: 'Asia/Bangkok',
    forecast_days: '7',
  });
  return `${ENDPOINT}?${params.toString()}`;
}

function buildAirUrl(): string {
  const params = new URLSearchParams({
    latitude: String(attraction.latitude),
    longitude: String(attraction.longitude),
    current: 'pm2_5,us_aqi',
    timezone: 'Asia/Bangkok',
  });
  return `${AIR_ENDPOINT}?${params.toString()}`;
}

function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function parseSnapshot(payload: any): WeatherSnapshot | null {
  if (!payload || typeof payload !== 'object') return null;
  const current = payload.current;
  const daily = payload.daily;
  if (!current || !daily || !Array.isArray(daily.time)) return null;

  const days: WeatherDay[] = daily.time.map((date: string, i: number) => ({
    date,
    code: num(daily.weather_code?.[i]),
    tMax: num(daily.temperature_2m_max?.[i]),
    tMin: num(daily.temperature_2m_min?.[i]),
    feelsMax: num(daily.apparent_temperature_max?.[i], num(daily.temperature_2m_max?.[i])),
    feelsMin: num(daily.apparent_temperature_min?.[i], num(daily.temperature_2m_min?.[i])),
    precipProb: num(daily.precipitation_probability_max?.[i]),
    precipSum: num(daily.precipitation_sum?.[i]),
    uv: num(daily.uv_index_max?.[i]),
    windMax: num(daily.wind_speed_10m_max?.[i], num(current.wind_speed_10m)),
    gustMax: num(daily.wind_gusts_10m_max?.[i], num(current.wind_gusts_10m)),
    sunrise: String(daily.sunrise?.[i] ?? ''),
    sunset: String(daily.sunset?.[i] ?? ''),
  }));

  if (days.length === 0) return null;

  return {
    current: {
      time: String(current.time ?? ''),
      temp: num(current.temperature_2m),
      feelsLike: num(current.apparent_temperature),
      code: num(current.weather_code),
      humidity: num(current.relative_humidity_2m),
      wind: num(current.wind_speed_10m),
      gust: num(current.wind_gusts_10m),
      visibility: num(current.visibility, 0),
      precipitation: num(current.precipitation),
      isDay: current.is_day === 1 || current.is_day === true,
    },
    days,
    air: null,
    fetchedAt: Date.now(),
  };
}

function parseAir(payload: any): AirQuality | null {
  const cur = payload?.current;
  if (!cur) return null;
  const pm25 = num(cur.pm2_5, -1);
  const usAqi = num(cur.us_aqi, -1);
  if (pm25 < 0 && usAqi < 0) return null;
  return { pm25: Math.max(pm25, 0), usAqi: Math.max(usAqi, 0) };
}

async function fetchWeather(signal: AbortSignal): Promise<WeatherSnapshot | null> {
  const res = await fetch(buildUrl(), { signal, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  return parseSnapshot(await res.json());
}

async function fetchAir(signal: AbortSignal): Promise<AirQuality | null> {
  const res = await fetch(buildAirUrl(), { signal, headers: { accept: 'application/json' } });
  if (!res.ok) return null;
  return parseAir(await res.json());
}

/**
 * 获取天气快照（带缓存）。
 * 失败时返回上次可用结果或 null；空气质量属于增强信息，获取失败不影响主流程。
 */
export async function getWeather(): Promise<WeatherSnapshot | null> {
  const now = Date.now();
  if (memoryCache && now - memoryCache.at < CACHE_TTL_MS) {
    return memoryCache.data;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const [weather, air] = await Promise.all([
      fetchWeather(controller.signal),
      fetchAir(controller.signal).catch(() => null),
    ]);
    if (!weather) throw new Error('unexpected payload');
    const data: WeatherSnapshot = { ...weather, air };
    memoryCache = { at: now, data };
    return data;
  } catch {
    // 失败时若存在过期缓存，仍返回旧数据以保证页面可用
    if (memoryCache) return memoryCache.data;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/* ---------------------------------- 天气描述 ---------------------------------- */

const DESCRIPTIONS: Record<WeatherLang, Record<number, string>> = {
  zh: {
    0: '晴',
    1: '大部晴朗',
    2: '多云',
    3: '阴',
    45: '有雾',
    48: '雾凇',
    51: '毛毛雨',
    53: '小雨',
    55: '较密小雨',
    56: '冻毛毛雨',
    57: '冻雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '冻雨',
    67: '强冻雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '米雪',
    80: '阵雨',
    81: '较强阵雨',
    82: '强阵雨',
    85: '阵雪',
    86: '强阵雪',
    95: '雷阵雨',
    96: '雷阵雨伴冰雹',
    99: '强雷暴伴冰雹',
  },
  en: {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    56: 'Freezing drizzle',
    57: 'Freezing drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    66: 'Freezing rain',
    67: 'Heavy freezing rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    77: 'Snow grains',
    80: 'Rain showers',
    81: 'Rain showers',
    82: 'Violent rain showers',
    85: 'Snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with hail',
    99: 'Severe thunderstorm with hail',
  },
  th: {
    0: 'แจ่มใส',
    1: 'โปร่งเป็นส่วนใหญ่',
    2: 'มีเมฆบางส่วน',
    3: 'มีเมฆมาก',
    45: 'หมอก',
    48: 'หมอกน้ำแข็ง',
    51: 'ฝนละออง',
    53: 'ฝนละอองเล็กน้อย',
    55: 'ฝนละอองหนา',
    56: 'ฝนละอองเยือกแข็ง',
    57: 'ฝนเยือกแข็ง',
    61: 'ฝนเล็กน้อย',
    63: 'ฝนปานกลาง',
    65: 'ฝนหนัก',
    66: 'ฝนเยือกแข็ง',
    67: 'ฝนเยือกแข็งหนัก',
    71: 'หิมะเล็กน้อย',
    73: 'หิมะ',
    75: 'หิมะหนัก',
    77: 'เกล็ดหิมะ',
    80: 'ฝนตกเป็นช่วง',
    81: 'ฝนตกเป็นช่วงปานกลาง',
    82: 'ฝนตกเป็นช่วงหนัก',
    85: 'หิมะตกเป็นช่วง',
    86: 'หิมะตกเป็นช่วงหนัก',
    95: 'พายุฝนฟ้าคะนอง',
    96: 'พายุฝนฟ้าคะนองกับลูกเห็บ',
    99: 'พายุฝนฟ้าคะนองรุนแรงกับลูกเห็บ',
  },
};

const ICONS: Record<number, string> = {
  0: '☀️',
  1: '🌤️',
  2: '⛅',
  3: '☁️',
  45: '🌫️',
  48: '🌫️',
  51: '🌦️',
  53: '🌦️',
  55: '🌦️',
  56: '🌧️',
  57: '🌧️',
  61: '🌧️',
  63: '🌧️',
  65: '🌧️',
  66: '🌧️',
  67: '🌧️',
  71: '🌨️',
  73: '🌨️',
  75: '🌨️',
  77: '🌨️',
  80: '🌦️',
  81: '🌧️',
  82: '⛈️',
  85: '🌨️',
  86: '🌨️',
  95: '⛈️',
  96: '⛈️',
  99: '⛈️',
};

/* ------------------------------- 建议文案规则库 ------------------------------- */

type AdviceEntry = { icon: string; text: string };
type AdviceBook = Record<string, AdviceEntry>;

/**
 * 全部为「可直接执行」的口语短句：不出现气象术语，不写「一定会下雨」这类绝对判断。
 * 关键命中条件见 buildAdvice()。
 */
const ADVICE_TEXT: Record<WeatherLang, AdviceBook> = {
  zh: {
    // —— 风险提醒（置顶）——
    alertThunder: { icon: '⛈️', text: '有雷雨，谨防雷电：不要在广场空旷处、大树下或河岸边停留，尽快进入室内避雨。' },
    alertDownpour: { icon: '🚨', text: '有持续强降雨，建议推迟户外行程，避免前往低洼与河岸地带，密切关注天气变化。' },
    alertHeavyRain: { icon: '⚠️', text: '降雨较强，建议调整行程，避开低洼积水路段，注意地面湿滑与台阶。' },
    alertWind: { icon: '💨', text: '大风天气，远离广告牌、大树与临时搭建物，注意高空落物与随身物品被吹走。' },
    alertFog: { icon: '🌫️', text: '能见度差，长途班次与航班可能延误，出行请留出更多时间并注意道路安全。' },
    alertAir: { icon: '😷', text: '空气质量较差，建议减少长时间户外停留，敏感人群尽量待在室内并佩戴防护口罩。' },
    alertHot: { icon: '🥵', text: '高温天气，尽量避开正午外出，缩短户外停留时间，注意防暑降温。' },
    alertUv: { icon: '🧴', text: '紫外线很强，长时间暴露容易晒伤，请做好全面防晒并勤补水。' },
    // —— 出行穿搭 ——
    outfitRain: { icon: '🧥', text: '有雨，建议穿防水或速干衣物，鞋子以防滑为宜' },
    outfitHot: { icon: '👕', text: '气温偏高，建议轻薄透气的浅色衣物' },
    outfitCold: { icon: '🧣', text: '气温偏低，注意防寒保暖，穿厚外套并备围巾' },
    outfitDiurnal: { icon: '🧥', text: '昼夜温差较大，建议带一件外套，方便随时增减' },
    outfitHumid: { icon: '👕', text: '闷热潮湿，衣物以透气速干为主' },
    outfitNight: { icon: '🧥', text: '入夜后体感转凉，建议带一件薄外套' },
    // —— 游玩安排 ——
    planThunder: { icon: '⛔', text: '雷雨时段露天活动与水上项目大概率关闭，请勿在空旷处与树下停留' },
    planRainHeavy: { icon: '🏛️', text: '不建议长时间户外游玩，寺院殿堂、博物馆与商场等室内场所更合适，部分露天项目可能临时关闭' },
    planRainLikely: { icon: '☂️', text: '较大概率会下雨，优先安排室内场馆，户外行程留出弹性' },
    planRainLight: { icon: '🌦️', text: '有小雨，露天体验一般，路面湿滑请慢行' },
    planWind: { icon: '🌬️', text: '风力偏大，露天游乐与游船等项目可能临时停运，建议安排避风的街巷' },
    planFog: { icon: '🌫️', text: '能见度低，不适合观景与登高，建议改走街巷与室内行程' },
    planAir: { icon: '😷', text: '空气质量一般，建议减少剧烈户外活动，敏感人群缩短户外停留' },
    planAirBad: { icon: '😷', text: '空气质量较差，避免长时间户外活动，敏感人群建议以室内行程为主' },
    planHeatIsland: { icon: '🌡️', text: '广场与马路辐射热强，尽量走城墙内侧与树荫，午后安排寺院殿堂、博物馆或商场避暑' },
    planHeat: { icon: '🕒', text: '气温较高，缩短户外游玩时间，正午安排在室内休息' },
    planUv: { icon: '🕶️', text: '紫外线较强，正午前后注意遮阳，拍照时段可前移到清晨或傍晚' },
    planHumid: { icon: '🥤', text: '体感闷热潮湿，注意补水，走一段就在有空调或树荫的地方歇一歇' },
    planClear: { icon: '📷', text: '天气晴好，适合户外游览，日出前后与傍晚的光线最适合拍照' },
    planCloudy: { icon: '📷', text: '光线柔和，很适合拍照，也没有暴晒，适合长时间户外逛游' },
    planNight: { icon: '🌙', text: '入夜后广场灯亮很好拍，注意夜间温度变化与随身物品' },
    // —— 随身物品 ——
    itemUmbrella: { icon: '☂️', text: '折叠伞' },
    itemRaincoat: { icon: '🧥', text: '雨衣（风大时比长柄伞更稳妥）' },
    itemShoes: { icon: '👟', text: '防滑鞋' },
    itemSunscreen: { icon: '🧴', text: '防晒霜' },
    itemSunglasses: { icon: '🕶️', text: '墨镜' },
    itemSunhat: { icon: '🧢', text: '遮阳帽' },
    itemWater: { icon: '💧', text: '充足饮用水' },
    itemMask: { icon: '😷', text: '防护口罩' },
    itemMosquito: { icon: '🦟', text: '驱蚊用品' },
    itemJacket: { icon: '🧥', text: '薄外套' },
    itemWarm: { icon: '🧣', text: '厚外套、围巾' },
  },
  en: {
    alertThunder: { icon: '⛈️', text: 'Thunderstorms: do not stay in the open square, under large trees or on the riverbank — move indoors quickly.' },
    alertDownpour: { icon: '🚨', text: 'Sustained heavy rain: consider postponing outdoor plans, avoid low-lying and riverside areas, and keep an eye on updates.' },
    alertHeavyRain: { icon: '⚠️', text: 'Heavy rain: adjust your plans, avoid flooded low spots, and watch for slippery surfaces and steps.' },
    alertWind: { icon: '💨', text: 'Strong wind: stay clear of billboards, large trees and temporary structures, and mind falling debris.' },
    alertFog: { icon: '🌫️', text: 'Low visibility: long-distance services and flights may be delayed — allow extra time and take care on the roads.' },
    alertAir: { icon: '😷', text: 'Poor air quality: cut long outdoor stays, and sensitive groups should stay indoors and wear a protective mask.' },
    alertHot: { icon: '🥵', text: 'High heat: avoid going out at midday, shorten outdoor time and take heat precautions.' },
    alertUv: { icon: '🧴', text: 'Very strong UV: long exposure burns easily — use full sun protection and drink water often.' },
    outfitRain: { icon: '🧥', text: 'Rain expected — wear waterproof or quick-dry clothing and non-slip shoes' },
    outfitHot: { icon: '👕', text: 'Hot and humid — light, breathable clothing in pale colours works best' },
    outfitCold: { icon: '🧣', text: 'Cold — dress warmly with a thick jacket and a scarf' },
    outfitDiurnal: { icon: '🧥', text: 'Big day–night temperature swing — carry a jacket you can add or remove' },
    outfitHumid: { icon: '👕', text: 'Muggy and humid — breathable, quick-dry fabrics are best' },
    outfitNight: { icon: '🧥', text: 'It cools down after dark — bring a light jacket' },
    planThunder: { icon: '⛔', text: 'During thunderstorms outdoor and water activities usually close — keep away from open ground and trees' },
    planRainHeavy: { icon: '🏛️', text: 'Not a good day for long outdoor stretches — temple halls, museums and malls work better, and some outdoor facilities may close' },
    planRainLikely: { icon: '☂️', text: 'Rain is fairly likely — favour indoor stops and keep outdoor plans flexible' },
    planRainLight: { icon: '🌦️', text: 'Light rain — outdoor stops are less enjoyable and paving gets slippery, so take it slowly' },
    planWind: { icon: '🌬️', text: 'Fairly windy — outdoor rides and boat trips may be suspended; the sheltered lanes inside the walls are a better bet' },
    planFog: { icon: '🌫️', text: 'Low visibility — poor for views and viewpoints; switch to lanes and indoor stops' },
    planAir: { icon: '😷', text: 'Moderate air quality — limit strenuous outdoor activity, and sensitive groups should shorten outdoor time' },
    planAirBad: { icon: '😷', text: 'Poor air quality — avoid long outdoor activity, and sensitive groups should favour indoor stops' },
    planHeatIsland: { icon: '🌡️', text: 'The square and asphalt radiate heat — walk on the inner side of the wall and in the shade, and spend the afternoon in temple halls, museums or malls' },
    planHeat: { icon: '🕒', text: 'Hot — shorten outdoor time and rest indoors at midday' },
    planUv: { icon: '🕶️', text: 'Strong UV — seek shade around midday and move photo sessions to early morning or late afternoon' },
    planHumid: { icon: '🥤', text: 'Muggy — keep drinking water and pause in air-conditioned or shaded spots along the way' },
    planClear: { icon: '📷', text: 'Clear and fine — great for walking, and the light around sunrise and sunset is best for photos' },
    planCloudy: { icon: '📷', text: 'Soft light — good for photos, no harsh sun, and comfortable for long walks outdoors' },
    planNight: { icon: '🌙', text: 'After dark the lit square photographs beautifully — watch the temperature drop and your belongings' },
    itemUmbrella: { icon: '☂️', text: 'Folding umbrella' },
    itemRaincoat: { icon: '🧥', text: 'Rain jacket (safer than a long umbrella in wind)' },
    itemShoes: { icon: '👟', text: 'Non-slip shoes' },
    itemSunscreen: { icon: '🧴', text: 'Sunscreen' },
    itemSunglasses: { icon: '🕶️', text: 'Sunglasses' },
    itemSunhat: { icon: '🧢', text: 'Sun hat' },
    itemWater: { icon: '💧', text: 'Plenty of drinking water' },
    itemMask: { icon: '😷', text: 'Protective mask' },
    itemMosquito: { icon: '🦟', text: 'Mosquito repellent' },
    itemJacket: { icon: '🧥', text: 'Light jacket' },
    itemWarm: { icon: '🧣', text: 'Thick jacket and scarf' },
  },
  th: {
    alertThunder: { icon: '⛈️', text: 'มีพายุฝนฟ้าคะนอง ระวังฟ้าผ่า: อย่าอยู่กลางลานโล่ง ใต้ต้นไม้ใหญ่ หรือริมน้ำ ให้เข้าในอาคารโดยเร็ว' },
    alertDownpour: { icon: '🚨', text: 'มีฝนหนักต่อเนื่อง ควรเลื่อนแผนกลางแจ้ง หลีกเลี่ยงพื้นที่ลุ่มต่ำและริมน้ำ และติดตามสถานการณ์อย่างใกล้ชิด' },
    alertHeavyRain: { icon: '⚠️', text: 'ฝนค่อนข้างหนัก ควรปรับแผน หลีกเลี่ยงจุดที่น้ำท่วมขัง และระวังพื้นลื่นกับขั้นบันได' },
    alertWind: { icon: '💨', text: 'ลมแรง อยู่ห่างป้ายโฆษณา ต้นไม้ใหญ่ และสิ่งปลูกสร้างชั่วคราว ระวังของตกจากที่สูง' },
    alertFog: { icon: '🌫️', text: 'ทัศนวิสัยต่ำ รถโดยสารระยะไกลและเที่ยวบินอาจล่าช้า เผื่อเวลาและระวังการเดินทาง' },
    alertAir: { icon: '😷', text: 'คุณภาพอากาศแย่ ควรลดเวลาอยู่กลางแจ้ง กลุ่มเปราะบางควรอยู่ในอาคารและสวมหน้ากากป้องกัน' },
    alertHot: { icon: '🥵', text: 'อากาศร้อนจัด หลีกเลี่ยงการออกช่วงเที่ยง ลดเวลากลางแจ้ง และระวังโรคลมแดด' },
    alertUv: { icon: '🧴', text: 'UV สูงมาก อยู่กลางแดดนานจะไหม้ง่าย ควรป้องกันแดดให้ครบและดื่มน้ำบ่อย ๆ' },
    outfitRain: { icon: '🧥', text: 'มีฝน ควรใส่เสื้อกันน้ำหรือแห้งเร็ว และรองเท้าที่กันลื่น' },
    outfitHot: { icon: '👕', text: 'อากาศค่อนข้างร้อน ควรใส่ผ้าโปร่งบางสีอ่อน' },
    outfitCold: { icon: '🧣', text: 'อากาศค่อนข้างหนาว ควรใส่เสื้อหนาและพกผ้าพันคอ' },
    outfitDiurnal: { icon: '🧥', text: 'กลางวันกลางคืนต่างกันมาก ควรพกเสื้อคลุมไว้เพิ่ม–ลดได้' },
    outfitHumid: { icon: '👕', text: 'ร้อนชื้น ควรเลือกผ้าที่โปร่งและแห้งเร็ว' },
    outfitNight: { icon: '🧥', text: 'หลังพระอาทิตย์ตกอากาศเย็นลง ควรพกเสื้อคลุมบาง ๆ' },
    planThunder: { icon: '⛔', text: 'ช่วงพายุฝนฟ้าคะนอง กิจกรรมกลางแจ้งและทางน้ำมักปิด อย่าอยู่ในลานโล่งหรือใต้ต้นไม้' },
    planRainHeavy: { icon: '🏛️', text: 'ไม่เหมาะเดินกลางแจ้งนาน ๆ อุโบสถ พิพิธภัณฑ์ และห้างจะเหมาะกว่า และบางกิจกรรมกลางแจ้งอาจปิดชั่วคราว' },
    planRainLikely: { icon: '☂️', text: 'มีโอกาสฝนค่อนข้างสูง ควรเน้นจุดที่อยู่ในร่ม และเผื่อแผนกลางแจ้งให้ยืดหยุ่น' },
    planRainLight: { icon: '🌦️', text: 'มีฝนเล็กน้อย ประสบการณ์กลางแจ้งจะลดลง พื้นลื่นควรเดินช้า ๆ' },
    planWind: { icon: '🌬️', text: 'ลมค่อนข้างแรง เครื่องเล่นกลางแจ้งและเรืออาจหยุดให้บริการ ควรเลือกตรอกที่กำบังลม' },
    planFog: { icon: '🌫️', text: 'ทัศนวิสัยต่ำ ไม่เหมาะชมวิวหรือขึ้นที่สูง ควรเปลี่ยนเป็นตรอกในเวียงและจุดในร่ม' },
    planAir: { icon: '😷', text: 'คุณภาพอากาศปานกลาง ควรลดกิจกรรมกลางแจ้งที่ใช้แรง และกลุ่มเปราะบางควรลดเวลากลางแจ้ง' },
    planAirBad: { icon: '😷', text: 'คุณภาพอากาศแย่ ควรหลีกเลี่ยงกิจกรรมกลางแจ้งนาน ๆ และกลุ่มเปราะบางควรเน้นจุดท่องเที่ยวในร่ม' },
    planHeatIsland: { icon: '🌡️', text: 'ลานและถนนแผ่ความร้อนมาก ควรเดินด้านในกำแพงและใต้ร่มไม้ ช่วงบ่ายไปหลบร้อนในอุโบสถ พิพิธภัณฑ์ หรือห้าง' },
    planHeat: { icon: '🕒', text: 'อากาศร้อน ควรลดเวลาเที่ยวกลางแจ้ง และพักในร่มช่วงเที่ยง' },
    planUv: { icon: '🕶️', text: 'UV ค่อนข้างสูง ช่วงเที่ยงควรหลบแดด และย้ายเวลาถ่ายรูปไปเช้าหรือเย็น' },
    planHumid: { icon: '🥤', text: 'ร้อนชื้นมาก ดื่มน้ำบ่อย และพักในที่แอร์หรือใต้ร่มทุกช่วงสั้น ๆ' },
    planClear: { icon: '📷', text: 'อากาศดี เหมาะเดินเที่ยวกลางแจ้ง แสงช่วงเช้าตรู่และเย็นเหมาะถ่ายรูปที่สุด' },
    planCloudy: { icon: '📷', text: 'แสงนุ่ม ถ่ายรูปสวย ไม่มีแดดแรง เหมาะเดินกลางแจ้งได้นาน' },
    planNight: { icon: '🌙', text: 'กลางคืนลานเปิดไฟถ่ายรูปสวย ระวังอุณหภูมิที่ลดลงและทรัพย์สินติดตัว' },
    itemUmbrella: { icon: '☂️', text: 'ร่มพับ' },
    itemRaincoat: { icon: '🧥', text: 'เสื้อกันฝน (ลมแรงใช้ได้ปลอดภัยกว่าร่มยาว)' },
    itemShoes: { icon: '👟', text: 'รองเท้ากันลื่น' },
    itemSunscreen: { icon: '🧴', text: 'ครีมกันแดด' },
    itemSunglasses: { icon: '🕶️', text: 'แว่นกันแดด' },
    itemSunhat: { icon: '🧢', text: 'หมวกกันแดด' },
    itemWater: { icon: '💧', text: 'น้ำดื่มเพียงพอ' },
    itemMask: { icon: '😷', text: 'หน้ากากป้องกัน' },
    itemMosquito: { icon: '🦟', text: 'ยากันยุง' },
    itemJacket: { icon: '🧥', text: 'เสื้อคลุมบาง' },
    itemWarm: { icon: '🧣', text: 'เสื้อหนาและผ้าพันคอ' },
  },
};

const WIND_UNIT: Record<WeatherLang, (kmh: number, level: number) => string> = {
  zh: (kmh, level) => `${kmh} km/h · ${level} 级风`,
  en: (kmh, level) => `${kmh} km/h · level ${level}`,
  th: (kmh, level) => `${kmh} กม./ชม. · ระดับ ${level}`,
};

const AIR_LEVEL_TEXT: Record<WeatherLang, Record<AirView['level'], string>> = {
  zh: { good: '良好', fair: '一般', poor: '较差', bad: '差' },
  en: { good: 'Good', fair: 'Moderate', poor: 'Poor', bad: 'Very poor' },
  th: { good: 'ดี', fair: 'ปานกลาง', poor: 'แย่', bad: 'แย่มาก' },
};

const AIR_LABEL: Record<WeatherLang, string> = { zh: '空气质量', en: 'Air quality', th: 'คุณภาพอากาศ' };

function describe(code: number, lang: WeatherLang): string {
  return DESCRIPTIONS[lang][code] ?? DESCRIPTIONS[lang][2];
}

function iconFor(code: number): string {
  return ICONS[code] ?? '🌤️';
}

function clock(isoLike: string): string {
  const i = isoLike.indexOf('T');
  return i === -1 ? '' : isoLike.slice(i + 1, i + 16);
}

function weekdayIndex(date: string, fallback: number): number {
  const parsed = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return fallback;
  // JS: 0=周日；转换为 0=周一
  return (parsed.getUTCDay() + 6) % 7;
}

/** 风速（km/h）转蒲福风力等级，用于口语化描述与阈值判断 */
function beaufort(kmh: number): number {
  const thresholds = [1, 5, 11, 19, 28, 38, 49, 61, 74, 88, 102, 117];
  let level = 0;
  for (const t of thresholds) if (kmh >= t) level += 1;
  return level;
}

function airLevel(air: AirQuality): AirView['level'] {
  const score = air.usAqi > 0 ? air.usAqi : air.pm25 * 2;
  if (score <= 50) return 'good';
  if (score <= 100) return 'fair';
  if (score <= 150) return 'poor';
  return 'bad';
}

function buildAirView(air: AirQuality | null, lang: WeatherLang): AirView | null {
  if (!air) return null;
  const level = airLevel(air);
  const label = AIR_LEVEL_TEXT[lang][level];
  const pm = Math.round(air.pm25);
  const aqi = Math.round(air.usAqi);
  // 优先给出综合空气质量指数，缺失时退化为细颗粒物浓度，避免两个口径互相矛盾
  const metric = aqi > 0 ? `AQI ${aqi}` : `PM2.5 ${pm}`;
  const text =
    lang === 'zh'
      ? `${AIR_LABEL.zh}：${label}（${metric}）`
      : lang === 'en'
        ? `${AIR_LABEL.en}: ${label} (${metric})`
        : `${AIR_LABEL.th}: ${label} (${metric})`;
  return { level, text, pm25: pm, usAqi: aqi };
}

/**
 * 依据快照生成结构化建议。
 * 规则全部为「命中才输出」，因此页面不会出现与当天无关的条目；
 * 一旦命中风险预警，则压缩常规条目的数量，把注意力让给安全与行程调整。
 */
function buildAdvice(snapshot: WeatherSnapshot, lang: WeatherLang): WeatherAdvice {
  const book = ADVICE_TEXT[lang];
  const c = snapshot.current;
  const d = snapshot.days[0];
  const code = d?.code ?? c.code;
  const tMax = d?.tMax ?? c.temp;
  const tMin = d?.tMin ?? c.temp;
  const feelsMax = d?.feelsMax ?? c.feelsLike;
  const uv = d?.uv ?? 0;
  const prob = d?.precipProb ?? 0;
  const rainSum = d?.precipSum ?? 0;
  const windMax = d?.windMax ?? c.wind;
  const gustMax = d?.gustMax ?? c.gust;
  const windLevel = Math.max(beaufort(c.wind), beaufort(windMax));
  const gustLevel = beaufort(gustMax);
  const visibility = c.visibility;
  const air = snapshot.air;

  const isThunder = code === 95 || code === 96 || code === 99 || (c.code >= 95 && c.code <= 99);
  const isHeavyRain = code === 63 || code === 65 || code === 67 || code === 81 || code === 82;
  const isLightRain = (code >= 51 && code <= 57) || code === 61 || code === 80;
  const rainy = isThunder || isHeavyRain || isLightRain;
  const rainLikely = prob >= 60 || rainSum >= 5;
  const rainMaybe = !rainLikely && (prob >= 35 || rainy);
  const heavyRainLikely = isHeavyRain || rainSum >= 15 || prob >= 85;
  const downpour = rainSum >= 30;
  // 高温类建议只在白天给出：夜间页面应聚焦夜间出行提示
  const hot = c.isDay && (tMax >= 32 || feelsMax >= 35);
  const veryHot = c.isDay && (feelsMax >= 38 || tMax >= 36);
  const cold = tMax <= 10;
  const diurnal = tMax - tMin > 8;
  const windy = windLevel >= 5 || gustLevel >= 6;
  const veryWindy = windLevel >= 7 || gustLevel >= 8;
  const humid = c.humidity >= 75 && c.temp >= 27;
  const uvStrong = uv >= 5;
  const uvVeryStrong = uv >= 10;
  const foggy = code === 45 || code === 48 || (visibility > 0 && visibility < 1000);
  const lowVisibility = !foggy && visibility > 0 && visibility < 5000;
  const airLevelValue = air ? airLevel(air) : 'good';
  const airBad = airLevelValue === 'bad' || airLevelValue === 'poor';
  const airFair = airLevelValue === 'fair';

  const alerts: AdviceItem[] = [];
  const outfit: AdviceItem[] = [];
  const plan: AdviceItem[] = [];
  const items: AdviceItem[] = [];

  const push = (list: AdviceItem[], key: string, cap: number) => {
    if (list.length >= cap) return;
    const entry = book[key];
    if (!entry) return;
    if (list.some((x) => x.text === entry.text)) return;
    list.push({ icon: entry.icon, text: entry.text });
  };

  // 1) 风险预警：优先级最高
  if (isThunder) push(alerts, 'alertThunder', 3);
  if (downpour) push(alerts, 'alertDownpour', 3);
  else if (heavyRainLikely) push(alerts, 'alertHeavyRain', 3);
  if (veryWindy) push(alerts, 'alertWind', 3);
  if (foggy) push(alerts, 'alertFog', 3);
  if (airBad) push(alerts, 'alertAir', 3);
  if (veryHot) push(alerts, 'alertHot', 3);
  if (uvVeryStrong) push(alerts, 'alertUv', 3);
  const hasAlert = alerts.length > 0;

  // 2) 出行穿搭
  const outfitCap = hasAlert ? 2 : 3;
  if (rainy || rainLikely) push(outfit, 'outfitRain', outfitCap);
  else if (hot) push(outfit, 'outfitHot', outfitCap);
  if (cold) push(outfit, 'outfitCold', outfitCap);
  else if (diurnal) push(outfit, 'outfitDiurnal', outfitCap);
  else if (!c.isDay) push(outfit, 'outfitNight', outfitCap);
  if (humid) push(outfit, 'outfitHumid', outfitCap);

  // 3) 游玩安排
  const planCap = hasAlert ? 2 : 3;
  if (isThunder) push(plan, 'planThunder', planCap);
  if (heavyRainLikely) push(plan, 'planRainHeavy', planCap);
  else if (rainLikely) push(plan, 'planRainLikely', planCap);
  else if (rainMaybe) push(plan, 'planRainLight', planCap);
  if (windy) push(plan, 'planWind', planCap);
  if (foggy || lowVisibility) push(plan, 'planFog', planCap);
  if (airBad) push(plan, 'planAirBad', planCap);
  else if (airFair) push(plan, 'planAir', planCap);
  if (veryHot) push(plan, 'planHeat', planCap);
  else if (hot) push(plan, 'planHeatIsland', planCap);
  if (uvStrong) push(plan, 'planUv', planCap);
  if (humid) push(plan, 'planHumid', planCap);
  if (plan.length === 0) {
    if (!c.isDay) push(plan, 'planNight', planCap);
    else if (code === 0 || code === 1) push(plan, 'planClear', planCap);
    else push(plan, 'planCloudy', planCap);
  }

  // 4) 随身物品
  const itemCap = hasAlert ? 5 : 6;
  if (rainy || rainLikely) {
    if (veryWindy || heavyRainLikely) push(items, 'itemRaincoat', itemCap);
    else push(items, 'itemUmbrella', itemCap);
    push(items, 'itemShoes', itemCap);
  } else if (rainMaybe) {
    push(items, 'itemUmbrella', itemCap);
  }
  if (uvStrong) {
    push(items, 'itemSunscreen', itemCap);
    push(items, 'itemSunglasses', itemCap);
    push(items, 'itemSunhat', itemCap);
  }
  if (hot || humid || uvStrong) push(items, 'itemWater', itemCap);
  if (airBad || airFair || foggy) push(items, 'itemMask', itemCap);
  if (rainy || humid) push(items, 'itemMosquito', itemCap);
  if (cold) push(items, 'itemWarm', itemCap);
  else if (diurnal) push(items, 'itemJacket', itemCap);

  return { alerts, outfit, plan, items };
}

/** 将原始快照整理为可渲染视图 */
export function buildWeatherView(snapshot: WeatherSnapshot | null, lang: WeatherLang): WeatherView | null {
  if (!snapshot) return null;
  const c = snapshot.current;
  const today = snapshot.days[0];
  const windLevel = Math.max(beaufort(c.wind), beaufort(today?.windMax ?? c.wind));

  return {
    ok: true,
    time: clock(c.time),
    tempText: `${Math.round(c.temp)}°C`,
    desc: describe(c.code, lang),
    icon: iconFor(c.code),
    feelsText: `${Math.round(c.feelsLike)}°C`,
    humidity: Math.round(c.humidity),
    windText: WIND_UNIT[lang](Math.round(c.wind), windLevel),
    precipText: `${Math.round(today?.precipSum ?? c.precipitation)} mm`,
    isDay: c.isDay,
    updatedAt: clock(c.time),
    air: buildAirView(snapshot.air, lang),
    advice: buildAdvice(snapshot, lang),
    days: snapshot.days.map((d, i) => ({
      date: d.date,
      weekday: weekdayIndex(d.date, i),
      desc: describe(d.code, lang),
      icon: iconFor(d.code),
      tMax: Math.round(d.tMax),
      tMin: Math.round(d.tMin),
      precipProb: Math.round(d.precipProb),
      uv: Math.round(d.uv),
      sunrise: clock(d.sunrise),
      sunset: clock(d.sunset),
      rainLikely: d.precipProb >= 50,
      uvHigh: d.uv >= 8,
    })),
  };
}

/** 一步获取指定语言的天气视图 */
export async function getWeatherView(lang: WeatherLang): Promise<WeatherView | null> {
  const snapshot = await getWeather();
  return buildWeatherView(snapshot, lang);
}
