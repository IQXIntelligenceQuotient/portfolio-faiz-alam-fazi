import React from 'react';
import { motion } from 'framer-motion';
import FeaturedReviews from '../components/reviews/FeaturedReviews.jsx';
import {
  FacebookIcon, InstagramIcon, LinkedinIcon, MessageCircleMore,Quote
} from 'lucide-react';
import FAQSection from '../components/FAQLayout.jsx';
import SEOHead from '../components/seo/SEOHead.jsx';

const socials = [
  { label: 'WhatsApp', href: 'https://wa.me/923214277856', icon: MessageCircleMore },
  { label: 'Facebook', href: 'https://www.facebook.com/FaizAlamFaizi/', icon: FacebookIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/faiz-alam-faizi-950a1b270/', icon: LinkedinIcon },
  { label: 'Instagram', href: 'https://www.instagram.com/legalbridgellp/', icon: InstagramIcon },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Contact() {

  const professionalDisclaimer =
    "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

  const [formStatus, setFormStatus] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  setFormStatus('');
  setIsSubmitting(true);

  const form = e.target;
  const data = new FormData(form);

  const name = data.get('name')?.toString().trim() || '';
  const email = data.get('email')?.toString().trim() || '';
  const phone = data.get('phone')?.toString().trim() || '';
  const message = data.get('message')?.toString().trim() || '';
  const subject = phone
    ? `Contact from ${name} | Phone: ${phone}`
    : `Contact from ${name}`;

  if (!name || !email || !message) {
    setFormStatus('validation-error');
    setIsSubmitting(false);
    return;
  }

  try {
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    const res = await fetch(`${API_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        email,
        subject,
        message,
      }),
    });

    const result = await res.json().catch(() => null);

    if (res.ok && result?.success) {
      setFormStatus('sent');
      form.reset();
    } else {
      console.error('API error:', result);
      setFormStatus('server-error');
    }
  } catch (error) {
    console.error('Network error:', error);
    setFormStatus('server-error');
  } finally {
    setIsSubmitting(false);
  }
}
  const subtitle = "Contact Us";
const title = "Connect with Trusted Legal & Business Experts";
const description = "Whether you need legal assistance, strategic advice, or consultation, we’re here to help you move forward with confidence and clarity.";
  return (
    <div className="bg-[#161616]">
      <SEOHead
        title="Contact Legal Bridge LLP® | Corporate, Technology, IP & Cyber Law Practice"
        description="Contact Legal Bridge LLP® for corporate advisory, technology law, IP documentation, cyber law support, contracts, compliance, documentation workflow, and coordinated client-service support across Lahore, Punjab, and Pakistan."
        keywords="contact Legal Bridge LLP, corporate lawyer Lahore contact, technology lawyer Pakistan contact, IP lawyer Lahore contact, cyber law lawyer Lahore contact, legal services for software houses Lahore"
        canonical="/contact"
        ogImage="/1-Best-Legal_Consultant-near-me.webp"
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#111111] px-4 py-28 md:px-6 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#111111] to-[#0a0a0a]" aria-hidden="true" />
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" aria-hidden="true" />

        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-500">
            Contact Us
          </p>
          <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            Let's Talk About Your Case
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">
            If you need legal consultation, business strategy guidance, or professional assistance,
            feel free to reach out. Our experienced team is ready to listen carefully and provide clear direction.
          </p>
          <p className="mx-auto mt-6 max-w-3xl rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm leading-6 text-slate-400">
            {professionalDisclaimer}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+923214277856"
              className="rounded-full bg-amber-600 px-7 py-3 font-semibold text-white transition hover:bg-amber-500"
            >
              Call Now
            </a>
            <a
              href="mailto:info@faizalamfaizi.com"
              className="rounded-full border border-slate-700 px-7 py-3 font-semibold text-white transition hover:border-amber-600 hover:text-amber-500"
            >
              Send Email
            </a>
          </div>
        </div>
      </section>

      {/* Social links */}
      <div className="py-12 bg-[#111111]">
        <div className="mx-auto max-w-screen-lg text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-6">
            Follow Us
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {socials.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={`Follow us on ${social.label}`}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={index}
                  whileHover={{ y: -4, scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-all duration-300"
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </motion.a>
              );
            })}
          </div>
        </div>
      </div>
<div className=""><FeaturedReviews/></div>
      {/* Main contact content */}
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
                   <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <Quote size={14} className="text-[#D4AF37]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#1A2A4D]">
                  {subtitle}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#0g179a] md:text-4xl lg:text-5xl">
                {title}
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400 md:text-lg mb-18">
                {description}
              </p>
            </div>
        <div className="grid lg:grid-cols-2 gap-12">

          {/* Contact Form */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              Send Us a Message
            </h2>
            <form className="space-y-6" noValidate onSubmit={handleSubmit}>
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your full name"
                  required
                  aria-required="true"
                  className="w-full text-black rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Your email address"
                  required
                  aria-required="true"
                  className="w-full rounded-xl text-black border border-slate-300 px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>
              <div>
                <label htmlFor="contact-phone" className="block text-sm font-semibold text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+92..."
                  className="w-full text-black rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-700 mb-2">
                  Message <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Write your message here..."
                  required
                  aria-required="true"
                  className="w-full text-black rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition"
                />
              </div>
              {formStatus === 'validation-error' && (
  <p role="alert" className="text-red-600 text-sm font-medium">
    Please fill in all required fields.
  </p>
)}

{formStatus === 'server-error' && (
  <p role="alert" className="text-red-600 text-sm font-medium">
    Message could not be sent right now. Please try again later.
  </p>
)}

{formStatus === 'sent' && (
  <p role="status" className="text-green-600 text-sm font-medium">
    Message sent successfully. We'll get back to you shortly.
  </p>
)}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-950 text-white font-semibold py-3 rounded-xl transition hover:bg-amber-600 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm uppercase tracking-wider text-amber-600 font-semibold">Email</p>
                  <a href="mailto:info@faizalamfaizi.com" className="mt-1 text-lg font-medium text-slate-800 hover:text-amber-600 transition-colors">
                    info@faizalamfaizi.com
                  </a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-amber-600 font-semibold">Phone</p>
                  <a href="tel:+923214277856" className="mt-1 text-lg font-medium text-slate-800 hover:text-amber-600 transition-colors">
                    +92 321 4277 856
                  </a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-wider text-amber-600 font-semibold">Address</p>
                  <address className="mt-1 text-lg font-medium text-slate-800 leading-relaxed not-italic">
                    11-12 UGF, Central Plaza<br />
                    Barkat Market, Garden Town<br />
                    Lahore — Pakistan
                  </address>
                </div>
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <iframe
                title="Legal Bridge LLP office location - Garden Town, Lahore"
                src="https://maps.google.com/maps?q=Barkat%20Market%20Garden%20Town%20Lahore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="600"
                height="260"
                className="w-full h-[260px] border-0"
                loading="lazy"
                aria-label="Google Maps showing office location in Garden Town, Lahore"
              />
            </div>
          </div>
        </div>

        <FAQSection />
      </div>
    </div>
  );
}
