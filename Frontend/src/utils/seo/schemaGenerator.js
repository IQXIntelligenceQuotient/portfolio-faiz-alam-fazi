/**
 * Schema Generator for Pakistan SEO + AEO Optimization
 * Generates JSON-LD structured data for all page types
 */

const siteUrl = 'https://faizalamfaizi.com';
const businessName = 'Legal Bridge LLP®';
const personName = 'Faiz Alam Faizi';
const leadershipProfile =
  'Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.';
const logoUrl = `${siteUrl}/Business_Consultant_in_Lahore_Pakistan.svg`;

// Pakistan cities coverage
export const pakistanCities = {
  punjab: [
    'Lahore, Punjab',
    'Faisalabad, Punjab',
    'Rawalpindi, Punjab',
    'Multan, Punjab',
    'Gujranwala, Punjab',
    'Sialkot, Punjab',
    'Bahawalpur, Punjab',
    'Sargodha, Punjab',
    'Sheikhupura, Punjab',
    'Rahim Yar Khan, Punjab',
    'Jhelum, Punjab',
    'Gujrat, Punjab',
    'Okara, Punjab',
  ],
  sindh: [
    'Karachi, Sindh',
    'Hyderabad, Sindh',
    'Sukkur, Sindh',
    'Larkana, Sindh',
    'Nawabshah, Sindh',
    'Mirpur Khas, Sindh',
    'Jacobabad, Sindh',
  ],
  kpk: [
    'Peshawar, Khyber Pakhtunkhwa',
    'Abbottabad, Khyber Pakhtunkhwa',
    'Mardan, Khyber Pakhtunkhwa',
    'Swat, Khyber Pakhtunkhwa',
    'Kohat, Khyber Pakhtunkhwa',
    'Bannu, Khyber Pakhtunkhwa',
    'Dera Ismail Khan, Khyber Pakhtunkhwa',
  ],
  balochistan: [
    'Quetta, Balochistan',
    'Gwadar, Balochistan',
    'Turbat, Balochistan',
    'Khuzdar, Balochistan',
  ],
  islamabad: ['Islamabad Capital Territory'],
};

// Flatten all cities
export const allPakistanCities = [
  ...pakistanCities.punjab,
  ...pakistanCities.sindh,
  ...pakistanCities.kpk,
  ...pakistanCities.balochistan,
  ...pakistanCities.islamabad,
];

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LegalService', 'LocalBusiness'],
    '@id': `${siteUrl}/#organization`,
    name: businessName,
    url: siteUrl,
    logo: logoUrl,
    image: logoUrl,
    description:
      'Corporate, technology, IP and cyber law practice support for software houses, SaaS businesses, BPO offices, call centers, IT companies, startups, e-commerce ventures, digital agencies, and foreign clients working with Pakistani vendors.',
    telephone: '+92-321-4277856',
    email: 'info@faizalamfaizi.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Garden Town',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      postalCode: '54000',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '31.5204',
      longitude: '74.3587',
    },
    areaServed: allPakistanCities.map((city) => ({
      '@type': 'City',
      name: city,
    })),
    priceRange: '$$',
    openingHours: 'Mo-Sa 09:00-18:00',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+92-321-4277856',
      contactType: 'client intake and consultation routing',
      areaServed: 'PK',
      availableLanguage: ['English', 'Urdu'],
    },
    sameAs: [
      'https://www.facebook.com/FaizAlamFaizi/',
      'https://www.instagram.com/legalbridgellp/',
      'https://www.linkedin.com/in/faiz-alam-faizi-950a1b270/',
    ],
  };
}

/**
 * Generate WebSite Schema
 */
export function generateWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: businessName,
    description:
      'Corporate, technology, IP and cyber law practice support through Legal Bridge LLP® for Lahore, Punjab, Pakistan-wide and cross-border technology clients',
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
    inLanguage: 'en-PK',
  };
}

/**
 * Generate WebPage Schema
 */
