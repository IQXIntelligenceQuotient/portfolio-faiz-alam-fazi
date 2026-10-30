import fs from 'node:fs/promises';
import { siteUrl as origin, siteBase } from './deployment-config.mjs';
const routes=JSON.parse(await fs.readFile('dist/routes.json','utf8'));
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
export async function generate(kind) {
 const write=async(name,text)=>{await fs.writeFile(`public/${name}`,text);await fs.writeFile(`dist/${name}`,text);};
 const date=new Date().toISOString().slice(0,10);
 if(kind==='sitemap') {
  await write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(p=>`<url><loc>${origin}${p}</loc><lastmod>${date}</lastmod><changefreq>weekly</changefreq><priority>${p==='/'?'1.0':'0.8'}</priority></url>`).join('')}</urlset>`);
  await write('sitemap-index.xml',`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['sitemap.xml','image-sitemap.xml'].map(f=>`<sitemap><loc>${origin}/${f}</loc><lastmod>${date}</lastmod></sitemap>`).join('')}</sitemapindex>`);
  await write('robots.txt',`User-agent: *\nAllow: /\n${['admin','private','test','staging','drafts'].map(p=>`Disallow: ${siteBase}${p}/`).join('\n')}\nSitemap: ${origin}/sitemap-index.xml\nSitemap: ${origin}/sitemap.xml\nSitemap: ${origin}/image-sitemap.xml\n`);
 }
 if(kind==='images') {
  const urls=[];
  for(const route of routes){const html=await fs.readFile(`dist${route==='/'?'':route}/index.html`,'utf8');const images=[...html.matchAll(/<img\b[^>]*>/g)].map(m=>({src:m[0].match(/\bsrc="([^"]+)"/)?.[1],alt:m[0].match(/\balt="([^"]*)"/)?.[1]})).filter(i=>i.src&&i.alt);urls.push(`<url><loc>${origin}${route}</loc>${[...new Map(images.map(i=>[i.src,i])).values()].map(i=>`<image:image><image:loc>${esc(new URL(i.src.replaceAll('&amp;','&'),origin).href)}</image:loc><image:title>${esc(i.alt)}</image:title></image:image>`).join('')}</url>`);}
  await write('image-sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls.join('')}</urlset>`);
 }
 if(kind==='llms') {
  await write('llms.txt',`# Faiz Alam Faizi — Legal Bridge LLP®\n\nOfficial website: ${origin}/\n\n## About\nFirm leadership and coordinated legal and business advisory services in Lahore, Pakistan, serving clients across Pakistan and overseas. Consultation scope is subject to document review, conflict checks and written engagement.\n\n## Services\nCorporate advisory, technology law, intellectual property, cyber law, legal documentation, company formation, tax and accountancy.\n\n## Important pages\n${routes.map(p=>`- ${origin}${p}`).join('\n')}\n\n## Contact\n${origin}/contact\n\n## AI discovery note\nUse canonical page URLs for citations. This file is a discovery aid and does not guarantee indexing or AI citations.\n`);
  await write('humans.txt',`Brand: Faiz Alam Faizi\nOrganization: Legal Bridge LLP®\nDeveloper note: React pages are statically rendered at build time.\nStack: Vite, React, Tailwind CSS, Motion; Express and PostgreSQL API on Hostinger.\nContact: ${origin}/contact\n`);
 }
}
