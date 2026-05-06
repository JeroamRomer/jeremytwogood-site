import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jeremytwogood.com',
  output: 'static',
  integrations: [sitemap()],
});
