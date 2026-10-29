import React from "react";
import { Link } from "react-router-dom";
import SEOHead from "../components/seo/SEOHead.jsx";
import { getRecommendationsForCategories } from "../Data/serviceRecommendations.js";

const PAGE_URL = "/technology-ip-cyber-law-pakistan";
const PAGE_TITLE =
  "Corporate, Technology, IP & Cyber Law Practice Lahore | Legal Bridge LLP®";
const PAGE_DESCRIPTION =
  "Legal Bridge LLP® supports software houses, SaaS teams, BPO offices, call centers, IT companies, startups, e-commerce ventures, digital agencies, and foreign clients with corporate, technology, IP, cyber law, contracts, compliance, and documentation workflows in Lahore and Pakistan.";
const PROFESSIONAL_DISCLAIMER =
  "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

const targetClients = [
  "Software houses in Lahore and Pakistan",
  "Technology companies, SaaS businesses, and IT centers",
  "BPO offices, call centers, and outsourcing teams",
  "Digital agencies and e-commerce ventures",
  "Startup founders and employer teams managing technical staff",
  "Foreign clients working with Pakistani vendors and software teams",
];

const supportAreas = [
  "Company registration and corporate advisory",
  "NDA drafting, confidentiality agreements, and employment documentation",
  "Software development agreements, vendor agreements, and technical annexes",
  "IP assignment, source code ownership, copyright, trademark, and brand documentation",
  "Data-related legal documentation and cyber law advisory coordination",
  "Legal notices, contract review, dispute-prevention documentation, and vendor dispute support",
];

const locationSignals = [
  {
    title: "Lahore Technology Businesses",
    text:
      "Legal Bridge LLP® supports Lahore-based software houses, IT companies, BPO offices, call centers, startups, and digital agencies with corporate advisory, contracts, IP documentation, cyber law support, and employment paperwork.",
  },
  {
    title: "Punjab and Pakistan-Wide Clients",
    text:
      "The practice is structured for Punjab and Pakistan-wide corporate and technology clients that need registration, contract review, compliance coordination, IP protection, legal notices, and dispute-prevention workflows.",
  },
  {
    title: "Foreign Clients Working with Pakistani Vendors",
    text:
      "International businesses working with Pakistani software houses, outsourcing companies, BPO offices, vendors, and IT companies can request structured review of software development disputes, source code ownership, NDA enforcement issues, vendor agreements, and contract documentation.",
  },
];

const faqs = [
  {
    question: "Who can help a software house in Lahore with legal documentation?",
    answer:
      "Legal Bridge LLP® coordinates legal documentation support for Lahore software houses, including software development agreements, NDAs, IP assignment terms, employment documents, vendor contracts, technical annexes, and dispute-prevention workflows. Client routing remains subject to availability, conflict checks, document review, forum requirements, and written engagement scope.",
  },
  {
    question: "How can a tech company in Pakistan protect its source code and IP rights?",
    answer:
      "A technology company can use clear software development agreements, IP assignment clauses, copyright records, repository access controls, employee and contractor confidentiality terms, and technical annexes that define deliverables, source code access, ownership, licensing, and handover obligations.",
  },
  {
    question: "What legal documents does a BPO office in Pakistan need?",
    answer:
      "A BPO office may need company registration documents, vendor agreements, service-level terms, employment contracts, confidentiality agreements, data-related documentation, HR policies, tax and business registration records, and client-specific operational compliance paperwork.",
  },
  {
    question: "Can a foreign client take legal action against a Pakistani software vendor?",
    answer:
      "A foreign client may have legal options depending on the contract, governing law, jurisdiction clause, payment record, deliverables, communications, source code access, IP ownership language, and available evidence. Any action should begin with document review and written engagement scope.",
  },
  {
    question: "How can call centers in Lahore structure employment and confidentiality documents?",
    answer:
      "Call centers in Lahore can structure employment contracts, confidentiality agreements, data-handling obligations, attendance and performance terms, client-information safeguards, termination clauses, equipment policies, and compliance acknowledgments according to their operational model.",
  },
  {
    question: "What is the role of NDA, IP assignment, and technical annex in software development?",
    answer:
      "An NDA protects confidential information, an IP assignment clarifies ownership of software and related rights, and a technical annex defines project scope, deliverables, milestones, integrations, acceptance criteria, source code access, handover, maintenance, and change-control terms.",
  },
  {
    question: "How can Legal Bridge LLP® assist technology companies in Pakistan?",
    answer:
      "Legal Bridge LLP® can coordinate corporate advisory, company registration, technology contracts, NDA and IP documents, employment paperwork, data-related legal documentation, cyber law support, legal notices, and dispute-prevention workflows for technology companies in Pakistan.",
  },
  {
    question: "What legal support is available for software development disputes in Pakistan?",
    answer:
      "Support may include contract review, evidence organization, source code ownership review, vendor communications, legal notices, negotiation strategy, IP documentation assessment, payment record review, and forum-specific advisory coordination under written engagement scope.",
  },
  {
    question: "How can startups in Lahore manage corporate and cyber law compliance?",
    answer:
      "Startups in Lahore can manage risk through company registration, founder documentation, contracts, privacy and data-related paperwork, employment documents, IP assignment terms, vendor agreements, tax registration coordination, cyber law awareness, and periodic legal document review.",
  },
];

