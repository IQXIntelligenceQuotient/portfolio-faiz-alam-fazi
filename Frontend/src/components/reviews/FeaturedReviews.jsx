import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ArrowRight, ShieldCheck } from "lucide-react";
import ReviewCard from "./ReviewCard";
import ReviewPopupForm from "./ReviewForm";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

function RatingStars({ value = 0, size = 18 }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(Number(value))
              ? "fill-[#D4AF37] text-[#D4AF37]"
              : "text-slate-300"
          }
        />
      ))}
    </div>
  );
}

export default function FeaturedReviews({
  limit = 6,
  title = "What Clients Say About Us",
  subtitle = "Client Testimonials",
  description = "Real feedback from clients who trusted our professional guidance, legal support, and committed service.",
  compact = false,
  showHeaderCta = true,
  showBottomCta = false,
  className = "",
}) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [limit]);

  async function fetchReviews() {
    try {
      setLoading(true);

      const API_URL = import.meta.env.VITE_REVIEWS_API
        ? import.meta.env.VITE_REVIEWS_API.replace('/admin/all', '')
        : `${import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.faizalamfaizi.com" : "http://localhost:5000")}/api/review`;
      const res = await fetch(`${API_URL}`);
      const data = await res.json();

      // Extract reviews from response
      const reviewsData = data.data || data.reviews || data || [];
      const all = Array.isArray(reviewsData) ? reviewsData : [];
      setReviews(all.slice(0, limit));

      const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

      all.forEach((r) => {
        const rating = Math.round(Number(r?.rating || 0));
        if (rating >= 1 && rating <= 5) stats[rating]++;
      });

      setRatingStats(stats);
    } catch (error) {
      console.error("Review fetch failed:", error);
      setReviews([]);
      setRatingStats({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
    } finally {
      setLoading(false);
    }
  }

  const totalRatings = useMemo(() => {
    return Object.values(ratingStats).reduce((a, b) => a + b, 0);
  }, [ratingStats]);

  const averageRating = useMemo(() => {
    if (!totalRatings) return 0;
    const totalScore = Object.entries(ratingStats).reduce(
      (acc, [star, count]) => acc + Number(star) * count,
      0
    );
    return (totalScore / totalRatings).toFixed(1);
  }, [ratingStats, totalRatings]);

  if (loading) {
    return (
      <section className={`relative overflow-hidden bg-[#f8f6f0] py-20 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="animate-pulse space-y-8">
            <div className="max-w-2xl space-y-4">
              <div className="h-3 w-32 rounded bg-slate-200" />
              <div className="h-10 w-80 rounded bg-slate-200" />
              <div className="h-4 w-full max-w-2xl rounded bg-slate-100" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-4 rounded-[30px] border border-white/60 bg-white/80 p-8 shadow-sm">
                <div className="mb-4 h-5 w-32 rounded bg-slate-200" />
                <div className="mb-4 h-14 w-24 rounded bg-slate-200" />
                <div className="mb-6 h-4 w-40 rounded bg-slate-100" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-3 w-full rounded bg-slate-100" />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:col-span-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-[30px] border border-white/60 bg-white/80 p-6 shadow-sm"
                  >
                    <div className="mb-3 h-4 w-28 rounded bg-slate-200" />
                    <div className="mb-4 h-3 w-20 rounded bg-slate-100" />
                    <div className="space-y-2">
                      <div className="h-3 w-full rounded bg-slate-100" />
                      <div className="h-3 w-11/12 rounded bg-slate-100" />
                      <div className="h-3 w-8/12 rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!reviews.length) return null;

  return (
    <section
      className={`relative overflow-hidden bg-gradient-to-b from-[#fcfbf8] via-white to-[#f8f6f0] py-20 md:py-24 ${className}`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-80px] top-12 h-64 w-64 rounded-full bg-[#1A2A4D]/5 blur-3xl" />
        <div className="absolute right-[-60px] top-0 h-72 w-72 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute bottom-[-40px] left-1/3 h-56 w-56 rounded-full bg-[#0f172a]/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.45 }}
          className="mb-12 md:mb-14"
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
                <Quote size={14} className="text-[#D4AF37]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#1A2A4D]">
                  {subtitle}
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-[#0f172a] md:text-4xl lg:text-5xl">
                {title}
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
                {description}
              </p>
            </div>

            {showHeaderCta ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setShowPopup(true)}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-white px-5 py-3 text-sm font-semibold text-[#1A2A4D] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                >
                  Write a Review
                </button>

                <Link
                  to="/reviews"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D4AF37] hover:text-[#1A2A4D]"
                >
                  See All Reviews
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : null}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="lg:col-span-4"
          >
            <div className="relative h-full overflow-hidden rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-8">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#0f172a] via-[#1A2A4D] to-[#D4AF37]" />

              <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-500">
                <ShieldCheck size={16} className="text-[#D4AF37]" />
                Trusted Rating Summary
              </div>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-5xl font-black leading-none text-[#0f172a] md:text-6xl">
                  {averageRating}
                </span>
                <span className="pb-1 text-lg font-semibold text-slate-400">/5</span>
              </div>

              <div className="mt-4">
                <RatingStars value={averageRating} size={18} />
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Based on{" "}
                <span className="font-bold text-[#0f172a]">{totalRatings}</span>{" "}
                client reviews collected from real interactions and submitted through the review system.
              </p>

              <div className="mt-8 space-y-4">

                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingStats[star];
                  const percent = totalRatings ? (count / totalRatings) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-9 text-sm font-semibold text-[#1A2A4D]">
                        {star}★
                      </span>

                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-[#D4AF37] to-[#b98b13]"
                        />
                      </div>

                      <span className="w-8 text-right text-sm text-slate-500">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl border border-[#D4AF37]/15 bg-[#fbf8ef] p-4">
                <p className="text-sm leading-6 text-slate-600">
                  Strong testimonials increase trust fast, especially when they appear near inquiry forms, consultation sections, or service highlights.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="lg:col-span-8"
          >

<div
  className={
    compact
      ? "grid grid-cols-1 gap-5 md:grid-cols-2"
      : "grid grid-cols-1 gap-6 xl:grid-cols-2"
  }
>
  {reviews.map((review) => {
    // Example logic: mark review as NEW if within 3 days
    const isNew =
      review?.createdAt &&
      new Date(review.createdAt) >
        new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    return (
      <motion.div
        key={review._id}
        variants={itemVariants}
        className="relative h-full"
      >
        {/* Badge inside card (top-right corner) */}
        {isNew && (
          <span className="absolute right-4 top-4 z-10">
            <span className="relative inline-flex items-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#01875f]/30"></span>

              <span className="relative inline-flex items-center rounded-full bg-[#01875f] px-3 py-1 text-[10px] font-medium text-white shadow-sm">
                New
              </span>
            </span>
          </span>
        )}

        {/* Card */}
        <ReviewCard review={review} truncate={!compact} />
      </motion.div>
    );
  })}
</div>


            {showBottomCta ? (
              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-col gap-3 sm:flex-row"
              >
                <button
                  onClick={() => setShowPopup(true)}
                  className="inline-flex items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-white px-5 py-3 text-sm font-semibold text-[#1A2A4D] transition-all duration-300 hover:bg-[#D4AF37] hover:text-white"
                >
                  Write a Review
                </button>

                <Link
                  to="/reviews"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#1A2A4D]"
                >
                  Explore All Reviews
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        <AnimatePresence>
          {showPopup && (
            <ReviewPopupForm
              fetchReviews={fetchReviews}
              setFilter={() => { }}
              setPage={() => { }}
              onClose={() => setShowPopup(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}