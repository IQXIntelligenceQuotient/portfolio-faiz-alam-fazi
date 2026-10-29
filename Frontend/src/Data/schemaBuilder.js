import { siteMeta } from "./siteMeta";

export function buildServiceSchemas(content, schemaConfig, faqs = []) {
  const pageUrl = `${siteMeta.siteUrl}${schemaConfig.slug}`;
  const image = schemaConfig.image || content?.left_img || siteMeta.defaultImage;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LegalService", "LocalBusiness"],
    "@id": `${siteMeta.siteUrl}/#organization`,
    name: "Legal Bridge LLP®",
    url: "https://legalbridge.pk/",
    logo: siteMeta.logo,
    image: siteMeta.logo,
    description:
      "Corporate, technology, IP and cyber law practice support for Lahore, Punjab, Pakistan-wide and cross-border business clients through Legal Bridge LLP®.",
    telephone: siteMeta.telephone,
    email: siteMeta.email,
    address: {
      "@type": "PostalAddress",
      ...siteMeta.address
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: siteMeta.telephone,
      contactType: "client intake and consultation routing",
      areaServed: "PK",
      availableLanguage: ["English", "Urdu"]
    },
    sameAs: siteMeta.sameAs
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": schemaConfig.pageType || "LegalService",
    name: schemaConfig.name || content?.h1,
    headline: content?.Hero_H1 || schemaConfig.title || content?.h1,
    description: schemaConfig.description || content?.Hero_p,
    serviceType: schemaConfig.serviceType || content?.h1,
    url: pageUrl,
    image,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": pageUrl
    },
    provider: {
      "@id": `${siteMeta.siteUrl}/#organization`
    },
    employee: {
      "@type": "Person",
      name: "Faiz Alam Faizi",
      jobTitle: schemaConfig.personTitle || "Corporate & CyberCrime Lawyer",
      description: siteMeta.leadershipProfile,
      worksFor: {
        "@id": `${siteMeta.siteUrl}/#organization`
      }
    },
    areaServed: (schemaConfig.areaServed || siteMeta.areaServed).map((place) => ({
      "@type": "Place",
      name: place
    })),
    audience: {
      "@type": "Audience",
      audienceType: schemaConfig.audience || "Individuals, startups, businesses, organizations"
    },
    offers: {
      "@type": "Offer",
      url: content?.cta_link || siteMeta.whatsappUrl,
      availability: "https://schema.org/InStock",
      description: siteMeta.professionalDisclaimer
    },
    potentialAction: {
      "@type": "CommunicateAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: content?.cta_link || siteMeta.whatsappUrl
      }
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteMeta.siteUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Services",
        item: `${siteMeta.siteUrl}/services`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: schemaConfig.title || content?.h1,
        item: pageUrl
      }
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: content?.Hero_H1 || schemaConfig.title || content?.h1,
    url: pageUrl,
    description: schemaConfig.description || content?.Hero_p,
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: image
    },
    keywords: [
      ...(schemaConfig.keywords || []),
      ...(content?.service_tags || [])
    ].join(", ")
  };

  const faqSchema =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer
            }
          }))
        }
      : null;

  return [organizationSchema, serviceSchema, breadcrumbSchema, webPageSchema, faqSchema].filter(Boolean);
}
