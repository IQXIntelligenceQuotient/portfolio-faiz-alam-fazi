import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { PassThrough } from 'node:stream';
import App from './App.jsx';
export async function render(url) {
  const context = {};
  let html = await new Promise((resolve, reject) => {
    const output = new PassThrough(); let text = '';
    output.on('data', chunk => { text += chunk; });
    output.on('end', () => resolve(text)); output.on('error', reject);
    const stream = renderToPipeableStream(<HelmetProvider context={context}><App url={url} /></HelmetProvider>, {
      onAllReady() { stream.pipe(output); }, onError: reject,
    });
  });
  const tags = [];
  html = html.replace(/<title>[\s\S]*?<\/title>|<meta\b[^>]*>|<link\b[^>]*>|<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g, tag => { tags.push(tag.replace(/^<([a-z]+)/, '<$1 data-ssg="true"')); return ''; });
  return { html, head: tags.join('\n') };
}
