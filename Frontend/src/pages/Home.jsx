import React, { useEffect, useState, useRef } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useInView,
} from 'framer-motion';
import { Link } from 'react-router-dom';
import SEOHead from '../components/seo/SEOHead.jsx';
import PakistanCoverage from '../components/seo/PakistanCoverage.jsx';
import FeaturedReviews from '../components/reviews/FeaturedReviews.jsx';
import EarthCoverage from "../components/Earth.jsx";
const MotionLink = motion(Link);
const PROFESSIONAL_DISCLAIMER =
  "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

// --- DATA ARRAYS ---
const stats = [
  { value: 5, suffix: '', label: 'Core Practice Areas' },
  { value: 4, suffix: '', label: 'Client-Service Systems' },
  { value: 1, suffix: '', label: 'Legal Bridge LLP® Leadership Profile' },
  { value: 1, suffix: '', label: 'Coordinated Intake Workflow' },
];

function CountUpNumber({ value, suffix = '', duration = 1600 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const end = value;
    const startTime = performance.now();
    let rafId;

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easedProgress));
      if (progress < 1) {
        rafId = requestAnimationFrame(updateCount);
      }
    };

    rafId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}
const accordions = [
  {
    title: 'Trusted Legal Consultancy for Individuals and Businesses',
    content:
      'Get professional legal consultancy for contracts, compliance, dispute prevention, legal notices, and business decisions. Legal Bridge LLP® coordinates support for individuals, startups, and companies through practical guidance, legal documentation workflow, and structured client-service systems.',
  },
  {
    title: 'Strong Legal Representation in Negotiation, Mediation, and Court Matters',
    content:
      'When your rights, property, business interests, or financial position need protection, skilled legal representation matters. We provide support in negotiations, dispute resolution, mediation, and litigation strategy, helping clients pursue fair outcomes through structured advocacy and professional legal handling.',
  },
  {
    title: 'Accurate Legal Drafting and Document Review Services',
    content:
      'We draft and review contracts, agreements, legal notices, corporate documents, and other important legal paperwork with clarity and precision. Our document services are designed to reduce ambiguity, strengthen enforceability, protect your interests, and help prevent future disputes.',
  },
];

const servicesList = [
  {
    title: "Corporate, Technology, IP & Cyber Law Practice",
    desc: "Structured support for software houses, SaaS teams, BPO offices, call centers, IT companies, startups, and foreign clients working with Pakistani vendors.",
    image: "/service_7.jpeg",
    link: "/technology-ip-cyber-law-pakistan"
  },
  {
    title: "Technology Contracts & Documentation",
    desc: "Software development agreements, NDAs, IP assignment clauses, technical annexes, vendor terms, employment documents, and compliance paperwork.",
    image: "/service_8.jpeg",
    link: "/DocumentDrafting"
  },
  {
    title: "IP Protection for Software Companies",
    desc: "Source code ownership, copyright, trademark, brand protection, IP assignment, and documentation review for technology-sector rights.",
    image: "/service_9.jpeg",
    link: "/intellectual_property"
  },
  {
    title: "Company Formation & Corporate Advisory",
    desc: "Company registration, founder structure, corporate compliance, tax registration coordination, and advisory systems for growing teams.",
    image: "/service_10.jpeg",
    link: "/company_formation"
  },
  {
    title: "BPO, Call Center & Employment Documentation",
    desc: "Employment contracts, confidentiality agreements, vendor documents, data-related paperwork, and operational compliance coordination.",
    image: "/service_9.jpeg",
    link: "/Business_Consultant"
  },
  {
    title: "Vendor, NDA & Outsourcing Dispute Support",
    desc: "Structured review for software development disputes, source code access issues, NDA concerns, payment defaults, and legal notices.",
    image: "/service_7.jpeg",
    link: "/Representation"
  }
];

const awards = [
  {
    count: '7 Awards',
    title: 'Recognized for Excellence in Legal Consultancy and Professional Advisory Services',
    desc: 'These awards reflect consistent dedication to legal clarity, client service, strategic guidance, and professional integrity in consultancy work.',
    years: '2015 - 2025',
    image: '/award_img_1.svg',
    className: 'w-full h-full object-contain',
  },
  {
    count: '12 Awards',
    title: 'Honored for Outstanding Achievement in Business Consultancy and Strategic Advisory',
    desc: 'These recognitions highlight strong performance in business guidance, planning, decision support, and practical consulting impact across multiple sectors.',
    years: '2009 - 2025',
    image: '/award_img_2.svg',
    className: 'w-full h-full object-contain',
  },
  {
    count: '4 Gold Medals',
    title: 'A Multi-Disciplinary Journey of Achievement in Education, Discipline, and Professional Excellence',
    desc: 'These distinctions represent a broader legacy of excellence built through discipline, learning, consulting insight, and long-term personal and professional growth.',
    years: '2002 - 2025',
    image: '/award_img_3.svg',
    className: 'w-full h-full object-contain',
  },
];

