import React from "react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -36 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 36 },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerWrap = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const sectionViewport = {
  once: true,
  amount: 0.15,
};

const expertiseItems = [
  {
    icon: "⚖",
    title: "Corporate & Commercial Law",
    text: "Advising institutions and businesses on legal structures, commercial obligations, strategic agreements, and legal risk.",
  },
  {
    icon: "🛡",
    title: "Litigation Strategy & Legal Advisory",
    text: "Blending legal analysis with practical decision-making to support disputes, representation, and preventive legal planning.",
  },
  {
    icon: "📋",
    title: "Corporate Governance & Compliance",
    text: "Helping organizations strengthen institutional discipline, transparency, governance frameworks, and operational confidence.",
  },
  {
    icon: "🌍",
    title: "Human Rights & Public Policy",
    text: "Supporting justice-oriented initiatives that engage with rights advocacy, institutional responsibility, and public service priorities.",
  },
  {
    icon: "📈",
    title: "Business Strategy & Entrepreneurship",
    text: "Building ventures, scaling ideas, and shaping organizations with a practical understanding of growth, sustainability, and value creation.",
  },
  {
    icon: "💻",
    title: "Digital Transformation & Technology Platforms",
    text: "Bridging law and business with digital systems, modern platforms, and strategy-driven technological thinking.",
  },
  {
    icon: "🏛",
    title: "Institutional Development",
    text: "Contributing to initiatives that strengthen governance structures, leadership processes, organizational systems, and strategic direction.",
  },
  {
    icon: "🩺",
    title: "Public Health Legal Coordination",
    text: "Supporting health-related initiatives through legal coordination, public-interest participation, and institutional collaboration.",
  },
];

const leadershipItems = [
  {
    title: "Chief Executive Officer / Managing Director",
    org: "Click2Print Pvt. Ltd.",
    text: "Leading a professional enterprise focused on digital printing, branding, and business solutions with an emphasis on execution, service quality, and institutional reliability.",
  },
  {
    title: "Managing Director",
    org: "H9CRM",
    text: "Contributing to technology-led business growth through digital systems, organizational strategy, and modern platform thinking.",
  },
  {
    title: "Managing Director",
    org: "Explore Marketing Consultant",
    text: "Guiding business positioning, market thinking, and strategic communication through practical commercial leadership.",
  },
  {
    title: "Managing Partner / Director",
    org: "Legal Bridge LLP®",
    text: "Leading legal advisory, corporate consulting, compliance support, and strategic legal services with a focus on professionalism, integrity, and client trust.",
  },
  {
    title: "Founder / Chairman",
    org: "Elder Care Pakistan",
    text: "Building a socially conscious platform dedicated to dignity, support, and structured care initiatives for the elderly and vulnerable communities.",
  },
];

const contributionItems = [
  {
    no: "01",
    title: "Punjab Bar Council",
    text: "Member, Human Rights Committee & Police Liaison Committee",
  },
  {
    no: "02",
    title: "Lahore High Court Bar Association",
    text: "Member, Free Legal Aid Committee",
  },
  {
    no: "03",
    title: "Lahore High Court Bar Association",
    text: "Vice Chairman, Youth Affairs Committee",
  },
  {
    no: "04",
    title: "Punjab Bar Council",
    text: "Vice Chairman, Anti-Corruption Committee",
  },
  {
    no: "05",
    title: "National Youth Assembly Punjab, Pakistan",
    text: "Youth Minister",
  },
  {
    no: "06",
    title: "Punjab Online Tele-Medicine Initiative",
    text: "Project Manager, UNICEF Supported COVID-19 Program",
  },
  {
    no: "07",
    title: "Academy of Family Physicians Pakistan",
    text: "Legal Advisor",
  },
  {
    no: "08",
    title: "Rotary International",
    text: "Legal Advisor, Human Rights Affairs",
  },
  {
    no: "09",
    title: "Grappling Federation of Pakistan",
    text: "General Secretary",
  },
  {
    no: "10",
    title: "International Human Rights Movement",
    text: "Secretary, Media & Legal Affairs",
  },
  {
    no: "11",
    title: "NextPro Global SMC (Private) Limited",
    text: "Country Representative",
  },
];

