import { siteUrl, siteBase } from './deployment-config.mjs';
import fs from 'node:fs/promises';
import { createServer } from 'vite';
async function fetchPublic(url, options) {
  let last;
  for (let attempt=0; attempt<3; attempt++) {
    try { const response=await fetch(url,options); if(response.status>=500) throw new Error('API '+response.status); return response; }
    catch(error) { last=error; if(attempt<2) await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1))); }
  }
  throw last;
}
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
  const app = await fs.readFile('src/App.jsx', 'utf8');
  const routes = [...app.matchAll(/path="([^"]+)"/g)].map(m=>m[1]).filter(p=>!p.includes(':') && !p.includes('*') && !p.startsWith('/admin'));
  const res = await fetchPublic('https://api.faizalamfaizi.com/api/posts', {signal: AbortSignal.timeout(30000)});
  if (!res.ok) throw new Error(`Published article discovery failed: ${res.status}`);
  const data = await res.json();
  const posts = (data.data || data.posts || data).filter(p=>p.status==='published');
  globalThis.__SSG_POSTS__ = posts;
  for (const post of posts) {
    if (!/^[a-zA-Z0-9_-]+$/.test(post.slug)) throw new Error('Unsafe post slug');
    const response = await fetchPublic(`https://api.faizalamfaizi.com/api/posts/${post.slug}`, {signal: AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error(`Article fetch failed: ${post.slug}`);
    const result = await response.json(); Object.assign(post, result.data || result);
    routes.push(`/blogs/${post.slug}`);
  }
  // CNAME cannot switch the repository setting. The github.io build must not ship it.
  if (new URL(siteUrl).hostname.endsWith('.github.io')) await fs.rm('dist/CNAME', {force:true});
  else await fs.writeFile('dist/CNAME', new URL(siteUrl).hostname + '\n');
  const manifest = JSON.parse(await fs.readFile('public/site.webmanifest', 'utf8'));
  const assetPath = value => value.startsWith(siteBase) ? value : siteBase + value.replace(/^\//, '');
  manifest.start_url = siteBase; manifest.scope = siteBase;
  manifest.icons = manifest.icons.map(icon => ({...icon, src: assetPath(icon.src)}));
  await fs.writeFile('dist/site.webmanifest', JSON.stringify(manifest, null, 2));
  const template = await fs.readFile('dist/index.html', 'utf8');
  // SEOHead owns route metadata. Retain only encoding, viewport, theme, icons and build assets.
  const clean = template.replace(/<title>[\s\S]*?<\/title>/g,'').replace(/<meta\s+(?:name="(?:description|keywords|author|robots|geo\.[^"]+|ICBM|twitter:[^"]+)"|property="[^"]+")[^>]*>/g,'').replace(/<link\s+rel="(?:canonical|alternate)"[^>]*>/g,'').replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g,'');
  for (const route of [...routes, '/404']) {
    const { html, head } = await render(route);
    const target = route === '/404' ? 'dist/404.html' : `dist${route === '/' ? '' : route}/index.html`;
    await fs.mkdir(target.slice(0,target.lastIndexOf('/')), {recursive:true});
    const snapshot = JSON.stringify(posts).replaceAll('<','\\u003c');
    await fs.writeFile(target, clean.replace('</head>',`${head}</head>`).replace('<div id="root"></div>',`<div id="root">${html}</div><script>window.__SSG_POSTS__=${snapshot}</script>`));
  }
  await fs.writeFile('dist/routes.json', JSON.stringify(routes));
  console.log(`Prerendered ${routes.length} public routes and 404.html`);
} finally { await server.close(); }
