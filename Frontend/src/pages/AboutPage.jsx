import React, { useState, useEffect, useRef } from "react";
import { motion, useInView, animate, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import SEOHead from "../components/seo/SEOHead.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Search,
  Lightbulb,
  Cog,
  ChevronDown,
  ShieldCheck,
  Globe,
  FileText,
  Scale,
  BadgeCheck,
  BriefcaseBusiness,
  Landmark,
  Shield,
} from "lucide-react";

const SITE_URL = "https://faizalamfaizi.com";
const PAGE_URL = `${SITE_URL}/about`;
const OG_IMAGE = `${SITE_URL}/1-Best-Legal_Consultant-near-me.webp`;
const PROFESSIONAL_DISCLAIMER =
  "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.65, ease: "easeOut" },
  }),
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const stats = [
  { label: "Clients Advised", value: 22, suffix: "k" },
  { label: "Projects Completed", value: 15, suffix: "k" },
  { label: "Professional Team Members", value: 121, suffix: "" },
  { label: "Awards and Recognitions", value: 15, suffix: "" },
];

const processSteps = [
  {
    title: "Initial Consultation",
    desc: "We study your legal issue, business model, jurisdiction, urgency, and exposure before recommending any course of action.",
    icon: Search,
  },
  {
    title: "Legal Risk Assessment",
    desc: "Hidden liabilities, documentation gaps, digital threats, and compliance issues are identified early so you are not blindsided later.",
    icon: Lightbulb,
  },
  {
    title: "Strategy Development",
    desc: "A practical legal roadmap is built around protection, compliance, recovery, dispute handling, or cross-border business growth.",
    icon: Cog,
  },
];

const team = [
  {
    name: "Faiz Alam Faizi",
    role: "Corporate, Technology, IP & Cyber Law Practice",
    image: "/favicon.png",
  },
  {
    name: "Corporate Advisory Team",
    role: "Business Structuring & Compliance Experts",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Litigation Support Team",
    role: "Research, Drafting & Case Strategy",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Compliance Desk",
    role: "Corporate, Tax & Documentation Support",
    image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
  },
  {
    name: "Digital Strategy Team",
    role: "Online Presence & Brand Systems",
    image:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop",
  },
];

const brands = [
  "Legal Bridge LLP®",
  "Elder Care Pakistan",
  "Click2Print Pvt. Ltd.",
  "H9CRM",
];

const faqs = [
  {
    question: "Do you provide international legal services?",
    answer:
      "Yes. Legal Bridge LLP® coordinates cross-border contracts, business structuring, compliance strategy, digital risk, and international legal support through documented client-service systems.",
  },
  {
    question: "Can you help recover money from online fraud?",
    answer:
      "Yes. Legal Bridge LLP® coordinates online fraud strategy, digital asset recovery support, cyber crime complaints, evidence positioning, and related legal action through documented client-service systems.",
  },
  {
    question: "Do startups need a lawyer from the beginning?",
    answer:
      "Often, yes. Early legal structuring can clarify ownership, strengthen contracts, reduce avoidable disputes, and support long-term growth.",
  },
  {
    question: "What industries do you specialize in?",
    answer:
      "The profile is especially relevant to technology, SaaS, fintech, digital businesses, startups, corporate clients, and cyber-related legal matters.",
  },
  {
    question: "Do you work with clients outside Pakistan?",
    answer:
      "Yes. Client-service coordination may support Pakistan, UAE, UK, USA, Europe, and remote global business environments for contracts, compliance, structuring, and digital risk matters, subject to written engagement scope.",
  },
  {
    question: "What legal services are most commonly requested?",
    answer:
      "Frequently requested services include cyber crime support, startup structuring, contract drafting, cross-border compliance, legal strategy, and risk protection for modern businesses.",
  },
  {
    question: "How do you approach legal and business matters?",
    answer:
      "Matters are coordinated through consultation routing, risk assessment, strategy development, document review, and practical execution within the agreed written engagement scope.",
  },
  {
    question: "How are consultations allocated?",
    answer:
      "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.",
  },
];