const testimonials = [
  {
    name: 'Hina Ahmed',
    location: 'Lahore, Pakistan',
    quote:
      "Legal Bridge LLP® provided clear legal guidance and responsive coordination, helping me understand the documents and next steps involved in my matter.",
    image: 'https://placehold.co/120x120/e5e7eb/6b7280?text=HA',
  },
  {
    name: 'Ravi Kapoor',
    location: 'Delhi, India',
    quote:
      'When faced with a dispute, I worked with Legal Bridge LLP® for structured guidance, documentation review, and coordinated dispute strategy. The process felt professional and carefully managed.',
    image: 'https://placehold.co/120x120/e5e7eb/6b7280?text=RK',
  },
  {
    name: 'Nina Chen',
    location: 'Shanghai, China',
    quote:
      "Legal Bridge LLP® handled document drafting and review with strong attention to detail, clear structure, and practical legal safeguards.",
    image: 'https://placehold.co/120x120/e5e7eb/6b7280?text=NC',
  },
  {
    name: 'Rahul Singh',
    location: 'Mumbai, India',
    quote:
      "For a complex legal matter, Legal Bridge LLP® provided organized research and analysis that helped me make informed decisions with a clearer view of risk.",
    image: 'https://placehold.co/120x120/e5e7eb/6b7280?text=RS',
  },
  {
    name: 'Aisha Malik',
    location: 'Islamabad, Pakistan',
    quote:
      "Working with Legal Bridge LLP® on negotiations helped keep the discussion structured, documented, and focused on practical terms within the agreed scope.",
    image: 'https://placehold.co/120x120/e5e7eb/6b7280?text=AM',
  },
];

