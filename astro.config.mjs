import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set SITE once the final address is known (custom domain later = change only this,
// or set the SITE_URL build variable in Cloudflare, which overrides this fallback).
const SITE = process.env.SITE_URL || 'https://zuntuf-site.kolobokgames.workers.dev';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de', 'ua'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', de: 'de', ua: 'uk' } },
    }),
  ],
});