const faqItems = [
  {
    question: "Who is Faiz Alam Faizi?",
    answer:
      "Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.",
  },
  {
    question: "What does Faiz Alam Faizi do?",
    answer:
      "He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams through Legal Bridge LLP® leadership systems.",
  },
  {
    question: "Where is Faiz Alam Faizi based?",
    answer:
      "Faiz Alam Faizi is based in Lahore, Pakistan, with work coordinated through Legal Bridge LLP® systems for local, national, and cross-border matters.",
  },
  {
    question: "What are the main areas of expertise of Faiz Alam Faizi?",
    answer:
      "His profile is aligned with corporate advisory, cybercrime law, legal documentation workflow, client-service systems, cross-practice coordination, business strategy, and responsible digital transformation.",
  },
  {
    question: "What organizations is Faiz Alam Faizi associated with?",
    answer:
      "The profile is connected with Legal Bridge LLP®, Click2Print Pvt. Ltd., H9CRM, Explore Marketing Consultant, and Elder Care Pakistan, along with public service and professional initiatives.",
  },
  {
    question: "How can I contact Faiz Alam Faizi?",
    answer:
      "Contact requests are routed through Legal Bridge LLP® systems by phone at +92 321 4277856 or by email at info@faizalamfaizi.com. Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.",
  },
];

const stats = [
  { value: "5+", label: "Leadership Ventures" },
  { value: "10+", label: "Public Roles" },
  { value: "3+", label: "Academic Disciplines" },
  { value: "2+", label: "Published Works" },
];

const SectionHeading = ({ eyebrow, title, text, center = false }) => (
  <motion.div
    variants={fadeUp}
    initial="hidden"
    whileInView="show"
    viewport={sectionViewport}
    className={`mb-10 max-w-4xl ${center ? "mx-auto text-center" : ""}`}
  >
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af3740] bg-[#d4af3710] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37] sm:text-[13px]">
      <span className="h-2 w-2 rounded-full bg-[#d4af37] shadow-[0_0_18px_rgba(212,175,55,0.7)]" />
      {eyebrow}
    </div>
    <h2 className="mb-4 font-serif text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
      {title}
    </h2>
    <p className="text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
      {text}
    </p>
  </motion.div>
);

const CardBase =
  "rounded-[24px] border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.28)] transition duration-300 hover:-translate-y-1 hover:border-[#d4af3740]";
const PROFESSIONAL_DISCLAIMER =
  "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

