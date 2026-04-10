// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';
import node from '@astrojs/node';

import db from '@astrojs/db';

// https://astro.build/config
// update
const useNodeAdapter = process.env.ASTRO_LOCAL_ADAPTER === 'node';

export default defineConfig({
  site: 'https://example.com',
  integrations: [
    mdx(),
    sitemap(),
    ...(useNodeAdapter ? db() : db({ mode: 'web' })),
  ],
  output: 'server',
  adapter: useNodeAdapter
    ? node({
        mode: 'standalone',
      })
    : cloudflare({
        prerenderEnvironment: 'node',
      }),
});