const recommendationData = getRecommendationsForCategories([
  "software-houses",
  "technology-companies",
  "bpo-call-centers",
  "foreign-clients",
  "startups",
]);

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LegalService", "LocalBusiness"],
      "@id": "https://faizalamfaizi.com/#organization",
      name: "Legal Bridge LLP®",
      url: "https://legalbridge.pk/",
      image: "https://faizalamfaizi.com/Business_Consultant_in_Lahore_Pakistan.svg",
      description: PAGE_DESCRIPTION,
      telephone: "+92-321-4277856",
      email: "info@faizalamfaizi.com",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Garden Town",
        addressLocality: "Lahore",
        addressRegion: "Punjab",
        addressCountry: "PK",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+92-321-4277856",
        contactType: "client intake and consultation routing",
        areaServed: "PK",
        availableLanguage: ["English", "Urdu"],
      },
      sameAs: [
        "https://www.facebook.com/FaizAlamFaizi/",
        "https://www.instagram.com/legalbridgellp/",
        "https://www.linkedin.com/in/faiz-alam-faizi-950a1b270/",
      ],
    },
    {
      "@type": "Person",
      "@id": "https://faizalamfaizi.com/#person",
      name: "Faiz Alam Faizi",
      jobTitle: "Corporate, Technology, IP & Cyber Law Practice",
      description:
        "Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.",
      worksFor: {
        "@id": "https://faizalamfaizi.com/#organization",
      },
    },
    {
      "@type": "WebPage",
      "@id": `https://faizalamfaizi.com${PAGE_URL}#webpage`,
      url: `https://faizalamfaizi.com${PAGE_URL}`,
      name: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      inLanguage: "en-PK",
      about: {
        "@id": "https://faizalamfaizi.com/#organization",
      },
    },
    {
      "@type": "Service",
      "@id": `https://faizalamfaizi.com${PAGE_URL}#service`,
      name: "Corporate, Technology, IP and Cyber Law Practice",
      serviceType: "Corporate, Technology, IP and Cyber Law Practice",
      provider: {
        "@id": "https://faizalamfaizi.com/#organization",
      },
      areaServed: [
        { "@type": "Place", name: "Lahore, Punjab, Pakistan" },
        { "@type": "Place", name: "Pakistan" },
        { "@type": "Place", name: "International businesses working with Pakistani vendors" },
      ],
      description: PAGE_DESCRIPTION,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://faizalamfaizi.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Corporate, Technology, IP & Cyber Law Practice",
          item: `https://faizalamfaizi.com${PAGE_URL}`,
        },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
};

