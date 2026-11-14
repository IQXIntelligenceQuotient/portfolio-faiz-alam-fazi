export const siteUrl = (process.env.DEPLOYMENT_SITE_URL || 'https://faizalamfaizi.com').replace(/\/$/, '');
export const siteBase = new URL(siteUrl).pathname.replace(/\/$/, '') + '/';
