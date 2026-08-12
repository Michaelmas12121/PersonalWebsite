// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Version 4 is the only active site in this repository. The root keeps a
  // short redirect so the room can retain its explicit version address while
  // it is being finished.
  redirects: {
    '/': '/v4',
  },

  vite: {
    plugins: [tailwindcss()]
  }
});
