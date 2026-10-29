import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Facebook,
  Instagram,
  Linkedin,
  MessageCircleMore,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";


const footerLinks = {
  pages: [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blogs' },
    { label: 'Contact', path: '/contact' },
  ],
  services: [
     { label: 'Legal Consultant', path: '/Legal_Consultant' },
      { label: 'Courtroom Representation', path: '/Courtroom_Representation' },
      { label: 'Business Consultant', path: '/Business_Consultant' },
      { label: 'Company Formation', path: '/company_formation' },
      { label: 'VAT and Tax Services', path: '/vat_and_tax' },
      { label: 'Accountancy Services', path: '/accountancy' },
      { label: 'Trademark, Copyright, Patent', path: '/intellectual_property' },
      { label: 'Insurance Consultant', path: '/insurance_consultancy' },
  ],
};

const socials = [
  { label: "WhatsApp", href: "https://wa.me/923214277856", icon: MessageCircleMore },
  { label: "Facebook", href: "https://www.facebook.com/FaizAlamFaizi/", icon: Facebook },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/faiz-alam-faizi-950a1b270/", icon: Linkedin },
  { label: "Instagram", href: "https://www.instagram.com/legalbridgellp/", icon: Instagram },
];

export default function Footer() {
  const [subEmail, setSubEmail] = useState("");
  const [subStatus, setSubStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [subMessage, setSubMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subEmail.trim()) return;
    try {
      setSubStatus("loading");
      const res = await fetch(`${API_BASE_URL}/api/subscribers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subEmail.trim() }),
      });

      // Guard against HTML error pages (e.g. 404 before route is deployed)
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`Server error (${res.status}). Please try again later.`);
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Subscription failed.");
      setSubStatus("success");
      setSubMessage(data.message || "You're subscribed!");
      setSubEmail("");
    } catch (err) {
      setSubStatus("error");
      setSubMessage(err.message || "Something went wrong. Please try again.");
    }
  };
  return (
    <footer className="relative overflow-hidden bg-[#111111] text-white border-t border-white/10">
      {/* Background decorative gradient only — no broken image reference */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/85 to-[#0d0d0d]" />

      {/* Glow accents */}
      <div className="absolute -top-20 left-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10 lg:gap-12">
            {/* Brand */}
            <div className="space-y-6">
              <Link to="/" className="inline-block">
                <img
                  src="/faiz-alam-faizi-logo1.webp"
                  alt="Faiz Alam Faizi, Corporate, Technology, IP & Cyber Law Practice"
                  className="h-14 sm:h-20 w-auto object-contain"
                  width="160"
                  height="64"
                  loading="lazy"
                />
              </Link>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-sm">
                Corporate, technology, IP and cyber law practice support for
                Lahore, Punjab, Pakistan-wide and cross-border business clients.
              </p>

              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 text-orange-500 flex-shrink-0" />
                  <span>Garden Town, Lahore, Pakistan</span>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <a
                    href="tel:+923214277856"
                    className="hover:text-orange-400 transition-colors"
                  >
                    +92 321 427 7856
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <a
                    href="mailto:info@faizalamfaizi.com"
                    className="hover:text-orange-400 transition-colors break-all"
                  >
                    info@faizalamfaizi.com
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-3">
                {footerLinks.pages.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="group inline-flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-all duration-300"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500/70 group-hover:scale-125 transition-transform" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-xl font-bold mb-6 text-white">Services</h3>
              <ul className="space-y-3">
                {footerLinks.services.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.path}
                      className="group inline-flex items-start gap-2 text-gray-300 hover:text-orange-400 transition-all duration-300"
                    >
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-orange-500/70 group-hover:scale-125 transition-transform flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4 text-white">
                  Subscribe Newsletter
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  We only send updates that are useful, relevant, and worth your
                  attention.
                </p>
              </div>

              <form
                onSubmit={handleSubscribe}
                className="space-y-4"
              >
                <div className="relative">
                  <label htmlFor="footer-email" className="sr-only">Email address</label>
                  <input
                    id="footer-email"
                    type="email"
                    value={subEmail}
                    onChange={(e) => { setSubEmail(e.target.value); setSubStatus(null); }}
                    placeholder="Email address"
                    autoComplete="email"
                    required
                    disabled={subStatus === "loading"}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all disabled:opacity-60"
                  />
                </div>

                {subStatus === "success" && (
                  <p className="rounded-xl bg-emerald-500/10 border border-emerald-400/30 px-4 py-2.5 text-sm font-semibold text-emerald-300">
                    ✓ {subMessage}
                  </p>
                )}
                {subStatus === "error" && (
                  <p className="rounded-xl bg-red-500/10 border border-red-400/30 px-4 py-2.5 text-sm font-semibold text-red-300">
                    {subMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={subStatus === "loading"}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.25)] hover:bg-orange-600 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {subStatus === "loading" ? "Subscribing..." : "Subscribe"}
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>

              {/* Socials */}
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-4">
                  Follow Us
                </h4>

                <div className="flex flex-wrap gap-3">
                  {socials.map((social) => {
                    const Icon = social.icon;

                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        aria-label={`Follow us on ${social.label}`}
                        className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 hover:border-orange-500 hover:bg-orange-500 hover:text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)] transition-all duration-300"
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-gray-400 text-center lg:text-left">
              <p>
                Copyright © {new Date().getFullYear()} faizalamfaizi.com. All rights reserved.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                <a
                  href="mailto:info@faizalamfaizi.com"
                  className="hover:text-orange-400 transition-colors"
                >
                  info@faizalamfaizi.com
                </a>
                <a
                  href="tel:+923214277856"
                  className="hover:text-orange-400 transition-colors"
                >
                  +92 321 4277 856
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
