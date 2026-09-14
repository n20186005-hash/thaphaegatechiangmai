import type { APIRoute } from 'astro';
import { getWeatherView, type WeatherLang } from '../../lib/weather';

// 该路由按需在服务端渲染（边缘运行时），并在边缘节点缓存结果
export const prerender = false;

const ALLOWED: WeatherLang[] = ['zh', 'en', 'th'];

function pickLang(raw: string | null): WeatherLang {
  const value = (raw ?? '').toLowerCase().slice(0, 2);
  return (ALLOWED as string[]).includes(value) ? (value as WeatherLang) : 'th';
}

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=600, s-maxage=1800, stale-while-revalidate=3600',
      ...extra,
    },
  });
}

export const GET: APIRoute = async ({ url, locals }) => {
  const lang = pickLang(url.searchParams.get('lang'));

  const edge = (globalThis as any)?.caches?.default as
    | { match: (req: Request) => Promise<Response | undefined>; put: (req: Request, res: Response) => Promise<void> }
    | undefined;

  const cacheKey = new Request(`https://weather-cache.internal/forecast?lang=${lang}`, { method: 'GET' });
  const waitUntil = (locals as any)?.runtime?.ctx?.waitUntil as ((p: Promise<unknown>) => void) | undefined;

  if (edge) {
    try {
      const hit = await edge.match(cacheKey);
      if (hit) return hit;
    } catch {
      /* 缓存不可用时忽略 */
    }
  }

  const view = await getWeatherView(lang);
  if (!view) {
    return json({ ok: false }, 503, { 'cache-control': 'no-store' });
  }

  const response = json(view, 200);
  if (edge) {
    try {
      const task = edge.put(cacheKey, response.clone());
      if (waitUntil) waitUntil(task);
      else await task;
    } catch {
      /* 忽略缓存写入失败 */
    }
  }
  return response;
};