export function generateWebPageSchema(pageData) {
  const { title, description, url, breadcrumbs } = pageData;

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}${url}#webpage`,
    url: `${siteUrl}${url}`,
    name: title,
    description: description,
    isPartOf: {
      '@id': `${siteUrl}/#website`,
    },
    about: {
      '@id': `${siteUrl}/#organization`,
    },
    inLanguage: 'en-PK',
    ...(breadcrumbs && {
      breadcrumb: {
        '@id': `${siteUrl}${url}#breadcrumb`,
      },
    }),
  };
}

/**
 * Generate Service Schema
 */
export function generateServiceSchema(serviceData) {
  const { name, description, url } = serviceData;

  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}${url}#service`,
    name: name,
    description: description,
    provider: {
      '@id': `${siteUrl}/#organization`,
    },
    areaServed: allPakistanCities.map((city) => ({
      '@type': 'City',
      name: city,
    })),
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${siteUrl}${url}`,
      servicePhone: '+92-321-4277856',
    },
  };
}

/**
 * Generate LocalBusiness Schema
 */
export function generateLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteUrl}/#localbusiness`,
    name: businessName,
    image: logoUrl,
    url: siteUrl,
    telephone: '+92-321-4277856',
    email: 'info@faizalamfaizi.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Garden Town',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      postalCode: '54000',
      addressCountry: 'PK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '31.5204',
      longitude: '74.3587',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
    priceRange: '$$',
    areaServed: allPakistanCities.map((city) => ({
      '@type': 'City',
      name: city,
    })),
  };
}

/**
 * Generate Breadcrumb Schema
 */
export function generateBreadcrumbSchema(breadcrumbs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.url}`,
    })),
  };
}

/**
 * Generate FAQ Schema
 */
export function generateFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate Person Schema (for About page)
 */
export function generatePersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: personName,
    url: siteUrl,
    image: `${siteUrl}/favicon.png`,
    jobTitle: 'Corporate, Technology, IP & Cyber Law Practice',
    description: leadershipProfile,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Lahore',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
    sameAs: [
      'https://www.facebook.com/FaizAlamFaizi/',
      'https://www.instagram.com/legalbridgellp/',
      'https://www.linkedin.com/in/faiz-alam-faizi-950a1b270/',
    ],
    worksFor: {
      '@id': `${siteUrl}/#organization`,
    },
  };
}

/**
 * Generate ContactPage Schema
 */
export function generateContactPageSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${siteUrl}/contact#contactpage`,
    url: `${siteUrl}/contact`,
    name: 'Contact Legal Bridge LLP®',
    description: 'Contact Legal Bridge LLP® for corporate advisory, technology law, IP documentation, cyber law support, documentation workflow, and coordinated client-service support',
    mainEntity: {
      '@id': `${siteUrl}/#organization`,
    },
  };
}

/**
 * Generate complete schema graph for a page
 */
export function generateCompleteSchema(pageType, pageData = {}) {
  const schemas = {
    '@context': 'https://schema.org',
    '@graph': [
      generateOrganizationSchema(),
      generateWebSiteSchema(),
      generateWebPageSchema(pageData),
    ],
  };

  // Add page-specific schemas
  switch (pageType) {
    case 'home':
      schemas['@graph'].push(generateLocalBusinessSchema());
      break;

    case 'about':
      schemas['@graph'].push(generatePersonSchema());
      break;

    case 'service':
      if (pageData.service) {
        schemas['@graph'].push(generateServiceSchema(pageData.service));
      }
      break;

    case 'contact':
      schemas['@graph'].push(generateContactPageSchema());
      break;

    default:
      break;
  }

  // Add breadcrumbs if provided
  if (pageData.breadcrumbs) {
    schemas['@graph'].push(generateBreadcrumbSchema(pageData.breadcrumbs));
  }

  // Add FAQs if provided
  if (pageData.faqs) {
    const faqSchema = generateFAQSchema(pageData.faqs);
    if (faqSchema) {
      schemas['@graph'].push(faqSchema);
    }
  }

  return schemas;
}
