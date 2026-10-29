import React, { useState } from "react";
import { motion } from "framer-motion";
import { faq } from "../Data/FAQ_servises.js";

function FAQSection({ faqKey, title, subtitle }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const faqItems = faq?.faqData?.[faqKey] || [];
  const panelPrefix = faqKey || "global";

  const toggleAccordion = (index) => {
    setActiveIndex((prev) => (prev === index ? -1 : index));
  };

  if (!faqItems.length) return null;

  return (
    <section className="bg-black py-20 lg:py-24" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-sm font-semibold text-orange-400">
            <span className="h-2 w-2 rounded-full bg-orange-500" aria-hidden="true" />
            {subtitle || "Frequently Asked Questions"}
          </div>
          <h2 className="mt-5 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            {title || "Questions people often ask"}
          </h2>
          <p className="mt-5 text-base leading-8 text-white/65 sm:text-lg">
            Find clear answers to common questions related to this service.
          </p>
        </motion.div>

        <div className="mx-auto mt-14 max-w-5xl space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = activeIndex === index;
            const panelId = `faq-panel-${panelPrefix}-${index}`;
            const btnId = `faq-btn-${panelPrefix}-${index}`;
            return (
              <div
                key={index}
                className={`overflow-hidden rounded-[22px] border transition-colors duration-300 ${
                  isOpen
                    ? "border-orange-500/40 bg-orange-500/[0.07] shadow-[0_12px_40px_rgba(249,115,22,0.10)]"
                    : "border-white/10 bg-white/[0.03] hover:border-orange-500/25"
                }`}
              >
                <button
                  id={btnId}
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                >
                  <span className="text-lg font-semibold leading-7 text-white sm:text-xl">
                    {item.question}
                  </span>
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/25 bg-orange-500/10 text-xl text-orange-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden="true"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  aria-hidden={!isOpen}
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}
                >
                  <div className="px-6 pb-6">
                    <p className="text-sm leading-7 text-white/70 sm:text-base">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FAQSection;
