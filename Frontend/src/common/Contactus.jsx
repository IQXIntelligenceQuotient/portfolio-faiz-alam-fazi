import React from 'react'
import { Link } from "react-router-dom";
import {
  Briefcase,
  Globe2,
  MapPin,
  ShieldCheck,
} from "lucide-react";

function Contact_us() {
    const professionalDisclaimer =
      "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

    const [formStatus, setFormStatus] = React.useState("");
      const [isSubmitting, setIsSubmitting] = React.useState(false);
      async function handleSubmit(e) {
    e.preventDefault();
    setFormStatus("");
    setIsSubmitting(true);

    const form = e.target;
    const data = new FormData(form);

    const name = data.get("name")?.toString().trim() || "";
    const email = data.get("email")?.toString().trim() || "";
    const phone = data.get("phone")?.toString().trim() || "";
    const message = data.get("message")?.toString().trim() || "";

    const subject = phone
      ? `Contact from ${name} | Phone: ${phone}`
      : `Contact from ${name}`;

    if (!name || !email || !message) {
      setFormStatus("validation-error");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("https://faizalamfaizi.com/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        setFormStatus("sent");
        form.reset();
      } else {
        console.error("API error:", result);
        setFormStatus("server-error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setFormStatus("server-error");
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <div>
       <section
      id="contact-us"
      aria-labelledby="contact-us-heading"
      className="scroll-mt-32"
    >
      <div className="rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-orange-400" />
          <p className="text-[11px] uppercase tracking-[0.18em] text-orange-400 font-semibold">
            Contact Us
          </p>
        </div>

        <h2
          id="contact-us-heading"
          className="text-2xl sm:text-3xl font-bold text-white mb-4"
        >
          Speak With Legal Bridge LLP®
        </h2>

        <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-3xl mb-8">
          If you need practical legal guidance, strategic drafting, or coordinated
          representation support, get in touch with our team. We assist clients in
          Lahore, across Pakistan, and in cross-border matters with clarity,
          confidentiality, and professionalism.
        </p>

        <p className="mb-8 max-w-3xl rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-xs leading-6 text-gray-400 sm:text-sm">
          {professionalDisclaimer}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side Info */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Office Address
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    12-UGF, Central Plaza, Garden Town, Lahore, Pakistan
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-start gap-3">
                <Globe2 className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Email & Website
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    legalbridgelhr@gmail.com
                    <br />
                    www.legalbridge.pk
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-white mb-1">
                    Call / WhatsApp
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    +92 321 4277856
                    <br />
                    UAE: +971 56 575 0052
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
              <h3 className="text-base font-semibold text-white mb-3">
                Quick Action
              </h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+923214277856"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-all duration-300"
                >
                  Call Now
                </a>

                <a
                  href="https://wa.me/923214277856"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:border-orange-500 hover:text-orange-400 transition-all duration-300"
                >
                  WhatsApp
                </a>

                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:border-orange-500 hover:text-orange-400 transition-all duration-300"
                >
                  Full Contact Page
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side Form */}
          <div className="rounded-2xl border border-white/10 bg-black/30 p-5 sm:p-6">
            <form className="space-y-4" noValidate onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  required
                  aria-required="true"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  required
                  aria-required="true"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-phone"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  autoComplete="tel"
                  placeholder="+92..."
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-white mb-2"
                >
                  Your Message <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="5"
                  placeholder="Write your legal query here..."
                  required
                  aria-required="true"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all resize-none"
                />
              </div>

              {formStatus === "validation-error" && (
                <p role="alert" className="text-red-400 text-sm font-medium">
                  Please fill in all required fields.
                </p>
              )}

              {formStatus === "server-error" && (
                <p role="alert" className="text-red-400 text-sm font-medium">
                  Message could not be sent right now. Please try again later.
                </p>
              )}

              {formStatus === "sent" && (
                <p role="status" className="text-green-400 text-sm font-medium">
                  Message sent successfully. We'll get back to you shortly.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition-all duration-300 shadow-[0_12px_30px_rgba(249,115,22,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
    </div>
  )
}

export default Contact_us