const expertiseCards = [
  {
    icon: Shield,
    title: "Cyber Crime & Digital Risk",
    text: "Support for online fraud, digital asset disputes, cyber complaints, and legal risk around online harm.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Startup & Business Structuring",
    text: "Founder agreements, legal setup, compliance systems, and early-stage legal architecture built for growth.",
  },
  {
    icon: FileText,
    title: "Contracts & Legal Documentation",
    text: "Commercial contracts, SaaS terms, business agreements, reviews, negotiation support, and risk reduction.",
  },
  {
    icon: Globe,
    title: "Cross-Border Legal Advisory",
    text: "Practical legal guidance for businesses, founders, and clients operating across multiple jurisdictions.",
  },
];

const jurisdictions = [
  "Lahore",
  "Karachi",
  "Islamabad",
  "Pakistan",
  "UAE",
  "UK",
  "USA",
  "Europe",
];

function CountUpNumber({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: "easeOut",
      onUpdate: (latest) => setCount(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

function ProgressBar({ title, value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.45 });

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <span className="text-sm font-semibold text-slate-600">{value}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${value}%` } : { width: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-amber-500"
        />
      </div>
    </div>
  );
}

function FAQItem({ item, index, isOpen, onClick }) {
  const buttonId = `faq-button-${index}`;
  const panelId = `faq-panel-${index}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h3>
        <button
          id={buttonId}
          onClick={onClick}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
          aria-expanded={isOpen}
          aria-controls={panelId}
          type="button"
        >
          <span className="text-base font-semibold text-slate-900 md:text-lg">
            {item.question}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-amber-600 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
              }`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="px-5 pb-5 text-sm leading-7 text-slate-600 md:text-base">
          {item.answer}
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const reduceMotion = useReducedMotion();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: PAGE_URL,
      },
    ],
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Faiz Alam Faizi",
    url: PAGE_URL,
    image: OG_IMAGE,
    jobTitle: "Corporate, Technology, IP & Cyber Law Practice",
    description:
      "Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.",
    knowsAbout: [
      "Corporate Law",
      "Cyber Law",
      "Tech Law",
      "Startup Law",
      "Cross-Border Compliance",
      "Digital Asset Recovery",
      "Contract Drafting",
      "SaaS Legal Structuring",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Legal Bridge LLP®",
      url: "https://legalbridge.pk",
    },
    sameAs: [
      "https://legalbridge.pk",
      "https://www.facebook.com/legalbridgellp",
      "https://www.instagram.com/legalbridgellp",
    ],
    areaServed: [
      "Pakistan",
      "Lahore",
      "Karachi",
      "Islamabad",
      "UAE",
      "UK",
      "USA",
      "Europe",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LegalService", "LocalBusiness"],
    name: "Legal Bridge LLP®",
    url: "https://legalbridge.pk",
    logo: "https://legalbridge.pk/logo.png",
    description:
      "Corporate, technology, IP and cyber law practice support for Lahore, Punjab, Pakistan-wide and cross-border business clients through Legal Bridge LLP®.",
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
      "https://www.facebook.com/legalbridgellp",
      "https://www.instagram.com/legalbridgellp",
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <SEOHead
        title="About Faiz Alam Faizi | Corporate, Technology, IP & Cyber Law Practice"
        description="Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination."
        keywords="Faiz Alam Faizi, Corporate Technology IP Cyber Law Practice, corporate lawyer Lahore, technology lawyer Pakistan, IP lawyer Lahore, cyber law lawyer Lahore, startup lawyer Lahore, SaaS legal structuring, software house legal advisor Pakistan, Legal Bridge LLP technology law practice"
        canonical={PAGE_URL}
        ogImage={OG_IMAGE}
      />

      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <main className="min-h-screen bg-white text-slate-900">
        <section className="relative overflow-hidden bg-[#161616] px-4 py-24 text-white md:px-6 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-[#161616] to-[#161616]" />
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[#FD6219]/10 blur-3xl" />
          <div className="absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-[#FD6219]/5 blur-3xl" />

          <div className="relative mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mx-auto max-w-5xl text-center"
            >
              <p className="mb-5 inline-block text-xs font-bold uppercase tracking-[0.35em] text-[#FD6219] md:text-sm">
                About Faiz Alam Faizi
              </p>

              <h1 className="mx-auto max-w-5xl text-4xl font-black leading-[1.08] tracking-tight text-white md:text-7xl">
                Corporate, Technology, IP & Cyber Law Practice for Startups, Businesses and Cross-Border Matters
              </h1>

              <p className="mx-auto mt-8 max-w-3xl text-base font-light leading-relaxed text-slate-300 md:text-xl">
                Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.
              </p>

              <div className="mx-auto mt-8 max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-5 text-left shadow-2xl backdrop-blur-sm">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-400">
                  Quick Answer
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-200 md:text-base">
                  Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.
                </p>
                <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs leading-6 text-slate-400 md:text-sm">
                  {PROFESSIONAL_DISCLAIMER}
                </p>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#FD6219] px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-500"
                >
                  Book Consultation
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/Legal_Consultant"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Explore Services
                  <Scale className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="border-b border-slate-100 bg-white px-4 py-6 md:px-6">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 text-center">
            {jurisdictions.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="px-4 py-20 md:px-6">
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="mx-auto max-w-5xl text-center"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
              About
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-slate-900 md:text-5xl">
              Legal Strategy, Business Insight, and Digital Risk Protection
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              This page explains the Legal Bridge LLP® leadership profile, corporate advisory focus, cybercrime law orientation, documentation workflow, and coordinated client-service systems behind the work.
            </p>
          </motion.div>
        </section>

        <section className="px-4 pb-20 md:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="overflow-hidden rounded-[2rem] shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1400&auto=format&fit=crop"
                alt="Faiz Alam Faizi discussing corporate law, cyber law, and cross-border legal strategy"
                className="h-full min-h-[420px] w-full object-cover"
                loading="eager"
                fetchPriority="high"
                width="700"
                height="420"
              />
            </motion.div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <h2 className="text-2xl font-bold text-slate-900 md:text-4xl">
                Who is Faiz Alam Faizi?
              </h2>

              <p className="mt-6 text-gray-600 leading-relaxed">
                Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with
                Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice,
                Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm
                strategy, client-service standards, corporate advisory systems, legal documentation workflow,
                technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and
                coordination across practice teams.
              </p>

              <p className="mt-6 text-gray-600 leading-relaxed">
                The profile sits at the intersection of{" "}
                <span className="font-semibold text-slate-900">law</span>,{" "}
                <span className="font-semibold text-slate-900">business</span>, and{" "}
                <span className="font-semibold text-slate-900">digital transformation</span>. Legal Bridge LLP® coordinates{" "}
                <span className="font-semibold text-slate-900">cyber crime matters</span>,{" "}
                <span className="font-semibold text-slate-900">digital asset recovery</span>,{" "}
                <span className="font-semibold text-slate-900">startup legal systems</span>,{" "}
                <span className="font-semibold text-slate-900">contract engineering</span>, and{" "}
                <span className="font-semibold text-slate-900">cross-border compliance</span> through documented
                client-service and legal documentation workflows.
              </p>

              <p className="mt-6 text-gray-600 leading-relaxed">
                Client-service coordination is available for matters connected with{" "}
                <span className="font-semibold text-slate-900">Pakistan</span>, including{" "}
                <span className="font-semibold text-slate-900">Lahore</span>,{" "}
                <span className="font-semibold text-slate-900">Karachi</span>, and{" "}
                <span className="font-semibold text-slate-900">Islamabad</span>, and may support businesses and
                individuals connected with the{" "}
                <span className="font-semibold text-slate-900">UAE</span>,{" "}
                <span className="font-semibold text-slate-900">UK</span>,{" "}
                <span className="font-semibold text-slate-900">USA</span>, and{" "}
                <span className="font-semibold text-slate-900">Europe</span>, subject to conflict checks,
                document review, forum requirements, and written engagement scope.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/Legal_Consultant"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-600"
                >
                  See Our Services
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                >
                  Contact Now
                  <Landmark className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-20 md:px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                Core Expertise
              </p>
              <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                What legal work is this page built around?
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                The page is intentionally focused on modern legal demand, where business growth, contracts, compliance,
                digital assets, and cyber risk now overlap.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {expertiseCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={card.title}
                    custom={index}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="mt-5 text-xl font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-20 border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4 md:gap-0">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.08 }}
                  className="group relative rounded-2xl py-8 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
                >
                  {idx !== stats.length - 1 && (
                    <div className="absolute right-0 top-1/2 hidden h-16 w-px -translate-y-1/2 bg-gray-100 transition-colors group-hover:bg-orange-200 md:block">
                      <div className="absolute top-0 -left-[2px] h-1 w-1 rounded-full bg-gray-300 group-hover:bg-orange-400" />
                    </div>
                  )}

                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 flex items-center gap-1 text-4xl font-black text-slate-900 md:text-6xl">
                      <CountUpNumber value={stat.value} suffix={stat.suffix} />
                      <span className="text-3xl font-light text-orange-500">+</span>
                    </div>

                    <div className="mb-3 h-1 w-8 rounded-full bg-orange-100 transition-all duration-300 group-hover:w-12 group-hover:bg-orange-500" />
                    <p className="px-2 text-xs font-bold uppercase tracking-widest text-gray-500 md:text-sm">
                      {stat.label}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6">
          <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                Specialized Services
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-tight md:text-5xl">
                Legal solutions built for modern business and digital risk
              </h2>
              <p className="mt-6 text-base leading-8 text-slate-600">
                The core focus is on legal services that matter in today’s business world, including corporate advisory,
                technology law, IP documentation, cyber law support, software house legal documentation, startup and
                SaaS structuring, cross-border compliance, contract drafting, and dispute-prevention workflows.
              </p>

              <div className="mt-8 space-y-6">
                <ProgressBar title="Corporate, Technology, IP and Cyber Law" value={94} />
                <ProgressBar title="Startup and Business Structuring" value={91} />
                <ProgressBar title="Contracts, Compliance and Risk Review" value={93} />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/technology-ip-cyber-law-pakistan"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                >
                  Cyber Law
                </Link>
                <Link
                  to="/DocumentDrafting"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                >
                  Contracts
                </Link>
                <Link
                  to="/company_formation"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                >
                  Business Formation
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
                >
                  Book Consultation
                </Link>
              </div>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="relative"
            >
              <div className="overflow-hidden rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.16)]">
                <img
                  src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1400&auto=format&fit=crop"
                  alt="Corporate, cyber, and startup legal advisory services"
                  className="h-[360px] w-full object-cover transition duration-700 hover:scale-[1.02] sm:h-[440px] lg:h-[520px]"
                  loading="lazy"
                  width="700"
                  height="520"
                />
              </div>

              <div className="absolute left-4 top-4 z-20 max-w-[270px] rounded-[1.5rem] border border-white/70 bg-white/92 px-5 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.12)] backdrop-blur-md sm:left-6 sm:top-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">
                      Core Focus
                    </p>
                    <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900">
                      Legal protection for a borderless business world
                    </h3>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="overflow-hidden bg-slate-50 px-4 py-24 md:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="mb-20 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600">
                Process
              </p>
              <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-5xl">
                How the work is handled
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                Every legal matter needs structure. Every business decision needs clarity. The process is designed to
                be practical, strategic, and focused on real outcomes.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-24 hidden h-[2px] w-full bg-slate-200 md:block">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                />
              </div>

              <div className="grid gap-12 md:grid-cols-3">
                {processSteps.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="relative flex flex-col items-center">
                      <motion.div
                        whileHover={reduceMotion ? {} : { y: -6, scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className="relative z-10 mb-10 flex h-44 w-44 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                      >
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                          <Icon className="h-8 w-8" />
                        </div>
                        <div className="absolute bottom-8 text-xs font-bold tracking-[0.18em] text-slate-400">
                          0{index + 1}
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="text-center"
                      >
                        <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-4 max-w-xs leading-relaxed text-slate-600">{item.desc}</p>
                      </motion.div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 md:px-6">
          <div className="mx-auto max-w-6xl">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                Our Team
              </p>
              <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                Meet the people behind the work
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                Legal delivery is stronger when strategy, drafting, compliance, and execution work together.
              </p>
              <p className="mx-auto mt-5 max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                {PROFESSIONAL_DISCLAIMER}
              </p>
            </motion.div>

            <div className="mt-12 flex items-center justify-end gap-3">
              <button
                type="button"
                aria-label="Previous team member"
                className="team-prev flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-950 hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                type="button"
                aria-label="Next team member"
                className="team-next flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-950 hover:text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="group/section relative mt-12">
              <Swiper
                modules={[Navigation, Autoplay, A11y]}
                spaceBetween={24}
                slidesPerView={1}
                loop={true}
                grabCursor={true}
                autoplay={
                  reduceMotion
                    ? false
                    : {
                      delay: 4500,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }
                }
                navigation={{
                  nextEl: ".team-next",
                  prevEl: ".team-prev",
                }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                  1280: { slidesPerView: 4 },
                }}
                className="w-full"
              >
                {team.map((member, index) => (
                  <SwiperSlide key={`${member.name}-${index}`} className="!h-auto">
                    <motion.article
                      variants={fadeUp}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true, amount: 0.25 }}
                      custom={index}
                      className="group relative flex h-full w-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_20px_50px_-20px_rgba(253,98,25,0.15)]"
                    >
                      <div className="absolute left-0 top-0 z-20 h-1.5 w-0 bg-[#FD6219] transition-all duration-500 group-hover:w-full" />

                      <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                        <img
                          src={member.image}
                          alt={`${member.name}, ${member.role}`}
                          className="h-full w-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                          loading="lazy"
                          width="300"
                          height="375"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                      </div>

                      <div className="flex flex-col p-6 text-center">
                        <h3 className="text-xl font-black tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-[#FD6219]">
                          {member.name}
                        </h3>
                        <div className="mt-2 flex items-center justify-center gap-2">
                          <span className="h-px w-3 bg-slate-300 transition-colors group-hover:bg-[#FD6219]" />
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
                            {member.role}
                          </p>
                          <span className="h-px w-3 bg-slate-300 transition-colors group-hover:bg-[#FD6219]" />
                        </div>
                      </div>
                    </motion.article>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 md:px-6">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                Brands and Initiatives
              </p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">
                Professional platforms connected to the mission
              </h2>
              <p className="mx-auto mt-4 max-w-3xl text-base leading-8 text-slate-600">
                These platforms reflect a wider professional ecosystem around law, business, technology, social impact,
                and practical service delivery.
              </p>
            </div>

            <div className="grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-4">
              {brands.map((brand, index) => (
                <motion.div
                  key={brand}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.25 }}
                  custom={index}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-6 font-semibold text-slate-700 shadow-sm"
                >
                  {brand}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-10 md:px-6">
          <div className="mx-auto max-w-6xl rounded-[2rem] border border-amber-100 bg-amber-50 p-8">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Why this page can rank better now
                </p>
                <h2 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
                  Stronger entity clarity, stronger answers, stronger internal signals
                </h2>
                <p className="mt-5 text-base leading-8 text-slate-700">
                  This version is built not only for users, but also for search engines and modern AI systems that
                  need clear entities, direct answers, clean hierarchy, and strong contextual connections.
                </p>
              </div>

              <div className="grid gap-3">
                {[
                  "Absolute canonical URL",
                  "Person, FAQ, Breadcrumb and Organization schema",
                  "Quick Answer block for AEO",
                  "More internal links for topical depth",
                  "Improved accessible FAQ markup",
                  "Stronger jurisdiction and service signals",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                  >
                    <BadgeCheck className="h-5 w-5 text-amber-600" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-24 pt-14 md:px-6">
          <div className="mx-auto max-w-5xl">
            <motion.div
              variants={sectionVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="text-center"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">
                FAQs
              </p>
              <h2 className="mt-4 text-3xl font-bold md:text-5xl">
                Frequently asked questions
              </h2>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
                Clear answers to common questions about international legal services, cyber matters, startup support,
                and cross-border business advisory.
              </p>
            </motion.div>

            <div className="mt-12 space-y-4">
              {faqs.map((item, index) => (
                <FAQItem
                  key={item.question}
                  item={item}
                  index={index}
                  isOpen={openFaq === index}
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                />
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-center">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-6 py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-600"
              >
                Contact Us
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="https://api.whatsapp.com/send/?phone=923214277856&text=Hello+Faiz+Alam+Faizi%2C+I+need+professional+consultation.&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
              >
                Book Legal Consultation
                <FileText className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
