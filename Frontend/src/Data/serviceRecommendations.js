export const serviceRecommendationTags = [
  "corporate-law",
  "technology-law",
  "ip-law",
  "cyber-law",
  "software-house-legal-support",
  "bpo-legal-support",
  "call-center-legal-support",
  "startup-legal-support",
  "foreign-client-pakistan-disputes",
  "contracts-and-documentation",
  "employment-documentation",
  "legal-notices",
  "dispute-prevention",
];

export const serviceRecommendations = {
  "software-houses": {
    label: "Software Houses",
    description:
      "For software houses in Lahore and Pakistan working on client projects, IP ownership, source code access, vendor obligations, and dispute-prevention documentation.",
    tags: [
      "technology-law",
      "ip-law",
      "software-house-legal-support",
      "contracts-and-documentation",
      "dispute-prevention",
    ],
    services: [
      { title: "Software Development Agreements", url: "/DocumentDrafting" },
      { title: "NDA and IP Assignment Agreements", url: "/intellectual_property" },
      { title: "Source Code Ownership Documentation", url: "/DocumentDrafting" },
      { title: "Corporate Advisory", url: "/Legal_Consultant" },
      { title: "Legal Notices and Dispute Prevention", url: "/Representation" },
    ],
  },
  "technology-companies": {
    label: "Technology Companies and SaaS Teams",
    description:
      "For technology companies, SaaS businesses, IT centers, digital agencies, and e-commerce ventures that need contracts, compliance, IP protection, employment documentation, and cyber law support.",
    tags: [
      "corporate-law",
      "technology-law",
      "ip-law",
      "cyber-law",
      "startup-legal-support",
      "employment-documentation",
    ],
    services: [
      { title: "Company Registration", url: "/company_formation" },
      { title: "Technology Contracts", url: "/DocumentDrafting" },
      { title: "Trademark and Copyright Support", url: "/intellectual_property" },
      { title: "Employment and Confidentiality Documents", url: "/DocumentDrafting" },
      { title: "Cyber Law Advisory Coordination", url: "/Legal_Consultant" },
    ],
  },
  "bpo-call-centers": {
    label: "BPO Offices and Call Centers",
    description:
      "For BPO offices, call centers, and outsourcing teams in Lahore, Punjab, and Pakistan managing client data, employment paperwork, confidentiality duties, vendor contracts, and operational compliance.",
    tags: [
      "bpo-legal-support",
      "call-center-legal-support",
      "contracts-and-documentation",
      "employment-documentation",
      "dispute-prevention",
    ],
    services: [
      { title: "BPO and Call Center Compliance Documentation", url: "/Legal_Consultant" },
      { title: "Employment Contracts", url: "/DocumentDrafting" },
      { title: "Confidentiality Agreements", url: "/DocumentDrafting" },
      { title: "Vendor Agreements", url: "/Business_Consultant" },
      { title: "Tax and Business Registration Coordination", url: "/vat_and_tax" },
    ],
  },
  "foreign-clients": {
    label: "Foreign Clients Working with Pakistani Vendors",
    description:
      "For international businesses engaging Pakistani software houses, BPO offices, call centers, outsourcing teams, vendors, and IT companies.",
    tags: [
      "foreign-client-pakistan-disputes",
      "technology-law",
      "ip-law",
      "cyber-law",
      "contracts-and-documentation",
      "legal-notices",
    ],
    services: [
      { title: "Software Development Dispute Review", url: "/ExtensiveResearch" },
      { title: "Source Code and IP Ownership Review", url: "/intellectual_property" },
      { title: "NDA Enforcement and Legal Notices", url: "/Representation" },
      { title: "Vendor Agreement Review", url: "/DocumentDrafting" },
      { title: "Cross-Border Corporate Advisory", url: "/Legal_Consultant" },
    ],
  },
  startups: {
    label: "Startups and Founders",
    description:
      "For Lahore startups and Pakistan-wide founders building legally structured companies, founder documents, contracts, compliance workflows, and digital risk controls.",
    tags: [
      "startup-legal-support",
      "corporate-law",
      "technology-law",
      "ip-law",
      "contracts-and-documentation",
    ],
    services: [
      { title: "Company Formation", url: "/company_formation" },
      { title: "Founder and Shareholder Documents", url: "/DocumentDrafting" },
      { title: "IP Assignment Agreements", url: "/intellectual_property" },
      { title: "Contract Review", url: "/DocumentDrafting" },
      { title: "Corporate Compliance Advisory", url: "/Legal_Consultant" },
    ],
  },
};

export function getRecommendationsForCategories(categories = []) {
  const selected = categories
    .map((category) => serviceRecommendations[category])
    .filter(Boolean);

  const services = selected.flatMap((category) =>
    category.services.map((service) => ({
      ...service,
      category: category.label,
      description: category.description,
    }))
  );

  return {
    categories: selected,
    services: services.filter(
      (service, index, arr) =>
        arr.findIndex((item) => item.title === service.title && item.url === service.url) ===
        index
    ),
  };
}