export default function AboutFaizAlamFaizi() {
  return (
    <main className="overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_20%),linear-gradient(180deg,#08101d_0%,#0c1524_40%,#09111d_100%)] text-slate-50">
      <section className="relative px-4 pb-16 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-20 lg:pt-24">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af3740] bg-[#d4af3710] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37] sm:text-[13px]">
              <span className="h-2 w-2 rounded-full bg-[#d4af37] shadow-[0_0_18px_rgba(212,175,55,0.7)]" />
              Executive Personal Brand Profile
            </div>

            <div className="mb-3 text-sm font-bold text-[#d4af37] sm:text-base md:text-lg">
              Faiz Alam Faizi, Corporate, Technology, IP & Cyber Law Practice
            </div>

            <h1 className="mb-5 font-serif text-4xl leading-tight tracking-[-0.03em] text-white sm:text-5xl md:text-6xl xl:text-7xl">
              Faiz Alam Faizi
            </h1>

            <p className="max-w-3xl text-base leading-7 text-slate-400 sm:text-lg sm:leading-8">
              Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®.
              His profile is aligned with Firm Leadership, Corporate Advisory,
              Technology Law, Intellectual Property Advisory, Cyber Law Practice,
              Client Service Systems, Legal Documentation Workflow, and
              Cross-Practice Coordination. He leads firm strategy, client-service
              standards, corporate advisory systems, legal documentation workflow,
              technology-sector legal support, IP documentation coordination,
              cyber law advisory coordination, and coordination across practice teams.
            </p>

            <motion.div
              variants={staggerWrap}
              initial="hidden"
              whileInView="show"
              viewport={sectionViewport}
              className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              {[
                "📍 Lahore, Pakistan",
                "📞 +92 321 4277856",
                "✉ info@faizalamfaizi.com",
              ].map((item) => (
                <motion.div
                  key={item}
                  variants={scaleIn}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-400"
                >
                  {item}
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={staggerWrap}
              initial="hidden"
              whileInView="show"
              viewport={sectionViewport}
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
            >
              <motion.a
                variants={scaleIn}
                href="#contact-faiz-alam-faizi"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#f1d271] to-[#d4af37] px-6 text-center font-bold text-slate-900 shadow-[0_12px_28px_rgba(212,175,55,0.25)] transition hover:-translate-y-0.5"
              >
                Book Consultation
              </motion.a>

              <motion.a
                variants={scaleIn}
                href="#about-faiz-alam-faizi"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#d4af3740] bg-white/[0.02] px-6 text-center font-bold text-slate-50 transition hover:bg-[#d4af3714] hover:text-[#d4af37]"
              >
                Explore Profile
              </motion.a>

              <motion.a
                variants={scaleIn}
                href="https://api.whatsapp.com/send/?phone=923214277856&text=Hello%20Faiz%20Alam%20Faizi,%20I%20would%20like%20to%20connect."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-center font-bold text-slate-50 transition hover:border-[#d4af3740] hover:text-[#d4af37]"
              >
                WhatsApp
              </motion.a>
            </motion.div>

            <p className="mt-5 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-xs leading-6 text-slate-400 sm:text-sm">
              {PROFESSIONAL_DISCLAIMER}
            </p>

            <motion.div
              variants={staggerWrap}
              initial="hidden"
              whileInView="show"
              viewport={sectionViewport}
              className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  variants={scaleIn}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-5 text-center"
                >
                  <strong className="block text-2xl font-extrabold text-[#d4af37] sm:text-3xl">
                    {stat.value}
                  </strong>
                  <span className="text-sm text-slate-400">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[28px] border border-[#d4af3740] bg-gradient-to-b from-white/10 to-white/[0.03] p-4 shadow-[0_26px_70px_rgba(0,0,0,0.34)] sm:p-6 lg:p-7">
              <motion.div
                initial={{ scale: 1.06, opacity: 0.75 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                viewport={sectionViewport}
                className="relative mb-5 aspect-[4/4.5] w-full overflow-hidden rounded-[22px] border border-white/10 bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(145deg, rgba(212,175,55,0.18), rgba(255,255,255,0.03))",
                }}
              >
                <img src="/faiz alam faizi 23.webp" />
                <div className="absolute bottom-3 left-3 right-3 w-fit max-w-[92%] rounded-full border border-white/10 bg-[#08101db3] px-4 py-2 text-[11px] text-white/90 sm:bottom-4 sm:left-4 sm:text-[12px]">
                  Lead with justice, work with purpose, and let your character
                  speak louder than your achievements.
                </div>
              </motion.div>

              <h3 className="mb-2 text-xl font-semibold sm:text-[1.35rem]">
                Executive Snapshot
              </h3>
              <p className="text-sm leading-7 text-slate-400 sm:text-base">
                Leading legal advisory, digital enterprise, public-interest initiatives,
                and institutional collaboration with a long-view approach to justice,
                compliance, and strategic growth.
              </p>

              <motion.ul
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={sectionViewport}
                className="mt-5 grid gap-3"
              >
                {[
                  "Managing Partner / Director, Legal Bridge LLP®",
                  "Chief Executive Officer / Managing Director, Click2Print Pvt. Ltd.",
                  "Founder / Chairman, Elder Care Pakistan",
                  "Managing Director, H9CRM and Explore Marketing Consultant",
                ].map((item) => (
                  <motion.li
                    key={item}
                    variants={scaleIn}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400 sm:text-[0.95rem]"
                  >
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="about-faiz-alam-faizi"
        className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Profile"
            title="Professional Identity Built on Law, Strategy, and Public Service"
            text="This profile is more than a résumé. It reflects a career shaped by legal command, entrepreneurial execution, ethical leadership, and a strong commitment to justice and institutional development."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-6 lg:grid-cols-2"
          >
            <motion.div variants={fadeUp} className={`${CardBase} p-6 sm:p-7`}>
              <h3 className="mb-4 text-xl font-semibold">Who He Is</h3>
              <p className="text-slate-400">
                Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®.
                His profile is aligned with Firm Leadership, Corporate Advisory,
                Technology Law, Intellectual Property Advisory, Cyber Law Practice,
                Client Service Systems, Legal Documentation Workflow, and
                Cross-Practice Coordination. He leads firm strategy, client-service
                standards, corporate advisory systems, legal documentation workflow,
                technology-sector legal support, IP documentation coordination,
                cyber law advisory coordination, and coordination across practice teams.
              </p>
              <p className="mt-4 text-slate-400">
                This profile is presented as firm leadership and coordinated
                client-service infrastructure, not as a guarantee of personal
                availability, court appearance, or direct legal engagement.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className={`${CardBase} relative overflow-hidden p-6 sm:p-7`}
            >
              <div className="pointer-events-none absolute left-3 top-[-6px] font-serif text-[6rem] leading-none text-[#d4af3720] sm:left-4 sm:text-[8rem]">
                “
              </div>
              <h3 className="relative z-10 mb-4 text-xl font-semibold">
                Why This Profile Matters
              </h3>
              <p className="relative z-10 text-slate-400">
                This profile matters because it connects firm leadership, corporate
                advisory, client-service systems, legal documentation workflow, and
                cross-practice coordination in one disciplined professional framework.
                The emphasis is on reliable systems, careful routing, and legally
                appropriate communication.
              </p>
              <p className="relative z-10 mt-4 text-slate-400">
                Alongside professional work, the profile reflects public service,
                responsible governance, community-oriented initiatives, and careful
                coordination between leadership, documentation, and client-service
                responsibilities.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="core-expertise" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Core Expertise"
            title="Multidisciplinary Expertise Designed for Modern Leadership"
            text="The strength of this profile lies in its ability to connect legal reasoning with business strategy, governance, technology, and public-interest work."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4"
          >
            {expertiseItems.map((item) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                whileHover={{ y: -6 }}
                className={`${CardBase} p-6 sm:p-7`}
              >
                <div className="mb-4 inline-flex h-[54px] w-[54px] items-center justify-center rounded-2xl border border-[#d4af3740] bg-[#d4af371f] text-[22px] font-bold text-[#d4af37]">
                  {item.icon}
                </div>
                <h3 className="mb-2 text-[1.05rem] font-semibold sm:text-[1.08rem]">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 sm:text-[0.95rem]">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        id="executive-leadership"
        className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Executive Leadership"
            title="Leadership Across Law, Enterprise, and Institutional Growth"
            text="This section should feel like proof, not just description. These roles show operational depth, leadership credibility, and long-range influence."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-5"
          >
            {leadershipItems.map((item) => (
              <motion.article
                key={item.title + item.org}
                variants={fadeUp}
                className="relative rounded-[20px] border border-white/10 bg-white/[0.035] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.28)] sm:px-6 sm:py-6"
              >
                <div className="absolute bottom-[18px] left-0 top-[18px] w-1 rounded-full bg-gradient-to-b from-[#f1d271] to-[#d4af37]" />
                <div className="pl-3">
                  <h3 className="mb-1 text-base font-semibold sm:text-[1.14rem]">
                    {item.title}
                  </h3>
                  <span className="mb-2 block font-bold text-[#d4af37]">
                    {item.org}
                  </span>
                  <p className="text-sm text-slate-400 sm:text-[0.96rem]">{item.text}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section
        id="public-service-contributions"
        className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Public Service & Contributions"
            title="Public Roles That Add Civic Depth to Professional Authority"
            text="These contributions make the personal brand stronger because they show service beyond business. That always adds substance and trust."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-5 lg:grid-cols-2"
          >
            {contributionItems.map((item) => (
              <motion.div
                key={item.no}
                variants={scaleIn}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
              >
                <div className="flex h-11 w-11 min-w-[44px] items-center justify-center rounded-xl border border-[#d4af3740] bg-[#d4af371f] font-extrabold text-[#d4af37]">
                  {item.no}
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-400 sm:text-base">{item.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="education" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Education"
            title="Academic Foundation Across Law, Business, and Technology"
            text="The academic profile supports the multidisciplinary nature of the brand and explains why the website should not look narrow or one-dimensional."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              { icon: "🎓", title: "LL.B, Bachelor of Laws", text: "An External Program" },
              {
                icon: "📚",
                title: "Master of Business Administration",
                text: "University of the Punjab",
              },
              {
                icon: "🖥",
                title: "BCS, Computer Science",
                text: "Qaid-e-Azam College of Commerce",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                className={`${CardBase} p-6 sm:p-7`}
              >
                <div className="mb-4 inline-flex h-[54px] w-[54px] items-center justify-center rounded-2xl border border-[#d4af3740] bg-[#d4af371f] text-[22px] font-bold text-[#d4af37]">
                  {item.icon}
                </div>
                <h3 className="mb-2 font-semibold">{item.title}</h3>
                <p className="text-slate-400">{item.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="publications" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Publications"
            title="Published Work That Extends the Brand Beyond Practice"
            text="Publications give a personal brand intellectual weight. They show voice, thought, reflection, and the ability to contribute beyond direct professional work."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-6 lg:grid-cols-2"
          >
            {[
              {
                tag: "Featured Legal Publication",
                title: "Beyond the Gavel: Unleashing the Path to Becoming a Successful Lawyer",
                text: "A professional work exploring legal ethics, courtroom strategy, and the mindset required to build a meaningful, principled, and impactful legal career.",
              },
              {
                tag: "Featured Urdu Publication",
                title: "چار میم سے بنتا ہے مکمل انسان",
                text: "An inspirational Urdu work discussing the moral values that shape a balanced personality, stronger character, and a more responsible member of society.",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={scaleIn}
                className={`${CardBase} p-6 sm:p-7`}
              >
                <span className="mb-4 inline-block rounded-full border border-[#d4af3740] bg-[#d4af3714] px-3 py-2 text-[12px] font-bold uppercase tracking-[0.04em] text-[#d4af37]">
                  {item.tag}
                </span>
                <h3 className="mb-3 text-lg font-semibold sm:text-xl">{item.title}</h3>
                <p className="text-slate-400">{item.text}</p>
                <div className="mt-6">
                  <a
                    href="#contact-faiz-alam-faizi"
                    className="inline-flex min-h-[48px] items-center justify-center rounded-full border border-[#d4af3740] bg-white/[0.02] px-6 text-center font-bold text-slate-50 transition hover:bg-[#d4af3714] hover:text-[#d4af37]"
                  >
                    Request Details
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="languages" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className={`${CardBase} p-6 sm:p-7`}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af3740] bg-[#d4af3710] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37] sm:text-[13px]">
              <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
              Languages
            </div>
            <h2 className="mb-4 font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl">
              Working Across Diverse Audiences
            </h2>
            <p className="text-slate-400">
              Language capability strengthens both accessibility and influence,
              especially across legal, public, and institutional communication.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {["English", "Urdu", "Punjabi"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            id="professional-values"
            variants={fadeRight}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className={`${CardBase} p-6 sm:p-7`}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af3740] bg-[#d4af3710] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37] sm:text-[13px]">
              <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
              Professional Values
            </div>
            <h2 className="mb-4 font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl">
              The Principles Behind the Profile
            </h2>
            <p className="text-slate-400">
              These values are not filler. They should guide the tone of the website,
              the visual language, the copy, and every call to action.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {[
                "Justice",
                "Integrity",
                "Transparency",
                "Ethical Leadership",
                "Social Responsibility",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-slate-400"
                >
                  {item}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="faqs" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Frequently Asked Questions"
            title="Common Questions About Faiz Alam Faizi"
            text="These direct answers help visitors, search engines, and AI platforms quickly understand the background, work, and professional focus of Faiz Alam Faizi."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-6 lg:grid-cols-2"
          >
            {faqItems.map((item) => (
              <motion.div
                key={item.question}
                variants={scaleIn}
                className={`${CardBase} p-6 sm:p-7`}
              >
                <h3 className="mb-3 text-lg font-semibold sm:text-xl">{item.question}</h3>
                <p className="text-slate-400">{item.answer}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="related-ventures" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Associated Ventures"
            title="Connected Professional Platforms"
            text="Explore the organizations and initiatives connected to the work and leadership of Faiz Alam Faizi."
          />

          <motion.div
            variants={staggerWrap}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="grid gap-6 lg:grid-cols-2"
          >
            <motion.a
              variants={scaleIn}
              whileHover={{ y: -6 }}
              href="https://legalbridge.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${CardBase} p-6 sm:p-7`}
            >
              <h3 className="mb-3 text-lg font-semibold sm:text-xl">Legal Bridge LLP®</h3>
              <p className="text-slate-400">
                Corporate law, legal advisory, compliance, litigation strategy, and
                professional legal services.
              </p>
            </motion.a>

            <motion.a
              variants={scaleIn}
              whileHover={{ y: -6 }}
              href="https://click2print.pk/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${CardBase} p-6 sm:p-7`}
            >
              <h3 className="mb-3 text-lg font-semibold sm:text-xl">
                Click2Print Pvt. Ltd.
              </h3>
              <p className="text-slate-400">
                Digital printing, branding, packaging, and business-focused creative
                solutions.
              </p>
            </motion.a>
          </motion.div>
        </div>
      </section>

      <section
        id="contact-faiz-alam-faizi"
        className="px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={sectionViewport}
            className="relative overflow-hidden rounded-[30px] border border-[#d4af3740] bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.14),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] px-5 py-10 text-center sm:px-8 sm:py-12"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d4af3740] bg-[#d4af3710] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#d4af37] sm:text-[13px]">
                <span className="h-2 w-2 rounded-full bg-[#d4af37]" />
                Contact & Collaboration
              </div>

              <h2 className="mb-4 font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
                Let’s Build Something Meaningful, Strategic, and Impactful
              </h2>

              <p className="mx-auto mb-6 max-w-3xl text-slate-400">
                Whether the need is legal advisory, business consultation, strategic
                collaboration, speaking engagement, institutional partnership, or
                public-interest coordination, this page should end with a clear path to
                connect.
              </p>

              <motion.div
                variants={staggerWrap}
                initial="hidden"
                whileInView="show"
                viewport={sectionViewport}
                className="flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center"
              >
                <motion.a
                  variants={scaleIn}
                  href="tel:+923214277856"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full bg-gradient-to-br from-[#f1d271] to-[#d4af37] px-6 text-center font-bold text-slate-900 shadow-[0_12px_28px_rgba(212,175,55,0.25)] transition hover:-translate-y-0.5"
                >
                  Call Now
                </motion.a>
                <motion.a
                  variants={scaleIn}
                  href="mailto:info@faizalamfaizi.com"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-[#d4af3740] bg-white/[0.02] px-6 text-center font-bold text-slate-50 transition hover:bg-[#d4af3714] hover:text-[#d4af37]"
                >
                  Send Email
                </motion.a>
                <motion.a
                  variants={scaleIn}
                  href="https://api.whatsapp.com/send/?phone=923214277856&text=Hello%20Faiz%20Alam%20Faizi,%20I%20would%20like%20to%20connect."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-6 text-center font-bold text-slate-50 transition hover:border-[#d4af3740] hover:text-[#d4af37]"
                >
                  WhatsApp
                </motion.a>
              </motion.div>
            </div>

            <motion.div
              animate={{
                scale: [1, 1.08, 1],
                opacity: [0.12, 0.18, 0.12],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -bottom-[120px] right-[-120px] h-[260px] w-[260px] rounded-full bg-[#d4af3714] blur-md"
            />
          </motion.div>
        </div>
      </section>
    </main>
  );
}
