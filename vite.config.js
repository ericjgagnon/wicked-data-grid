/**
 * @format
 */
import path from 'path';
import { URL } from 'url';
import { defineConfig } from 'vite';

const dirname = new URL('.', import.meta.url).pathname;

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(dirname, 'src/main.ts'),
      name: 'Wicked DataGrid',
      fileName: (format) => `wicked-data-grid.${format}.js`,
    },
  },
  test: {
    environment: 'jsdom',
    threads: false,
  },
});
