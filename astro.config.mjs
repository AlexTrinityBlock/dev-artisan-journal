// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.alextrinitywolf.com',
  base: '/',
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
  },
  vite: {
    resolve: {
      alias: {
        // Astro sync inlines every dep (`ssr.external: []`) and Vite 8 has no
        // CommonJS transform, so the CJS `picomatch` (via `tinyglobby`'s glob
        // loader) would break the module runner with "require is not defined".
        // The wrapper loads it through `createRequire` instead. See
        // vendor/picomatch.mjs for details.
        picomatch: fileURLToPath(new URL('./vendor/picomatch.mjs', import.meta.url)),
      },
    },
  },
});
