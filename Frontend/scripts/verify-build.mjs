import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const routes=JSON.parse(await fs.readFile('dist/routes.json','utf8'));
let checked=0;
for(const route of routes){
 const html=await fs.readFile(`dist${route==='/'?'':route}/index.html`,'utf8');
 const head=html.slice(0,html.indexOf('</head>'));
 for(const pattern of [/<title[^>]*>[^<]+<\/title>/, /name="description"[^>]+content="[^"]+"/, /rel="canonical"/, /property="og:title"/, /application\/ld\+json/]) assert.match(head,pattern,route);
 assert.equal((head.match(/rel="canonical"/g)||[]).length,1,`Duplicate canonical ${route}`);
 assert.match(head,new RegExp(`https://faizalamfaizi.com${route.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}`));
 for(const pattern of [/<h1[\s>]/,/<p[\s>]/,/<a[^>]+href=/,/<img[^>]+alt=/,/Planning a consultation/,/<details/])assert.match(html,pattern,route);
 assert.ok(!html.includes('src="/src/main.jsx"'),route);
 for(const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g))JSON.parse(match[1]);
 for(const match of html.matchAll(/(?:src|href)="(\/[^"#?]*)[^" ]*"/g)){
  const target=decodeURIComponent(match[1]);if(target.startsWith('//'))continue;
  const p=`dist${target}`;
  let exists=await fs.stat(p).catch(()=>null);
  if(!exists && !target.startsWith('/admin'))throw new Error(`Missing local target ${target} on ${route}`);
  checked++;
 }
}
for(const f of ['robots.txt','sitemap.xml','sitemap-index.xml','image-sitemap.xml','llms.txt','humans.txt','site.webmanifest','favicon.png','CNAME','.nojekyll','404.html'])await fs.access(`dist/${f}`);
assert.match(await fs.readFile('dist/image-sitemap.xml','utf8'),/xmlns:image="http:\/\/www.google.com\/schemas\/sitemap-image\/1.1"/);
console.log(`Verified ${routes.length} static routes, JSON-LD and ${checked} local targets.`);

