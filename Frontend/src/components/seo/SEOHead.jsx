import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://faizalamfaizi.com';
const DEFAULT_OG = `${SITE_URL}/1-Best-Legal_Consultant-near-me.webp`;

/**
 * Reusable SEO Head component — Pakistan SEO + GEO + AEO optimized
 * Uses react-helmet-async (already installed)
 */
export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = 'website',
  noindex = false,
  schema,
  // Article-specific props (only used when ogType === 'article')
  articleTags = [],
  publishedTime,
  modifiedTime,
  category,
}) {
  schema ||= { '@context': 'https://schema.org', '@type': 'WebPage', name: title, description, url: canonical?.startsWith('http') ? canonical : SITE_URL + (canonical || '/') };
  const fullCanonical = canonical?.startsWith('http')
    ? canonical
    : `${SITE_URL}${canonical || '/'}`;

  const fullOgImage = ogImage?.startsWith('http')
    ? ogImage
    : (ogImage ? `${SITE_URL}${ogImage}` : DEFAULT_OG);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'} />
      <meta name="author" content="Legal Bridge LLP®" />
      <meta name="geo.region" content="PK" />
      <meta name="geo.placename" content="Lahore, Pakistan" />
      <meta name="geo.position" content="31.5204;74.3587" />
      <meta name="ICBM" content="31.5204, 74.3587" />

      {/* Canonical */}
      <link rel="canonical" href={fullCanonical} />

      {/* Hreflang */}
      <link rel="alternate" hrefLang="en-pk" href={fullCanonical} />
      <link rel="alternate" hrefLang="x-default" href={fullCanonical} />

      {/* Open Graph — base */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Legal Bridge LLP®" />
      <meta property="og:locale" content="en_PK" />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:alt" content={title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      {/* Open Graph — article-specific (Facebook/Instagram use these) */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={new Date(publishedTime).toISOString()} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={new Date(modifiedTime).toISOString()} />
      )}
      {ogType === 'article' && (
        <meta property="article:author" content="https://faizalamfaizi.com/about-faiz-alam-faizi" />
      )}
      {ogType === 'article' && category && (
        <meta property="article:section" content={category} />
      )}
      {/* One og:article:tag per tag — Facebook reads all of these */}
      {ogType === 'article' && articleTags.map((tag, i) => (
        <meta key={i} property="article:tag" content={tag.name} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullCanonical} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      {ogType === 'article' && articleTags.length > 0 && (
        <meta name="twitter:label1" content="Topics" />
      )}
      {ogType === 'article' && articleTags.length > 0 && (
        <meta name="twitter:data1" content={articleTags.map((t) => t.name).join(', ')} />
      )}

      {/* JSON-LD Schema */}
      {schema && Array.isArray(schema)
        ? schema.map((s, i) => (
            <script key={i} type="application/ld+json">
              {JSON.stringify(s, null, 0)}
            </script>
          ))
        : schema && (
            <script type="application/ld+json">
              {JSON.stringify(schema, null, 0)}
            </script>
          )
      }
    </Helmet>
  );
}
