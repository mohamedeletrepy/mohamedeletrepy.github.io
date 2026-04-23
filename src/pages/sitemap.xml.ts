import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const site = 'https://mohamedeletrepy.github.io';

  const staticPages = ['', '/blog', '/about', '/tags'];

  const postUrls = posts.map(post => ({
    url: `${site}/blog/${post.slug}/`,
    lastmod: post.data.pubDate.toISOString().split('T')[0],
  }));

  const allUrls = [
    ...staticPages.map(p => ({ url: `${site}${p}/`, lastmod: new Date().toISOString().split('T')[0] })),
    ...postUrls,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(({ url, lastmod }) => `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
