import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  MessageSquareText,
  Filter,
  ChevronLeft,
  ChevronRight,
  PencilLine,
} from "lucide-react";
import ReviewCard from "../components/reviews/ReviewCard";
import SEOHead from "../components/seo/SEOHead";

const REVIEWS_PER_PAGE = 9;

const FILTERS = [
  { label: "All", value: 0 },
  { label: "5★", value: 5 },
  { label: "4★", value: 4 },
  { label: "3★", value: 3 },
  { label: "2★", value: 2 },
  { label: "1★", value: 1 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

const staggerWrap = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

function RatingStars({ value = 0, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(Number(value))
              ? "fill-[#01875f] text-[#01875f]"
              : "fill-[#d7dce1] text-[#d7dce1]"
          }
        />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Select star rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = star <= (hovered || value);

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${star} star`}
            className="rounded-full p-1 transition-transform duration-200 hover:scale-105 focus:outline-none"
          >
            <svg
              className="h-8 w-8"
              fill={active ? "#01875f" : "#E5E7EB"}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function SummaryMiniCard({ label, value, icon }) {
  return (
    <div className="rounded-[22px] border border-[#e8eaed] bg-white p-4">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eaf6f1] text-[#01875f]">
        {icon}
      </div>
      <p className="text-2xl font-semibold tracking-tight text-[#202124]">{value}</p>
      <p className="mt-1 text-sm text-[#5f6368]">{label}</p>
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(0);
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({ name: "", email: "", message: "", rating: 0 });
  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  async function fetchReviews() {
    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.faizalamfaizi.com" : "http://localhost:5000");
      const res = await fetch(`${API_URL}/api/review`);
      const data = await res.json();
      
      // Extract reviews from response
      const reviewsData = data.data || data.reviews || data || [];
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);
    } catch {
      setReviews([]);
    }
  }

  useEffect(() => {
    fetchReviews().finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim() || form.rating === 0) return;

    setSubmitting(true);
    setFormStatus(null);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.faizalamfaizi.com" : "http://localhost:5000");
      const res = await fetch(`${API_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setFormStatus("success");
        setForm({ name: "", email: "", message: "", rating: 0 });
        await fetchReviews();
        setFilter(0);
        setPage(1);
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  const ratingStats = useMemo(() => {
    const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((r) => {
      const rating = Math.round(Number(r?.rating || 0));
      if (rating >= 1 && rating <= 5) stats[rating]++;
    });

    return stats;
  }, [reviews]);

  const totalRatings = useMemo(() => {
    return Object.values(ratingStats).reduce((a, b) => a + b, 0);
  }, [ratingStats]);

  const averageRating = useMemo(() => {
    if (!totalRatings) return "0.0";

    const totalScore = Object.entries(ratingStats).reduce(
      (acc, [star, count]) => acc + Number(star) * count,
      0
    );

    return (totalScore / totalRatings).toFixed(1);
  }, [ratingStats, totalRatings]);

  const filtered = useMemo(() => {
    return filter === 0
      ? reviews
      : reviews.filter((r) => Math.round(Number(r.rating)) === filter);
  }, [reviews, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / REVIEWS_PER_PAGE));

  const paginated = useMemo(() => {
    const start = (page - 1) * REVIEWS_PER_PAGE;
    return filtered.slice(start, start + REVIEWS_PER_PAGE);
  }, [filtered, page]);

  function handleFilter(val) {
    setFilter(val);
    setPage(1);
  }

  function goToPage(nextPage) {
    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <SEOHead
        title="Client Reviews | Legal Bridge LLP® Corporate, Technology, IP & Cyber Law Practice"
        description="Read client feedback on Legal Bridge LLP® corporate advisory, technology law, IP documentation, cyber law support, documentation workflow, and coordinated legal-service support."
        canonical="/reviews"
      />

      {/* Header */}
      <section className="border-b border-[#e8eaed] bg-white px-4 py-30 md:py-14">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end"
          >
            <div className="lg:col-span-7 mt-15">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf6f1] px-3 py-1.5 text-sm font-medium text-[#01875f]">
                <MessageSquareText size={16} />
                Verified user feedback
              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#202124] md:text-5xl">
                Ratings and reviews
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#5f6368] md:text-base">
                Explore real reviews shared by clients. See rating trends, browse by star level, and add your own feedback through the review form.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <SummaryMiniCard
                label="Average rating"
                value={`${averageRating}`}
                icon={<Star size={18} />}
              />
              <SummaryMiniCard
                label="Total reviews"
                value={totalRatings}
                icon={<MessageSquareText size={18} />}
              />
              <SummaryMiniCard
                label="Filter options"
                value={FILTERS.length - 1}
                icon={<Filter size={18} />}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[300px,1fr]">
          {/* Left column */}
          <div className="space-y-6">
            {/* Rating summary */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-[28px] border border-[#e8eaed] bg-[#f8f9fa] p-6"
            >
              <p className="text-sm font-medium text-[#5f6368]">Overall rating</p>

              <div className="mt-4 flex items-end gap-2">
                <span className="text-6xl font-semibold leading-none text-[#202124]">
                  {averageRating}
                </span>
                <span className="pb-2 text-base font-medium text-[#5f6368]">/ 5</span>
              </div>

              <div className="mt-3">
                <RatingStars value={averageRating} size={18} />
              </div>

              <p className="mt-3 text-sm text-[#5f6368]">
                Based on {totalRatings} submitted reviews
              </p>

              <div className="mt-6 space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingStats[star];
                  const percent = totalRatings ? (count / totalRatings) * 100 : 0;

                  return (
                    <div key={star} className="flex items-center gap-3">
                      <span className="w-5 text-sm font-medium text-[#202124]">
                        {star}
                      </span>

                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#e0e3e7]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full rounded-full bg-[#01875f]"
                        />
                      </div>

                      <span className="w-8 text-right text-sm text-[#5f6368]">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Write review */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="rounded-[28px] border border-[#e8eaed] bg-white p-6"
            >
              <div className="mb-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#eaf6f1] px-3 py-1.5 text-xs font-medium text-[#01875f]">
                  <PencilLine size={14} />
                  Share your review
                </div>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#202124]">
                  Write a review
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#5f6368]">
                  Your feedback helps others understand the quality of service and experience.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#202124]">
                    Your name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Full name"
                    required
                    className="w-full rounded-2xl border border-[#dadce0] bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#01875f] focus:ring-4 focus:ring-[#01875f]/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#202124]">
                    Your email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    required
                    className="w-full rounded-2xl border border-[#dadce0] bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#01875f] focus:ring-4 focus:ring-[#01875f]/10"
                  />
                  <p className="mt-1.5 text-xs text-[#5f6368]">
                    Your email will not be displayed publicly
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-[#202124]">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <StarPicker
                    value={form.rating}
                    onChange={(v) => setForm((p) => ({ ...p, rating: v }))}
                  />
                  {form.rating > 0 && (
                    <p className="mt-2 text-xs text-[#5f6368]">
                      {form.rating} out of 5 selected
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#202124]">
                    Your review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                    placeholder="Write your experience..."
                    required
                    className="w-full resize-none rounded-2xl border border-[#dadce0] bg-white px-4 py-3 text-sm text-[#202124] outline-none transition focus:border-[#01875f] focus:ring-4 focus:ring-[#01875f]/10"
                  />
                </div>

                <AnimatePresence mode="wait">
                  {formStatus === "success" && (
                    <motion.p
                      key="success"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl bg-[#eaf6f1] px-4 py-3 text-sm font-medium text-[#01875f]"
                    >
                      Review submitted successfully. Thank you.
                    </motion.p>
                  )}

                  {formStatus === "error" && (
                    <motion.p
                      key="error"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                    >
                      Something went wrong. Please try again.
                    </motion.p>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !form.name.trim() ||
                    !form.email.trim() ||
                    !form.message.trim() ||
                    form.rating === 0
                  }
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#01875f] px-6 py-3.5 text-sm font-medium text-white transition hover:bg-[#017154] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit review"}
                </button>
              </form>
            </motion.div>
          </div>

          {/* Right column */}
          <div>
            {/* Filters */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.15 }}
              className="mb-6 rounded-[24px] border border-[#e8eaed] bg-white p-4"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-medium text-[#202124]">Filter reviews</p>
                  <p className="mt-1 text-sm text-[#5f6368]">
                    Browse feedback by star rating
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {FILTERS.map(({ label, value }) => {
                    const active = filter === value;

                    return (
                      <button
                        key={value}
                        onClick={() => handleFilter(value)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          active
                            ? "bg-[#01875f] text-white"
                            : "border border-[#dadce0] bg-white text-[#202124] hover:bg-[#f8f9fa]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>

            {/* Loading */}
            {loading && (
              <div className="flex justify-center py-24">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#01875f] border-t-transparent" />
              </div>
            )}

            {/* Empty */}
            {!loading && !filtered.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-[24px] border border-dashed border-[#dadce0] bg-[#f8f9fa] px-6 py-20 text-center"
              >
                <p className="text-lg font-medium text-[#202124]">
                  No reviews found for this rating.
                </p>
                <p className="mt-2 text-sm text-[#5f6368]">
                  Try another filter or be the first to submit a review.
                </p>
              </motion.div>
            )}

            {/* Grid */}
            {!loading && filtered.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${filter}-${page}`}
                    variants={staggerWrap}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    className="grid gap-4 grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3"
                  >
                    {paginated.map((review, index) => (
                      <motion.div
                        key={review?._id || index}
                        variants={fadeUp}
                        className="h-full"
                      >
                        <ReviewCard review={review} truncate />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>

                {totalPages > 1 && (
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dadce0] bg-white text-[#202124] transition hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        className={`h-10 min-w-[40px] rounded-full px-3 text-sm font-medium transition ${
                          p === page
                            ? "bg-[#01875f] text-white"
                            : "border border-[#dadce0] bg-white text-[#202124] hover:bg-[#f8f9fa]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => goToPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dadce0] bg-white text-[#202124] transition hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