// --- ANIMATION VARIANTS ---
const fadeInUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Home() {
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [activeService, setActiveService] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [pauseTestimonials, setPauseTestimonials] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [hoveredAward, setHoveredAward] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);


  useEffect(() => {
    if (pauseTestimonials || prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [pauseTestimonials, prefersReducedMotion]);
  const homePersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Faiz Alam Faizi",
    url: "https://faizalamfaizi.com",
    image: "https://faizalamfaizi.com/1-Best-Legal_Consultant-near-me.webp",
    jobTitle: "Corporate, Technology, IP & Cyber Law Practice",
  description:
      "Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.",
    worksFor: {
      "@type": "Organization",
      name: "Legal Bridge LLP®",
      url: "https://legalbridge.pk",
    },
    sameAs: [
      "https://www.linkedin.com",
      "https://www.facebook.com",
      "https://www.instagram.com",
      "https://www.youtube.com",
    ],
    address: {
      "@type": "PostalAddress",
      addressCountry: "PK",
      addressLocality: "Lahore",
    },
    knowsAbout: [
      "Corporate Advisory",
      "Technology Law",
      "Intellectual Property Advisory",
      "Cyber Law Practice",
      "Client Service Systems",
      "Legal Documentation Workflow",
      "Cross-Practice Coordination",
      "Software House Legal Support",
      "BPO and Call Center Legal Documentation",
      "Foreign Client Pakistan Vendor Disputes",
    ],
  };
  const homeOrganizationSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LegalService", "LocalBusiness"],
    "@id": "https://faizalamfaizi.com/#organization",
    name: "Legal Bridge LLP®",
    url: "https://legalbridge.pk/",
    image: "https://faizalamfaizi.com/Business_Consultant_in_Lahore_Pakistan.svg",
    description:
      "Corporate, technology, IP and cyber law practice support for software houses, SaaS businesses, BPO offices, call centers, IT companies, startups, e-commerce ventures, digital agencies, and foreign clients working with Pakistani vendors.",
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
  };
  const homeWebsiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://faizalamfaizi.com/#website",
    url: "https://faizalamfaizi.com/",
    name: "Legal Bridge LLP®",
    publisher: {
      "@id": "https://faizalamfaizi.com/#organization",
    },
    inLanguage: "en-PK",
  };

  return (
    <div className="font-sans text-gray-800 bg-white overflow-x-hidden selection:bg-orange-500/20 selection:text-black">
      <SEOHead
  title="Faiz Alam Faizi, Corporate, Technology, IP & Cyber Law Practice | Legal Bridge LLP®"
  description="Legal Bridge LLP® supports software houses, SaaS teams, BPO offices, call centers, IT companies, startups, e-commerce ventures, digital agencies, and foreign clients with corporate, technology, IP, cyber law, contracts, compliance, and documentation workflows in Lahore and Pakistan."
  keywords="Corporate lawyer Lahore, Technology lawyer Pakistan, Cyber law lawyer Lahore, Cybercrime lawyer Pakistan, IP lawyer Lahore, Software house legal advisor Pakistan, Legal services for software houses Lahore, Legal services for BPO companies Pakistan, Call center legal documentation Lahore, IT company legal advisor Pakistan, NDA and IP agreement lawyer Pakistan, Software development contract lawyer Pakistan, Source code ownership dispute Pakistan, Technology contract lawyer Lahore, Legal Bridge LLP technology law practice"
  canonical="/"
  ogImage="/1-Best-Legal_Consultant-near-me.webp"
  schema={[homeOrganizationSchema, homeWebsiteSchema, homePersonSchema]}
/>
      {/* HERO SECTION */}
      <section aria-label="Hero" className="bg-[#161616] text-white pt-20 pb-32 relative text-center px-4 overflow-hidden hero-section">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" aria-hidden="true"></div>
        <div className="absolute -bottom-20 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl" aria-hidden="true"></div>

        {/* CSS-animated — no JS blocking paint */}
        <p className="text-orange-500 text-sm font-semibold tracking-widest uppercase mb-4 py-8 animate-hero-fade">
          Corporate, Technology, IP & Cyber Law Practice
        </p>

        <h1 className="text-4xl md:text-6xl font-bold max-w-4xl mx-auto leading-tight mb-16 animate-hero-fade-delay">
          Faiz Alam Faizi, Corporate, Technology, IP & Cyber Law Practice for Businesses, Founders, Software Houses, and Digital Risk
        </h1>

        <div className="max-w-5xl mx-auto relative mt-8 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.45)] border border-white/5 hover:shadow-[0_35px_120px_rgba(0,0,0,0.52)] transition-shadow duration-500 h-[400px] md:h-[500px] bg-black animate-hero-fade-delay2">
          {!isVideoPlaying ? (
            <div className="w-full h-full relative cursor-pointer overflow-hidden">
              <img
                src="/hero_video_bg_1.jpg"
                alt="Faiz Alam Faizi corporate and cybercrime lawyer for cyber law, business advisory, and cross-border legal services"
                fetchPriority="high"
                loading="eager"
                decoding="sync"
                width="1200"
                height="500"
                className="w-full h-full object-cover opacity-80 scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 via-transparent to-transparent pointer-events-none"></div>

              <div className="absolute inset-0 pointer-events-none bg-black/20"></div>

              <motion.button
                onClick={() => {
                  // Preconnect to YouTube only when user clicks play
                  if (!document.querySelector('link[href="https://www.youtube.com"]')) {
                    const pc = document.createElement('link');
                    pc.rel = 'preconnect';
                    pc.href = 'https://www.youtube.com';
                    document.head.appendChild(pc);
                  }
                  setIsVideoPlaying(true);
                }}
                whileHover={{
                  scale: 1.12,
                  boxShadow: '0 0 35px rgba(253,98,25,0.8)',
                }}
                whileTap={{ scale: 0.95 }}
                aria-label="Play video"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#FD6219] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(253,98,25,0.55)] focus:outline-none z-10"
              >
                <svg width="35" height="35" viewBox="0 0 80 80" fill="none" className="ml-2">
                  <path
                    d="M60.079 39.9998L30.148 57.4394L30.0104 22.7986L60.079 39.9998Z"
                    fill="white"
                  />
                </svg>
              </motion.button>
            </div>
          ) : (
            <iframe
              className="w-full h-full absolute inset-0"
              src="https://www.youtube.com/embed/R6eUFgII0Sk?si=H9Wop6mHdAobGCGD&autoplay=1"
              title="Faiz Alam Faizi corporate and cybercrime lawyer for cyber law, startup advisory, and cross-border legal services"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )}
        </div>
      </section>

      {/* STATS SECTION */}
      {/* STATS SECTION */}
      <section className="py-16 border-b border-gray-100 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                initial="hidden"
                whileInView="visible"
                whileHover={{ y: -4 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="relative rounded-2xl py-3 hover:shadow-[0_14px_36px_rgba(0,0,0,0.06)] transition-all duration-300"
              >
                {idx !== stats.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 h-12 w-px -translate-y-1/2 bg-gray-200"></div>
                )}

                <div className="text-4xl md:text-5xl font-extrabold text-black mb-2 flex items-center justify-center gap-1">
                  <CountUpNumber value={stat.value} suffix={stat.suffix} />
                  <span className="text-orange-500 text-3xl">+</span>
                </div>

                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" aria-label="About Faiz Alam Faizi" className="py-24 container mx-auto px-4" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 700px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="relative"
          >
            <div className="absolute -left-4 -bottom-4 w-full h-full border-l-4 border-b-4 border-orange-500 z-0 rounded-bl-xl"></div>
            <div className="overflow-hidden rounded-xl relative z-10">
              <img
                src="/faiz-alam-fazi.webp"
                alt="Faiz Alam Faizi corporate and cybercrime lawyer and corporate and cybercrime lawyer"
                loading="lazy"
                width="600"
                height="600"
                className="relative z-10 w-full object-cover shadow-[0_20px_60px_rgba(0,0,0,0.16)] rounded-xl transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">
              About
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
              Faiz Alam Faizi, Corporate, Technology, IP & Cyber Law Practice for Business and Digital Risk
            </h2>

            <p className="text-gray-600 mb-4 leading-relaxed">
              <span className="font-semibold text-slate-900">Faiz Alam Faizi</span> serves as Managing Director with{" "}
              <span className="font-semibold text-slate-900">Legal Bridge LLP®</span>. His profile is aligned with{" "}
              <span className="font-semibold text-slate-900">Firm Leadership</span>,{" "}
              <span className="font-semibold text-slate-900">Corporate Advisory</span>,{" "}
              <span className="font-semibold text-slate-900">Technology Law</span>,{" "}
              <span className="font-semibold text-slate-900">Intellectual Property Advisory</span>,{" "}
              <span className="font-semibold text-slate-900">Cyber Law Practice</span>,{" "}
              <span className="font-semibold text-slate-900">Client Service Systems</span>,{" "}
              <span className="font-semibold text-slate-900">Legal Documentation Workflow</span>, and{" "}
              <span className="font-semibold text-slate-900">Cross-Practice Coordination</span>.
            </p>

            <p className="text-gray-600 mb-4 leading-relaxed">
              He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow,
              technology-sector legal support, IP documentation coordination, cyber law advisory coordination,
              and coordination across practice teams. Legal Bridge LLP® supports structured work for software houses,
              SaaS businesses, BPO offices, call centers, IT companies, startups, digital agencies, e-commerce ventures,
              and foreign clients working with Pakistani vendors.
            </p>

            <p className="mt-2 text-base leading-8 text-slate-600 md:text-lg">
              Through
              <strong className="font-semibold text-slate-900"> Legal Bridge LLP®</strong>, client-service coordination may support matters connected with
              <strong className="font-semibold text-slate-900"> Pakistan</strong>,
              <strong className="font-semibold text-slate-900"> UAE</strong>,
              <strong className="font-semibold text-slate-900"> UK</strong>,
              <strong className="font-semibold text-slate-900"> USA</strong>, and beyond.
              Consultation routing, document review, and any appearance or advisory role remain governed by the written engagement scope.
            </p>

            <p className="mb-6 mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-7 text-slate-600">
              {PROFESSIONAL_DISCLAIMER}
            </p>

            <ul className="space-y-4 mb-8 text-black font-semibold">
              <li className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="text-orange-500">✔</span>
                Cybercrime law, digital asset recovery support, and online fraud documentation workflows
              </li>
              <li className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="text-orange-500">✔</span>
                Legal structuring and compliance systems for startups, SaaS, fintech, and business teams
              </li>
              <li className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="text-orange-500">✔</span>
                Cross-border contracts, international compliance, and business risk review
              </li>
              <li className="flex items-center gap-3 transition-all duration-300 hover:translate-x-1">
                <span className="text-orange-500">✔</span>
                Strategic legal advisory systems focused on prevention, documentation, and coordination
              </li>
            </ul>

            <MotionLink
              to="/about"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 border-b-2 border-black pb-1 text-sm font-bold uppercase tracking-widest text-black transition hover:border-orange-500 hover:text-orange-500"
            >
              Learn More <span>→</span>
            </MotionLink>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-24 container mx-auto px-4 bg-white" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 700px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            variants={fadeInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">
              Why Choose
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-10 leading-tight">
              Why Businesses Trust Legal Bridge LLP® for Legal Strategy and Risk Protection
            </h2>

            <div className="space-y-4 border-t border-gray-200 pt-6">
              {[
                {
                  title: "Legal Strategy, Not Just Legal Advice",
                  content:
                    "The focus is on preventive legal systems that help businesses identify risks early, structure documents clearly, and reduce avoidable disputes before they escalate."
                },
                {
                  title: "Technology, IP and Cyber Law Coordination",
                  content:
                    "Software houses, SaaS teams, IT companies, BPO offices, call centers, and digital businesses receive structured support for contracts, IP, cyber law, data-related documents, and risk review."
                },
                {
                  title: "Global and Cross-Border Legal Capability",
                  content:
                    "Foreign clients working with Pakistani vendors can seek document review, vendor agreement support, legal notices, and dispute-prevention pathways subject to written engagement scope."
                },
                {
                  title: "Specialized Support for Startups and Tech Businesses",
                  content:
                    "Startups, SaaS platforms, and digital businesses receive tailored legal structuring, investor-ready agreements, and compliance frameworks designed for long-term growth."
                },
                {
                  title: "High-Value Contract and Deal Engineering",
                  content:
                    "Every agreement is structured around the transaction, including NDA clauses, IP ownership, source code access, technical annexes, employment terms, and compliance requirements where relevant."
                },
                {
                  title: "Confidential and Scope-Based Coordination",
                  content:
                    "Legal matters are handled with confidentiality, clear communication, conflict checks, document review, and written scope alignment before advisory or appearance roles proceed."
                }
              ].map((acc, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -2 }}
                  className="border-b border-gray-200 pb-4 rounded-xl px-2 transition-all duration-300 hover:bg-orange-50/40"
                >
                  <button
                    onClick={() => setActiveAccordion(index)}
                    id={`home-accordion-btn-${index}`}
                    className="w-full text-left py-4 font-bold text-lg flex justify-between items-center text-black"
                    aria-expanded={activeAccordion === index}
                    aria-controls={`home-accordion-${index}`}
                  >
                    {acc.title}
                    <motion.span
                      animate={{ rotate: activeAccordion === index ? 45 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`text-2xl font-light ${activeAccordion === index ? 'text-orange-500' : 'text-gray-400'}`}
                      aria-hidden="true"
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeAccordion === index && (
                      <motion.div
                        id={`home-accordion-${index}`}
                        role="region"
                        aria-labelledby={`home-accordion-btn-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="overflow-hidden text-gray-600 pr-8"
                      >
                        <p className="pb-4 leading-relaxed">{acc.content}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeInRight}
            initial="hidden"
            whileInView="visible"
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)] hover:shadow-[0_30px_80px_rgba(0,0,0,0.18)] transition-all duration-500"
          >
            <img
              src="/1-Best-Legal_Consultant-near-me.jpg"
              alt="Faiz Alam Faizi corporate and cybercrime lawyer providing cyber law, business advisory, and cross-border legal services"
              loading="lazy"
              width="800"
              height="600"
              className="w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </motion.div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" aria-label="Our Services" className="py-24 bg-[#161616] text-white relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 900px' }}>
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500/5 blur-3xl rounded-full"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3"
            >
              Services
            </motion.p>

            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-4xl md:text-5xl font-bold"
            >
              Legal, Business, Tax, and Documentation Services
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* LEFT IMAGE PREVIEW */}
            <motion.div
              variants={fadeInLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -right-4 -bottom-4 w-full h-full border-r-4 border-b-4 border-orange-500 z-0 rounded-br-2xl"></div>

              <div className="relative z-10 overflow-hidden 
              h-[260px] 
  sm:h-[320px] 
  md:h-[400px] 
  lg:h-[480px] 
  xl:h-[880px] 
  rounded-xl 
  shadow-[0_20px_50px_rgba(0,0,0,0.35)] 
  transition-all duration-500">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={servicesList[activeService].image}
                    src={servicesList[activeService].image}
                    alt={`${servicesList[activeService].title} service by Legal Bridge LLP`}
                    loading="lazy"
                    width="800"
                    height="680"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.45 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </motion.div>

            {/* RIGHT CARDS */}
            <motion.div
              variants={fadeInRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-5"
            >
              {servicesList.map((service, idx) => (
                <Link
                  key={idx}
                  to={service.link}
                  onMouseEnter={() => setActiveService(idx)}
                  onFocus={() => setActiveService(idx)}
                  className="block"
                >
                  <motion.div
                    whileHover={{ x: 6, y: -2 }}
                    transition={{ duration: 0.25 }}
                    className={`group relative flex gap-6 items-start border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${activeService === idx
                      ? 'border-orange-500 bg-white/[0.04] shadow-[0_20px_50px_rgba(249,109,34,0.12)]'
                      : 'border-white/10 bg-transparent hover:border-white/20 hover:bg-white/[0.02] hover:shadow-[0_14px_40px_rgba(0,0,0,0.18)]'
                      }`}
                  >
                    <div className="absolute inset-0 rounded-2xl pointer-events-none bg-gradient-to-r from-orange-500/0 via-orange-500/[0.03] to-orange-500/0 opacity-0 group-hover:opacity-100 transition duration-500"></div>

                    <div className="flex-1 relative z-10">
                      <h3
                        className={`text-2xl font-bold mb-3 transition-colors duration-300 ${activeService === idx ? 'text-orange-500' : 'text-white'
                          }`}
                      >
                        {service.title}
                      </h3>

                      <p className="text-gray-300 text-sm leading-relaxed">
                        {service.desc}
                      </p>
                    </div>

                    <motion.div
                      animate={
                        activeService === idx
                          ? { rotate: -45, scale: 1.06 }
                          : { rotate: 0, scale: 1 }
                      }
                      transition={{ duration: 0.3 }}
                      className={`mt-2 flex-shrink-0 w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 shadow-md relative z-10 ${activeService === idx
                        ? 'bg-orange-500 border-orange-500 text-white shadow-[0_0_22px_rgba(249,109,34,0.35)]'
                        : 'border-gray-600 text-gray-400 group-hover:border-white group-hover:text-white'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      {/* Golabal section  */}

      <section
        aria-label="Serving Clients Across the Globe"
        className="py-24 bg-[#161616] text-white relative overflow-hidden"
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 650px' }}
      >
        <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3"
            >
              Global Reach
            </motion.p>

            <motion.h2
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="text-4xl md:text-5xl font-bold leading-tight mb-6"
            >
              Serving Clients Across the Globe
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.14 }}
              className="text-gray-300 text-base md:text-lg leading-relaxed"
            >
              Whether you’re running an online business or managing international operations,
              legal protection should never be limited by borders.
            </motion.p>
          </div>

          <div className="">
            <EarthCoverage />
          </div>

        </div>
      </section>

      {/* AWARDS SECTION */}
      <section
        id="awards"
        className="relative overflow-hidden bg-[#0b0b0c] py-20 sm:py-24 lg:py-28 text-white"
        style={{ contentVisibility: "auto", containIntrinsicSize: "0 1000px" }}
      >
        {/* Premium background layers */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_20%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />

        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -18, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -top-24 left-[-90px] h-72 w-72 rounded-full bg-orange-500/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -20, 0], y: [0, 22, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -bottom-24 right-[-80px] h-80 w-80 rounded-full bg-amber-400/10 blur-3xl"
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mx-auto mb-14 max-w-4xl text-center sm:mb-16 lg:mb-20"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-orange-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <span className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.8)]" />
              Professional Recognition
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">
              Awards, Achievements, and{" "}
              <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                Professional Recognition
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-gray-300 sm:text-base">
              A curated showcase of professional milestones, recognition, and notable accomplishments,
              presented with the prestige and refinement they deserve.
            </p>
          </motion.div>

          {/* Award cards */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {awards.map((award, idx) => {
              const isHovered = hoveredAward === idx;

              return (
                <motion.div
                  key={idx}
                  variants={fadeInUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: idx * 0.08 }}
                  onMouseEnter={() => setHoveredAward(idx)}
                  onMouseLeave={() => setHoveredAward(null)}
                  whileHover={{ y: -8, scale: 1.005 }}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-500"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_28%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="absolute inset-0 rounded-[28px] ring-1 ring-orange-500/0 transition-all duration-500 group-hover:ring-orange-500/20" />

                  {/* Animated beam */}
                  <motion.div
                    animate={{ x: ["-120%", "120%"] }}
                    transition={{ duration: 5.8, repeat: Infinity, ease: "linear" }}
                    className="pointer-events-none absolute top-0 h-px w-1/3 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent"
                  />

                  <div className="relative z-10 flex flex-col gap-6 px-5 py-6 sm:px-6 sm:py-7 lg:px-8 lg:py-8">
                    <div className="grid items-center gap-6 md:grid-cols-12">
                      {/* Count */}
                      <div className="md:col-span-2">
                        <div className="inline-flex flex-col">
                          <span className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                            Recognition
                          </span>
                          <h3 className="mt-2 text-3xl sm:text-4xl lg:text-[2.7rem] font-bold leading-none text-transparent bg-gradient-to-b from-orange-300 to-orange-500 bg-clip-text drop-shadow-[0_0_18px_rgba(249,115,22,0.12)]">
                            {award.count}
                          </h3>
                        </div>
                      </div>

                      {/* Main content */}
                      <div className="md:col-span-6">
                        <h4 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em] text-white transition-colors duration-300 group-hover:text-orange-50">
                          {award.title}
                        </h4>

                        <p className="mt-3 max-w-2xl text-sm sm:text-base leading-7 text-gray-300">
                          {award.desc}
                        </p>
                      </div>

                      {/* Year */}
                      <div className="md:col-span-2 md:text-right">
                        <div className="inline-flex flex-col md:items-end">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                            Timeline
                          </span>
                          <span className="mt-2 text-2xl sm:text-3xl font-bold text-white">
                            {award.years}
                          </span>
                        </div>
                      </div>

                      {/* Preview / visual card */}
                      <div className="md:col-span-2">
                        <motion.div
                          whileHover={{ scale: 1.05, rotate: 1.5 }}
                          transition={{ duration: 0.35 }}
                          className="relative ml-0 h-[140px] w-full max-w-[190px] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] shadow-[0_15px_40px_rgba(0,0,0,0.35)] md:ml-auto md:max-w-full lg:h-[145px]"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.14),transparent_35%)]" />
                          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                          <div className="relative flex h-full w-full items-center justify-center p-3">
                            {/* Mobile always image */}
                            <div className="block h-full w-full md:hidden">
                              <div className="flex h-full w-full items-center justify-center">
                                <img
                                  src={award.image}
                                  alt={award.title}
                                  className={`${award.className ?? ""} max-h-full max-w-full object-contain transition-transform duration-500`}
                                />
                              </div>
                            </div>

                            {/* Desktop hover interaction */}
                            <div className="hidden md:block h-full w-full">
                              <motion.img
                                src={award.image}
                                alt={award.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className={`${award.className ?? ""} max-h-full max-w-full object-contain mx-auto`}
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
{/* Process Section  */}
<section
  aria-label="How Legal Bridge LLP® Coordinates Matters"
  className="py-24 bg-white text-black relative overflow-hidden"
  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 850px' }}
>
  <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>
  <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-3xl mx-auto text-center mb-16">
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3"
      >
        Process
      </motion.p>

      <motion.h2
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="text-4xl md:text-5xl font-bold leading-tight mb-6"
      >
        How Legal Bridge LLP® Coordinates Matters
      </motion.h2>

      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.14 }}
        className="text-gray-600 text-base md:text-lg leading-relaxed"
      >
        A clear, structured process built to protect your interests, reduce risk, and move your matter forward with confidence.
      </motion.p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
      {[
        {
          number: "01",
          title: "Initial Consultation",
          desc: "We understand your problem, goals, or business model in detail before recommending any legal direction."
        },
        {
          number: "02",
          title: "Legal Risk Assessment",
          desc: "Hidden risks, liabilities, and legal exposure are identified so nothing important is missed."
        },
        {
          number: "03",
          title: "Strategy Development",
          desc: "A tailored legal strategy is created for protection, compliance, dispute resolution, or business growth."
        },
        {
          number: "04",
          title: "Execution",
          desc: "Contracts, filings, representation, negotiations, and legal actions are handled with precision."
        },
        {
          number: "05",
          title: "Ongoing Support",
          desc: "Ongoing support is coordinated where the written engagement scope covers later developments."
        }
      ].map((step, index) => (
        <motion.div
          key={step.number}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -6 }}
          className="group relative rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_14px_35px_rgba(0,0,0,0.06)] hover:shadow-[0_22px_55px_rgba(0,0,0,0.1)] hover:border-orange-500 transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

          <div className="relative z-10">
            <div className="w-14 h-14 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold shadow-[0_10px_25px_rgba(249,109,34,0.25)] mb-5">
              {step.number}
            </div>

            <h3 className="text-xl font-bold text-black mb-3 leading-snug">
              {step.title}
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed">
              {step.desc}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

{/* SEO SECTION */}
<section
  aria-label="Frequently Asked Questions"
  className="py-24 bg-[#161616] text-white relative overflow-hidden"
  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 900px' }}
>
  <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="max-w-3xl mx-auto text-center mb-16">
      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3"
      >
        FAQs
      </motion.p>

      <motion.h2
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="text-4xl md:text-5xl font-bold leading-tight mb-6"
      >
        Frequently Asked Questions
      </motion.h2>

      <motion.p
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ delay: 0.14 }}
        className="text-gray-300 text-base md:text-lg leading-relaxed"
      >
        Clear answers to the most common questions about international legal services,
        cyber matters, startup support, and cross-border business advisory.
      </motion.p>
    </div>

    <div className="max-w-4xl mx-auto space-y-4">
      {[
        {
          question: "Do you provide international legal services?",
          answer:
            "Legal Bridge LLP® coordinates cross-border business, contract, and compliance support through documented client-service systems and written engagement scope."
        },
        {
          question: "Can you help recover money from online fraud?",
          answer:
            "Legal Bridge LLP® coordinates digital asset recovery support, online fraud documentation, and cybercrime law strategy subject to document review and written engagement scope."
        },
        {
          question: "Do startups need a lawyer from the beginning?",
          answer:
            "Early legal structuring can reduce avoidable risk, clarify ownership, strengthen documentation, and support more orderly business growth."
        },
        {
          question: "What industries do you specialize in?",
          answer:
            "The profile is aligned with technology, SaaS, fintech, digital businesses, corporate advisory, documentation workflow, and cyber-related matters."
        },
        {
          question: "How are consultations allocated?",
          answer:
            "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope."
        }
      ].map((faq, index) => (
        <motion.div
          key={index}
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ delay: index * 0.08 }}
          whileHover={{ y: -3 }}
          className="group relative rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:p-7 shadow-[0_14px_40px_rgba(0,0,0,0.18)] hover:border-orange-500 hover:bg-white/[0.05] transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-500"></div>

          <div className="relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-orange-500 text-lg font-bold">Q</span>
              </div>

              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 leading-snug">
                  {faq.question}
                </h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
</section>

{/* Strong Positioning Section */}
<section
  aria-label="Hire a Lawyer Before the Problem Begins"
  className="py-24 bg-white text-black relative overflow-hidden"
  style={{ contentVisibility: 'auto', containIntrinsicSize: '0 820px' }}
>
  <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>
  <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/5 blur-3xl rounded-full" aria-hidden="true"></div>

  <div className="container mx-auto px-4 relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      
      <motion.div
        variants={fadeInLeft}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">
          Smart Legal Protection
        </p>

        <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
          Hire a Lawyer Before the Problem Begins
        </h2>

        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
          Most people look for legal help when the damage is already done. By then,
          the cost is higher, the pressure is heavier, and the options are usually fewer.
        </p>

        <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-8">
          The smarter approach is prevention. Strong legal planning helps you stay
          protected, make better decisions, and avoid problems before they grow into disputes.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            "Avoid legal traps",
            "Secure your business deals",
            "Protect your reputation",
            "Build systems that keep you safe"
          ].map((point, index) => (
            <motion.div
              key={point}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -3 }}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-orange-500 hover:shadow-[0_14px_35px_rgba(0,0,0,0.08)] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-orange-500 text-lg">✔</span>
              </div>
              <p className="text-sm md:text-base font-semibold text-black">
                {point}
              </p>
            </motion.div>
          ))}
        </div>

        <p className="text-lg md:text-xl font-semibold text-black leading-relaxed">
          Because the best legal victory is the one you never have to fight.
        </p>
      </motion.div>

      <motion.div
        variants={fadeInRight}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        whileHover={{ y: -4 }}
        className="relative"
      >
        <div className="absolute -right-3 -bottom-3 w-full h-full border-r-4 border-b-4 border-orange-500 rounded-br-2xl z-0"></div>

        <div className="relative z-10 rounded-2xl overflow-hidden bg-[#161616] text-white p-8 md:p-10 shadow-[0_25px_60px_rgba(0,0,0,0.16)]">
          <div className="w-16 h-16 rounded-full bg-orange-500 text-white flex items-center justify-center text-2xl font-bold shadow-[0_10px_25px_rgba(249,109,34,0.25)] mb-6">
            ⚖
          </div>

          <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-4">
            Prevention is always cheaper than repair
          </h3>

          <p className="text-gray-300 leading-relaxed mb-4">
            Legal protection is not only for crises. It is a business and personal
            advantage that keeps you prepared, compliant, and in control.
          </p>

          <p className="text-gray-300 leading-relaxed">
            Whether you are signing agreements, expanding a company, protecting your
            brand, or managing digital risk, the right legal guidance at the right
            time can save you from avoidable loss.
          </p>
        </div>
      </motion.div>
    </div>
  </div>
</section>



      {/* REVIEWS SECTION */}
      <FeaturedReviews 
        limit={6}
        title="What Clients Say About Us"
        subtitle="Client Testimonials"
        description="Real feedback from clients who trusted our professional guidance, legal support, and committed service."
        showHeaderCta={true}
        showBottomCta={false}
      />

      {/* CTA SECTION */}
<section
  id="cta"
  className="py-8 sm:py-12 lg:py-16 px-3"
  style={{ contentVisibility: "auto", containIntrinsicSize: "0 160px" }}
>
  <div className="max-w-5xl mx-auto">
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      whileHover={{ y: -3 }}
      viewport={{ once: true }}
      className="bg-[#1a1515] rounded-2xl sm:rounded-3xl px-6 py-8 sm:px-10 sm:py-10 md:px-12 md:py-12 text-center relative overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.35)] border border-white/5 transition-all duration-400"
    >
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-32 h-32 sm:w-40 sm:h-40 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-orange-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white max-w-3xl mx-auto mb-4 leading-tight relative z-10">
        Let’s Secure Your Future Today
      </h2>

      {/* Subtext */}
      <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed relative z-10">
        Whether you’re facing a legal issue or building something new, the right legal strategy makes all the difference.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
        
        {/* Primary Button */}
        <MotionLink
          to="/contact"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center justify-center w-full sm:w-auto bg-orange-500 text-white px-6 py-3.5 rounded-full font-semibold text-sm shadow-[0_10px_25px_rgba(249,115,22,0.25)] hover:bg-orange-600 transition-all duration-300"
        >
          Book Consultation Now
        </MotionLink>

        {/* Secondary Button */}
        <a
          href="https://wa.me/923214277856"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full sm:w-auto border border-orange-500 text-orange-500 px-6 py-3.5 rounded-full font-semibold text-sm hover:bg-orange-500 hover:text-white transition-all duration-300"
        >
          Talk on WhatsApp
        </a>

      </div>
    </motion.div>
  </div>
</section>

      {/* Pakistan Coverage Section */}
      <PakistanCoverage serviceName="Professional Legal & Business Services" />
      {/* TESTIMONIALS */}
      <section id="testimonials" aria-label="Client Testimonials" className="py-16 sm:py-20 lg:py-24 bg-[#f8f8f6] relative overflow-hidden" style={{ contentVisibility: 'auto', containIntrinsicSize: '0 700px' }}>
        <div className="absolute top-6 left-6 sm:top-10 sm:left-10 opacity-10">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <rect
              x="10"
              y="10"
              width="40"
              height="40"
              stroke="black"
              strokeWidth="2"
              fill="none"
              transform="rotate(45 30 30)"
            />
          </svg>
        </div>

        <div className="absolute top-8 right-6 sm:top-16 sm:right-16 opacity-10">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="34" stroke="black" strokeWidth="2" fill="none" />
            <circle cx="68" cy="62" r="24" stroke="black" strokeWidth="2" fill="none" />
          </svg>
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-12 md:mb-14"
          >
            <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black">
              What Clients Say About Our Legal and Business Services
            </h2>
          </motion.div>

          <div
            className="relative"
            onMouseEnter={() => setPauseTestimonials(true)}
            onMouseLeave={() => setPauseTestimonials(false)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 35, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -25, scale: 0.96 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="bg-white rounded-[22px] sm:rounded-[28px] h-[500px] sm:h-[540px] md:h-[580px] lg:h-[620px] shadow-[0_25px_70px_rgba(0,0,0,0.10)] border border-black/5 px-5 py-8 sm:px-6 sm:py-10 md:px-10 md:py-12 lg:px-14 lg:py-16 text-center relative overflow-hidden hover:shadow-[0_30px_80px_rgba(0,0,0,0.14)] transition-all duration-500 flex flex-col"
              >
                <div className="absolute -top-10 -right-10 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-orange-500/5 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-12 -left-12 w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-black/5 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                  <div className="text-orange-500 text-4xl sm:text-5xl md:text-6xl leading-none mb-6 sm:mb-8 font-serif">
                    ”
                  </div>

                  <div className="h-[180px] sm:h-[210px] md:h-[230px] lg:h-[250px] overflow-y-auto pr-2">
                    <blockquote cite={`#testimonial-${activeTestimonial}`} className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-gray-800 max-w-3xl mx-auto font-medium">
                      {testimonials[activeTestimonial].quote}
                    </blockquote>
                  </div>
                </div>

                <div className="mt-auto pt-8 sm:pt-10 flex flex-col items-center relative z-10">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    src={testimonials[activeTestimonial].image}
                    alt={`${testimonials[activeTestimonial].name} — client testimonial`}
                    loading="lazy"
                    width="80"
                    height="80"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-lg ring-4 ring-orange-500/15 mb-4"
                  />
                  <h4 className="font-bold text-lg sm:text-xl text-black">
                    {testimonials[activeTestimonial].name}
                  </h4>
                  <p className="text-gray-500 text-sm text-center">
                    {testimonials[activeTestimonial].location}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
              <motion.button
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev === 0 ? testimonials.length - 1 : prev - 1
                  )
                }
                aria-label="Previous testimonial"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition duration-300 shadow-md hover:shadow-[0_12px_28px_rgba(249,115,22,0.18)] focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                ←
              </motion.button>

              <div className="flex flex-wrap justify-center gap-2 max-w-full">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    aria-label={`Go to testimonial ${idx + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${activeTestimonial === idx
                      ? 'w-8 sm:w-10 bg-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.25)]'
                      : 'w-2.5 bg-gray-300 hover:bg-orange-300'
                      }`}
                  />
                ))}
              </div>

              <motion.button
                whileHover={{ y: -2, scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() =>
                  setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
                }
                aria-label="Next testimonial"
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition duration-300 shadow-md hover:shadow-[0_12px_28px_rgba(249,115,22,0.18)] focus:outline-none focus:ring-2 focus:ring-orange-500/30"
              >
                →
              </motion.button>
            </div>
          </div>
        </div>

        {/* Decorative Floating Client Images — CSS animations (compositor thread, no JS overhead) */}
        <img
          src="/layer_img_2.jpeg"
          alt=""
          aria-hidden="true"
          width="64"
          height="64"
          loading="lazy"
          className="hidden xl:block absolute left-[6%] top-[28%] w-16 h-16 rounded-full object-cover shadow-[0_18px_40px_rgba(0,0,0,0.14)] ring-4 ring-white/70 opacity-80 animate-float-up"
        />

        <img
          src="/layer_img_1.jpeg"
          alt=""
          aria-hidden="true"
          width="80"
          height="80"
          loading="lazy"
          className="hidden xl:block absolute left-[10%] bottom-[18%] w-20 h-20 rounded-full object-cover shadow-[0_20px_45px_rgba(0,0,0,0.16)] ring-4 ring-white/70 opacity-90 animate-float-down"
        />

        <img
          src="/layer_img_4.jpeg"
          alt=""
          aria-hidden="true"
          width="80"
          height="80"
          loading="lazy"
          className="hidden xl:block absolute right-[8%] top-[24%] w-20 h-20 rounded-full object-cover shadow-[0_20px_45px_rgba(0,0,0,0.16)] ring-4 ring-white/70 opacity-90 animate-float-up-slow"
        />

        <img
          src="/layer_img_6.jpeg"
          alt=""
          aria-hidden="true"
          width="64"
          height="64"
          loading="lazy"
          className="hidden xl:block absolute right-[5%] bottom-[16%] w-16 h-16 rounded-full object-cover shadow-[0_18px_40px_rgba(0,0,0,0.14)] ring-4 ring-white/70 opacity-80 animate-float-down-slow"
        />
      </section>
      {/* Featured Reviews */}
      <FeaturedReviews />
    </div>
  );
}
