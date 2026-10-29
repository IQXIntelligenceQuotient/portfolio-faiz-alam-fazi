import React, { lazy, Suspense, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { buildServiceSchemas } from "../Data/schemaBuilder";
import { faq } from "../Data/FAQ_servises.js";
import { getRecommendationsForCategories } from "../Data/serviceRecommendations.js";
import Contact_us from "../common/Contactus.jsx";

const FAQSection = lazy(() => import("./FAQLayout"));

const DEFAULT_CONTENT = {
  h1: "",
  Hero_H1: "Professional Legal Services",
  Hero_p:
    "Get practical legal guidance, structured solutions, and reliable support tailored to your goals.",
  left_img: "",
  right_whyus_img: "",
  hero_image_alt: "",
  cta_button: "Contact Us",
  cta_link: "https://wa.me/923214277856",
  cta_label: "Get Started",
  cta_h1: "Speak with our team today",
  cta_p:
    "Discuss your matter with confidence and get practical guidance for the next step.",
  hero_badge_text: "Trusted legal guidance with strategic clarity",
  hero_card_label: "Professional",
  hero_card_text: "Legal consultancy with confidence",
  cards_section_label: "Core Strengths",
  cards_section_heading:
    "Professional support designed for clarity, strategy, and results",
  cards_section_text:
    "We combine legal precision with practical guidance, so every step feels informed, secure, and professionally handled.",
  left_whyus_title: "Why Choose Us",
  left_whyus_heading: "Why clients trust our legal approach",
  left_whyus_intro:
    "We focus on practical value, strong communication, and strategic execution, so clients know where they stand and what comes next.",
  quick_answer_title: "Quick Answer",
  quick_answer_text:
    "This service is designed to give clients clear guidance, structured legal support, and practical next steps tailored to their matter.",
  meta_title: "",
  meta_description: "",
  canonical_url: "",
  robots: "index, follow",
  og_image: "",
  breadcrumb: [
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
  ],
  trust_stats: [],
  process_steps: [],
  documents_required: [],
  service_areas: [],
  related_services: [],
  recommendation_categories: [],
  testimonials: [],
};

const PROFESSIONAL_DISCLAIMER =
  "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

function normalizeContent(content = {}) {
  return { ...DEFAULT_CONTENT, ...content };
}

function getServicePoints(content) {
  return [
    {
      number: "01",
      title: content.right_point_1_h1,
      description: content.right_point_1_p,
    },
    {
      number: "02",
      title: content.right_point_2_h1,
      description: content.right_point_2_p,
    },
    {
      number: "03",
      title: content.right_point_3_h1,
      description: content.right_point_3_p,
    },
    {
      number: "04",
      title: content.right_point_4_h1,
      description: content.right_point_4_p,
    },
  ].filter((item) => item.title && item.description);
}

function getAccordionData(content) {
  return [
    {
      title: content.left_point_1_h1,
      content: content.left_point_1_p,
    },
    {
      title: content.left_point_2_h1,
      content: content.left_point_2_p,
    },
    {
      title: content.left_point_3_h1,
      content: content.left_point_3_p,
    },
    {
      title: content.left_point_4_h1,
      content: content.left_point_4_p,
    },
  ].filter((item) => item.title && item.content);
}

function getDefaultBreadcrumb(content) {
  const hasServiceCrumb = content.breadcrumb.some(
    (item) => item.name?.toLowerCase() === content.Hero_H1?.toLowerCase()
  );

  return hasServiceCrumb
    ? content.breadcrumb
    : [
        ...content.breadcrumb,
        {
          name: content.Hero_H1,
          url: content.canonical_url || "#",
        },
      ];
}

function getFallbackSchemas(content, breadcrumbItems, currentFaqs) {
  const pageUrl =
    content.canonical_url ||
    (typeof window !== "undefined" ? window.location.href : "");

  const origin =
    pageUrl && /^https?:\/\//.test(pageUrl) ? new URL(pageUrl).origin : "";

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Legal Bridge LLP®",
    url: "https://legalbridge.pk/",
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item:
        item.url?.startsWith("http") || !origin ? item.url : `${origin}${item.url}`,
    })),
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: content.Hero_H1,
    description: content.meta_description || content.Hero_p,
    url: pageUrl,
    areaServed:
      content.service_areas?.length > 0
        ? content.service_areas.map((area) => ({
            "@type": "Place",
            name: area,
          }))
        : undefined,
    provider: {
      "@type": "Organization",
      name: "Legal Bridge LLP®",
      url: "https://legalbridge.pk/",
    },
  };

  const faqSchema =
    currentFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: currentFaqs.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }
      : null;

  return [orgSchema, breadcrumbSchema, serviceSchema, faqSchema].filter(Boolean);
}

