// Runs before `vite dev` and `vite build`; writes public/sitemap.xml.
import { writeFileSync } from "fs";
import { resolve } from "path";

// TODO: replace with your project URL once a custom domain is set.
const BASE_URL = "";

interface SitemapEntry {
  path: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
}

const entries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/explore", changefreq: "daily", priority: "0.9" },
  { path: "/vibe-matcher", changefreq: "weekly", priority: "0.8" },
  { path: "/gears", changefreq: "daily", priority: "0.8" },
  { path: "/login", changefreq: "monthly", priority: "0.3" },
  { path: "/signup", changefreq: "monthly", priority: "0.4" },
  { path: "/help", changefreq: "monthly", priority: "0.3" },
  { path: "/terms", changefreq: "monthly", priority: "0.2" },
  { path: "/privacy", changefreq: "monthly", priority: "0.2" },
];

const xml = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
  ...entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ].filter(Boolean).join("\n"),
  ),
  `</urlset>`,
].join("\n");

writeFileSync(resolve("public/sitemap.xml"), xml);
console.log(`sitemap.xml written (${entries.length} entries)`);
