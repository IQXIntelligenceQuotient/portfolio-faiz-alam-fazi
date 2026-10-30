export const siteBase = import.meta.env.BASE_URL;
export function sitePath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
  if (siteBase === '/' || value === siteBase.slice(0, -1) || value.startsWith(siteBase)) return value;
  return siteBase + value.slice(1);
}