function SmartLink({ to, className = "", children }) {
  if (!to) return <span className={className}>{children}</span>;

  if (to.startsWith("http")) {
    return (
      <a href={to} className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

function SectionShell({ children, className = "", lazyRender = false }) {
  return (
    <section
      className={className}
      style={
        lazyRender
          ? { contentVisibility: "auto", containIntrinsicSize: "0 600px" }
          : undefined
      }
    >
      {children}
    </section>
  );
}

function SectionHeading({ label, title, text, centered = true }) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : ""}>
      {label ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
          <span className="h-2 w-2 rounded-full bg-orange-500"></span>
          {label}
        </div>
      ) : null}

      {title ? (
        <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      ) : null}

      {text ? (
        <p className="mt-5 text-base leading-8 text-white/80 sm:text-lg">{text}</p>
      ) : null}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-black px-4 py-16 text-center text-white/65">
      Loading FAQs...
    </div>
  );
}

function ServiceLayout({ content = {}, faqKey, schemaConfig }) {
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const safeContent = normalizeContent(content);
  const servicePoints = getServicePoints(safeContent);
  const accordionData = getAccordionData(safeContent);
  const serviceSummaryPoints = servicePoints.map((item) => item.title).slice(0, 4);
  const currentFaqs = faq?.faqData?.[faqKey] || [];
  const breadcrumbItems = getDefaultBreadcrumb(safeContent);
  const recommendationData = getRecommendationsForCategories(
    safeContent.recommendation_categories
  );

  const fallbackSchemas = getFallbackSchemas(
    safeContent,
    breadcrumbItems,
    currentFaqs
  );

  const schemas = schemaConfig
    ? buildServiceSchemas(safeContent, schemaConfig, currentFaqs)?.length
      ? buildServiceSchemas(safeContent, schemaConfig, currentFaqs)
      : fallbackSchemas
    : fallbackSchemas;

  const fadeUp = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.55 },
      };

  const fadeLeft = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: -35 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7 },
      };

  const fadeRight = shouldReduceMotion
    ? {}
    : {
        initial: { opacity: 0, x: 35 },
        whileInView: { opacity: 1, x: 0 },
        viewport: { once: true, amount: 0.2 },
        transition: { duration: 0.7 },
      };

  const toggleAccordion = (index) => {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <>
      <Helmet>
        <title>{safeContent.meta_title || safeContent.Hero_H1}</title>
        <meta
          name="description"
          content={safeContent.meta_description || safeContent.Hero_p}
        />
        <meta name="robots" content={safeContent.robots} />
        {safeContent.canonical_url ? (
          <link rel="canonical" href={safeContent.canonical_url} />
        ) : null}

        <meta
          property="og:title"
          content={safeContent.meta_title || safeContent.Hero_H1}
        />
        <meta
          property="og:description"
          content={safeContent.meta_description || safeContent.Hero_p}
        />
        <meta property="og:url" content={safeContent.canonical_url || ""} />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content={safeContent.og_image || safeContent.left_img || ""}
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={safeContent.meta_title || safeContent.Hero_H1}
        />
        <meta
          name="twitter:description"
          content={safeContent.meta_description || safeContent.Hero_p}
        />
        <meta
          name="twitter:image"
          content={safeContent.og_image || safeContent.left_img || ""}
        />

        {schemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>

      <section className="border-b border-white/10 bg-black">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/60">
              {breadcrumbItems.map((item, index) => {
                const isLast = index === breadcrumbItems.length - 1;
                return (
                  <li key={`${item.name}-${index}`} className="flex items-center gap-2">
                    {isLast ? (
                      <span className="text-white/90">{item.name}</span>
                    ) : (
                      <>
                        <SmartLink
                          to={item.url}
                          className="transition hover:text-orange-400"
                        >
                          {item.name}
                        </SmartLink>
                        <span className="text-white/30">/</span>
                      </>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </section>

      <section className="relative overflow-hidden bg-black py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.12),transparent_28%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div className="animate-hero-fade">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                {safeContent.h1}
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {safeContent.Hero_H1}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
                {safeContent.Hero_p}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href={safeContent.cta_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:scale-[1.03] hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]"
                >
                  {safeContent.cta_button}
                  <svg
                    className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>

                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                  {safeContent.hero_badge_text}
                </div>
              </div>
            </div>

            <div className="relative animate-hero-fade-delay">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-orange-500/20 via-transparent to-orange-500/10 blur-2xl"></div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-3 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                <img
                  src={safeContent.left_img}
                  alt={
                    safeContent.hero_image_alt ||
                    `${safeContent.Hero_H1} legal services`
                  }
                  className="h-full w-full rounded-[22px] object-cover transition duration-700 hover:scale-[1.03]"
                  fetchPriority="high"
                  loading="eager"
                  decoding="sync"
                  width="600"
                  height="500"
                />
              </div>

              <div className="absolute -bottom-6 left-6 rounded-2xl border border-orange-500/25 bg-black/80 px-5 py-4 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.25em] text-orange-400">
                  {safeContent.hero_card_label}
                </p>
                <p className="mt-1 text-sm font-medium text-white">
                  {safeContent.hero_card_text}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionShell className="relative bg-black pb-9 pt-5" lazyRender>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.08),transparent_35%)]"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="rounded-[28px] border border-orange-500/20 bg-white/[0.03] p-6 transition-all duration-300 hover:border-orange-500/40 hover:shadow-[0_20px_60px_rgba(249,115,22,0.10)] sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
                {safeContent.quick_answer_title}
              </span>
            </div>

            <h2 className="mt-5 text-2xl font-bold text-white sm:text-3xl">
              What this service covers
            </h2>

            <p className="mt-4 max-w-4xl text-sm leading-7 text-white/80 sm:text-base">
              {safeContent.quick_answer_text}
            </p>

            <p className="mt-4 max-w-4xl rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-xs leading-6 text-white/65 sm:text-sm">
              {PROFESSIONAL_DISCLAIMER}
            </p>

            {serviceSummaryPoints.length > 0 && (
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {serviceSummaryPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    {...(shouldReduceMotion
                      ? {}
                      : {
                          initial: { opacity: 0, y: 20 },
                          whileInView: { opacity: 1, y: 0 },
                          viewport: { once: true, amount: 0.15 },
                          transition: { duration: 0.4, delay: index * 0.08 },
                        })}
                    className="group rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-sm font-medium text-white/85 transition-all duration-300 hover:border-orange-500/35 hover:bg-white/[0.04] hover:shadow-[0_12px_35px_rgba(249,115,22,0.12)]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                      <p className="leading-7 text-white/85">{point}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </SectionShell>

      {safeContent.trust_stats?.length > 0 && (
        <section className="bg-black py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {safeContent.trust_stats.map((item, index) => (
                <div
                  key={`${item.label}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5 text-center"
                >
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <p className="mt-2 text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionShell className="bg-black py-20 lg:py-24" lazyRender>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp}>
            <SectionHeading
              label={safeContent.cards_section_label}
              title={safeContent.cards_section_heading}
              text={safeContent.cards_section_text}
            />
          </motion.div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {servicePoints.map((item, index) => (
              <motion.div
                key={index}
                {...(shouldReduceMotion
                  ? {}
                  : {
                      initial: { opacity: 0, y: 35 },
                      whileInView: { opacity: 1, y: 0 },
                      viewport: { once: true, amount: 0.15 },
                      transition: { duration: 0.55, delay: index * 0.1 },
                    })}
                className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:border-orange-500/40 hover:bg-white/[0.05] hover:shadow-[0_20px_50px_rgba(249,115,22,0.12)]"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 opacity-70"></div>

                <div className="mb-6 flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-lg font-bold text-white shadow-[0_10px_30px_rgba(249,115,22,0.35)]">
                    {item.number}
                  </div>

                  <h3 className="text-xl font-semibold leading-snug text-white transition duration-300 group-hover:text-orange-400">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm leading-7 text-white/80 sm:text-base">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionShell>

      {safeContent.process_steps?.length > 0 && (
        <section className="bg-black py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp}>
              <SectionHeading
                label="Process"
                title="How our process works"
                text="A clear process helps clients understand what happens next and how the matter moves forward."
              />
            </motion.div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {safeContent.process_steps.map((step, index) => (
                <div
                  key={`${step.title}-${index}`}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] p-6"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 font-bold text-white">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {(safeContent.documents_required?.length > 0 ||
        safeContent.service_areas?.length > 0) && (
        <section className="bg-black py-20 lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            {safeContent.documents_required?.length > 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Documents and information often required
                </h2>
                <div className="mt-6 space-y-4">
                  {safeContent.documents_required.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/30 px-5 py-4"
                    >
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500"></span>
                      <p className="text-sm leading-7 text-white/80">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {safeContent.service_areas?.length > 0 && (
              <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-8">
                <h2 className="text-2xl font-bold text-white sm:text-3xl">
                  Service areas
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/75 sm:text-base">
                  We assist clients across the following locations and regions,
                  depending on the nature of the matter.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {safeContent.service_areas.map((area, index) => (
                    <span
                      key={`${area}-${index}`}
                      className="rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm text-orange-300"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <SectionShell className="bg-black py-20 lg:py-24" lazyRender>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <motion.div {...fadeLeft} className="relative order-2 lg:order-1 lg:self-center">
              <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-tr from-orange-500/15 via-transparent to-orange-500/10 blur-2xl"></div>

              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-4 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                <div className="overflow-hidden rounded-[22px]">
                  <img
                    src={safeContent.right_whyus_img}
                    alt={safeContent.left_whyus_title}
                    loading="lazy"
                    width="600"
                    height="420"
                    className="h-[260px] w-full rounded-[22px] object-cover object-center transition duration-700 hover:scale-[1.05] sm:h-[320px] lg:h-[420px]"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div {...fadeRight} className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                {safeContent.left_whyus_title}
              </div>

              <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {safeContent.left_whyus_heading}
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-8 text-white/80">
                {safeContent.left_whyus_intro}
              </p>

              <div className="mt-8 space-y-4">
                {accordionData.map((item, index) => {
                  const isOpen = activeIndex === index;

                  return (
                    <motion.div
                      key={index}
                      layout={!shouldReduceMotion}
                      {...(shouldReduceMotion
                        ? {}
                        : {
                            initial: { opacity: 0, y: 25 },
                            whileInView: { opacity: 1, y: 0 },
                            viewport: { once: true, amount: 0.1 },
                            transition: { duration: 0.45, delay: index * 0.08 },
                          })}
                      className={`overflow-hidden rounded-[22px] border transition-all duration-300 ${
                        isOpen
                          ? "border-orange-500/40 bg-orange-500/[0.07] shadow-[0_12px_40px_rgba(249,115,22,0.10)]"
                          : "border-white/10 bg-white/[0.03] hover:border-orange-500/25"
                      }`}
                    >
                      <button
                        id={`accordion-header-${index}`}
                        type="button"
                        onClick={() => toggleAccordion(index)}
                        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        aria-expanded={isOpen}
                        aria-controls={`accordion-content-${index}`}
                      >
                        <span className="text-lg font-semibold leading-7 text-white sm:text-xl">
                          {item.title}
                        </span>

                        <motion.span
                          animate={shouldReduceMotion ? {} : { rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.25 }}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/25 bg-orange-500/10 text-xl text-orange-400"
                          aria-hidden="true"
                        >
                          {isOpen ? "−" : "+"}
                        </motion.span>
                      </button>

                      <motion.div
                        id={`accordion-content-${index}`}
                        role="region"
                        aria-labelledby={`accordion-header-${index}`}
                        initial={false}
                        animate={
                          shouldReduceMotion
                            ? {}
                            : {
                                height: isOpen ? "auto" : 0,
                                opacity: isOpen ? 1 : 0,
                              }
                        }
                        className={`${isOpen ? "block" : "hidden"} overflow-hidden`}
                      >
                        <div className="px-6 pb-6">
                          <p className="text-sm leading-7 text-white/80 sm:text-base">
                            {item.content}
                          </p>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </SectionShell>

      {safeContent.testimonials?.length > 0 && (
        <section className="bg-black py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp}>
              <SectionHeading
                label="Client Trust"
                title="What clients value about this service"
              />
            </motion.div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {safeContent.testimonials.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="rounded-[24px] border border-white/10 bg-white/[0.03] p-7"
                >
                  <p className="text-sm leading-7 text-white/80">“{item.quote}”</p>
                  <div className="mt-6">
                    <p className="font-semibold text-white">{item.name}</p>
                    {item.role ? (
                      <p className="text-sm text-white/50">{item.role}</p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {safeContent.related_services?.length > 0 && (
        <section className="bg-black py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp}>
              <SectionHeading
                label="Related Services"
                title="Explore related services"
                text="Internal linking helps users explore relevant service pages and supports stronger site structure."
              />
            </motion.div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {safeContent.related_services.map((item, index) => (
                <SmartLink
                  key={`${item.title}-${index}`}
                  to={item.url}
                  className="group block rounded-[24px] border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:border-orange-500/35 hover:bg-white/[0.05]"
                >
                  <h3 className="text-xl font-semibold text-white transition group-hover:text-orange-400">
                    {item.title}
                  </h3>
                  {item.description ? (
                    <p className="mt-3 text-sm leading-7 text-white/75">
                      {item.description}
                    </p>
                  ) : null}
                  <span className="mt-6 inline-flex items-center text-sm font-medium text-orange-400">
                    Learn more
                  </span>
                </SmartLink>
              ))}
            </div>
          </div>
        </section>
      )}

      {recommendationData.services.length > 0 && (
        <section className="bg-black py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp}>
              <SectionHeading
                label="Recommended Pathways"
                title="Service pathways for business and technology clients"
                text="These recommendations help software houses, startups, BPO offices, call centers, IT companies, and foreign clients quickly find related Legal Bridge LLP® support areas."
              />
            </motion.div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {recommendationData.categories.map((category) => (
                <span
                  key={category.label}
                  className="rounded-full border border-orange-500/25 bg-orange-500/10 px-4 py-2 text-sm text-orange-300"
                >
                  {category.label}
                </span>
              ))}
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {recommendationData.services.slice(0, 9).map((service, index) => (
                <SmartLink
                  key={`${service.title}-${index}`}
                  to={service.url}
                  className="group block rounded-[24px] border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:border-orange-500/35 hover:bg-white/[0.05]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-400">
                    {service.category}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-white transition group-hover:text-orange-400">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/70">
                    {service.description}
                  </p>
                  <span className="mt-6 inline-flex items-center text-sm font-medium text-orange-400">
                    View service
                  </span>
                </SmartLink>
              ))}
            </div>
          </div>
        </section>
      )}

      <Suspense fallback={<LoadingFallback />}>
        <FAQSection faqKey={faqKey} />
      </Suspense>

      <section className="bg-black py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[32px] border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-white/[0.02] to-orange-500/5 px-6 py-14 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)] sm:px-10 lg:px-16 lg:py-20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_35%)]"></div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
                <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                {safeContent.cta_label}
              </div>

              <h2 className="mx-auto mt-5 max-w-4xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                {safeContent.cta_h1}
              </h2>

              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-white/80 sm:text-lg">
                {safeContent.cta_p}
              </p>

              <div className="mt-8">
                <a
                  href={safeContent.cta_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:scale-[1.03] hover:bg-orange-600 hover:shadow-[0_0_30px_rgba(249,115,22,0.25)]"
                >
                  {safeContent.cta_button}
                  <svg
                    className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Contact_us />
      </div>
    </>
  );
}

export default ServiceLayout;
