import { resolve } from 'path';
import { Plugin, defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { ViteMinifyPlugin } from 'vite-plugin-minify';
import { eleventyPlugin } from 'vite-plugin-eleventy';
import fs from "node:fs/promises";

export default defineConfig({
  plugins: [
    handlebars({
      partialDirectory: resolve(__dirname, 'partials'),
      helpers: {
        "id-from-title": (title: string) => title.replace(/[\s:]/g, "_")
      }
    }) as Plugin,
    ViteMinifyPlugin({
      processScripts: ['application/ld+json'],
      keepClosingSlash: true
    }),
    eleventyPlugin({
      replace: [
        ["./blog", "blog"]
      ]
    }),
    {
      name: 'rss-workaround',
      closeBundle: async () => {
        let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
        xml += await fs.readFile("dist/blog/feed.html", { encoding: "utf8" });
        await fs.writeFile("dist/blog/feed.xml", xml, { encoding: "utf8" });
        await fs.unlink("dist/blog/feed.html");
      }
    },
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        works: resolve(__dirname, 'works/index.html'),
        about: resolve(__dirname, 'about/index.html'),
      }
    },
    assetsInlineLimit: 0
  },
})