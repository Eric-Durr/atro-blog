// @ts-check
import { fileURLToPath } from 'node:url';

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap()],
  output: 'server',
  adapter: cloudflare({
    prerenderEnvironment: 'node',
  }),
  vite: {
    resolve: {
      alias: {
        'cross-fetch': fileURLToPath(
          new URL('./src/lib/shims/cross-fetch.ts', import.meta.url),
        ),
      },
    },
  },
});
