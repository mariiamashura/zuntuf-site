import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set SITE once the final address is known (custom domain later = change only this).
const SITE = process.env.SITE_URL || 'https://zuntuf.workers.dev';

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
