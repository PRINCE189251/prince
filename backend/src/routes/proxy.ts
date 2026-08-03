import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import axios from 'axios';
import cheerio from 'cheerio';
import { URL } from 'url';
import xss from 'xss';
import { RedisClientType } from 'redis';

const limiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

const isValidUrl = (input: string) => {
  try {
    const url = new URL(input);
    return ['http:', 'https:'].includes(url.protocol);
  } catch (err) {
    return false;
  }
};

const ssrfBlocklist = ['127.0.0.1', '::1', 'localhost'];

const sanitizeHtml = (html: string) => {
  // Use a simple sanitizer here; for enterprise use a robust library
  return xss(html);
};

const rewriteLinks = (html: string, baseUrl: string) => {
  const $ = cheerio.load(html);
  $('a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && !href.startsWith('javascript:')) {
      const absolute = new URL(href, baseUrl).toString();
      $(el).attr('href', `/api/proxy?url=${encodeURIComponent(absolute)}`);
      $(el).attr('target', '_self');
    }
  });
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    if (src && !src.startsWith('data:')) {
      const absolute = new URL(src, baseUrl).toString();
      $(el).attr('src', `/api/proxy?url=${encodeURIComponent(absolute)}`);
    }
  });

  // Rewrite CSS/JS
  $('link[rel="stylesheet"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const absolute = new URL(href, baseUrl).toString();
      $(el).attr('href', `/api/proxy?url=${encodeURIComponent(absolute)}`);
    }
  });
  $('script').each((_, el) => {
    const src = $(el).attr('src');
    if (src) {
      const absolute = new URL(src, baseUrl).toString();
      $(el).attr('src', `/api/proxy?url=${encodeURIComponent(absolute)}`);
      $(el).attr('crossorigin', 'anonymous');
    }
  });

  return $.html();
};

const proxyRouter = (redis: RedisClientType<any, any>) => {
  const router = Router();
  router.use(limiter);

  router.get('/', async (req, res) => {
    const url = req.query.url as string;
    if (!url || !isValidUrl(url)) return res.status(400).json({ error: 'Invalid URL' });

    try {
      const parsed = new URL(url);
      if (ssrfBlocklist.includes(parsed.hostname)) return res.status(403).json({ error: 'Blocked' });

      // Simple cache layer
      const cacheKey = `proxy:${url}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        res.setHeader('x-cache', 'HIT');
        return res.send(cached);
      }

      const response = await axios.get(url, { responseType: 'text', maxRedirects: 5 });
      let html = response.data as string;

      // Only rewrite for HTML
      if (response.headers['content-type']?.includes('text/html')) {
        html = sanitizeHtml(html);
        html = rewriteLinks(html, url);
      }

      await redis.setEx(cacheKey, 60, html);
      res.setHeader('x-cache', 'MISS');
      res.send(html);
    } catch (err: any) {
      console.error(err?.message || err);
      res.status(500).json({ error: 'Failed to fetch' });
    }
  });

  return router;
};

export default proxyRouter;
