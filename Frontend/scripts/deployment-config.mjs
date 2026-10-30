export const siteUrl = (process.env.DEPLOYMENT_SITE_URL || 'https://iqxintelligencequotient.github.io/portfolio-faiz-alam-fazi').replace(/\/$/, '');
export const siteBase = new URL(siteUrl).pathname.replace(/\/$/, '') + '/';