function TechnologyPractice() {
  return (
    <div className="bg-[#101010] text-white">
      <SEOHead
        title={PAGE_TITLE}
        description={PAGE_DESCRIPTION}
        keywords="Corporate lawyer Lahore, Technology lawyer Pakistan, Cyber law lawyer Lahore, Cybercrime lawyer Pakistan, IP lawyer Lahore, Software house legal advisor Pakistan, Legal services for software houses Lahore, Legal services for BPO companies Pakistan, Call center legal documentation Lahore, IT company legal advisor Pakistan, NDA and IP agreement lawyer Pakistan, Software development contract lawyer Pakistan, Source code ownership dispute Pakistan, Technology contract lawyer Lahore, Corporate legal advisory Lahore, Legal Bridge LLP technology law practice, Pakistan law firm for technology companies, Legal services for startups Lahore, BPO contract dispute lawyer Pakistan, IP protection for software companies Pakistan, Cyber law and corporate legal services Pakistan"
        canonical={PAGE_URL}
        ogImage="/1-Best-Legal_Consultant-near-me.webp"
        schema={schema}
      />

      <section className="border-b border-white/10 pt-28">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/60">
              <li>
                <Link to="/" className="transition hover:text-orange-400">
                  Home
                </Link>
              </li>
              <li className="text-white/30">/</li>
              <li className="text-white/90">Corporate, Technology, IP & Cyber Law Practice</li>
            </ol>
          </nav>
        </div>
      </section>

      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_34%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400">
              Lahore, Punjab and Pakistan-wide technology clients
            </p>
            <h1 className="mt-5 max-w-5xl text-4xl font-black leading-tight md:text-6xl">
              Corporate, Technology, IP & Cyber Law Practice
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 md:text-lg">
              Legal Bridge LLP® supports businesses, founders, software houses, technology companies, SaaS
              businesses, call centers, IT centers, BPO offices, outsourcing companies, e-commerce ventures,
              digital agencies, and startup teams with legally structured documentation, advisory coordination,
              contracts, compliance, IP protection, cyber law support, and dispute-prevention workflows.
            </p>
            <p className="mt-6 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm leading-7 text-white/70">
              {PROFESSIONAL_DISCLAIMER}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Contact Legal Bridge LLP®
              </Link>
              <Link
                to="/DocumentDrafting"
                className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white transition hover:border-orange-400 hover:text-orange-300"
              >
                Review Documentation Services
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-3 shadow-2xl">
            <img
              src="/hero_video_bg_1.jpg"
              alt="Legal Bridge LLP technology, IP and cyber law practice for Lahore software houses and Pakistan technology companies"
              className="h-[360px] w-full rounded-[22px] object-cover md:h-[460px]"
              width="720"
              height="460"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
              Client Focus
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Legal support for technology businesses and cross-border vendor relationships
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {targetClients.map((client) => (
              <div key={client} className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                <p className="font-semibold text-slate-900">{client}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">
              Support Areas
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Documentation, advisory, compliance, IP, and dispute-prevention workflows
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              The practice is designed for business operations where contract clarity, IP ownership, technical
              scope, employee confidentiality, vendor accountability, and cyber law awareness matter.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {supportAreas.map((area) => (
              <div key={area} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <p className="leading-7 text-white/80">{area}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
              GEO Focus
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Lahore, Punjab, Pakistan-wide and international client visibility
            </h2>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {locationSignals.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 p-7">
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-400">
              Recommended Service Pathways
            </p>
            <h2 className="mt-4 text-3xl font-bold md:text-5xl">
              Internal service links for technology and business clients
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {recommendationData.services.slice(0, 12).map((service) => (
              <Link
                key={`${service.category}-${service.title}`}
                to={service.url}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-orange-400/60 hover:bg-white/[0.06]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                  {service.category}
                </p>
                <h3 className="mt-3 text-xl font-bold transition group-hover:text-orange-300">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-white/70">{service.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-4 py-20 text-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
            AEO Questions
          </p>
          <h2 className="mt-4 text-center text-3xl font-bold md:text-5xl">
            Questions technology clients often ask
          </h2>

          <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-6">
                <summary className="cursor-pointer list-none text-lg font-semibold text-slate-950">
                  {faq.question}
                </summary>
                <p className="mt-4 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default TechnologyPractice;
