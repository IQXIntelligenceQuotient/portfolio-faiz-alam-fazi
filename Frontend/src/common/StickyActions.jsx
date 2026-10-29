import { useEffect, useState } from "react";
import { MessageCircle, ArrowUpRight, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StickyActions() {
  const [showTop, setShowTop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer sticky widget render until after page is interactive
    const t = setTimeout(() => setMounted(true), 1500);
    return () => clearTimeout(t);
  }, []); 

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 320);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-3">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="overflow-hidden rounded-[1.6rem] border border-[#D4AF37]/20 bg-[#111111]/95 shadow-[0_20px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl"
      >
        <motion.a
          href="https://wa.me/923214277856?text=Hello%20Faiz%20Alam%20Faizi,%20I%20need%20professional%20consultation."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Start WhatsApp consultation"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="group flex items-center gap-4 px-4 py-3.5 sm:px-5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-[#11111] ring-1 ring-[#D4AF37]/20 transition duration-300 group-hover:bg-[#25D366]/70 group-hover:text-black">
            <MessageCircle className="h-5 w-5" aria-hidden="true" />
          </div>

          <div className="hidden sm:block min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37]/70">
              WhatsApp
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              Start Consultation
            </p>
          </div>

          <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-[#25D366] text-[#11111] transition duration-300 group-hover:bg-[#25D366]/70 group-hover:text-black">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </div>
        </motion.a>
      </motion.div>

      <AnimatePresence>
        {showTop && (
          <motion.button
            key="scrollToTop"
            type="button"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            initial={{ opacity: 0, y: 18, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.96 }}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/20 bg-[#111111]/95 text-[#D4AF37] shadow-[0_14px_35px_rgba(0,0,0,0.24)] backdrop-blur-md transition duration-300 hover:bg-[#D4AF37] hover:text-black"
          >
            <ChevronUp className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

