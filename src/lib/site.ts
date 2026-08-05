const localSiteUrl = 'http://localhost:3000';
const productionSiteUrl = 'https://www.pixconvertly.site';

export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const resolvedUrl = process.env.NODE_ENV === 'production'
    ? productionSiteUrl
    : (configuredUrl || localSiteUrl);

  const url = new URL(resolvedUrl);

  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('NEXT_PUBLIC_SITE_URL must use http or https.');
  }

  if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
    throw new Error('NEXT_PUBLIC_SITE_URL must use https in production.');
  }

  return url.origin;
}
