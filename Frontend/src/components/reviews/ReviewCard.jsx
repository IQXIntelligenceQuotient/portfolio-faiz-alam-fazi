import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ThumbsUp,
  CheckCircle2,
  X,
} from "lucide-react";
import StarRating from "./StarRating";

function formatDateTime(dateStr) {
  if (!dateStr) return "Recently";

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name = "") {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ReviewCard({ review, truncate = false }) {
  const {
    name = "Anonymous User",
    message = "",
    rating = 5,
    createdAt,
    helpful = 0,
  } = review || {};

  const [helpfulCount, setHelpfulCount] = useState(helpful);
  const [clicked, setClicked] = useState(false);
  const [showFullMessage, setShowFullMessage] = useState(false);

  const isLongMessage = useMemo(() => {
    return typeof message === "string" && message.trim().length > 50;
  }, [message]);

  const handleHelpfulClick = () => {
    if (clicked) return;
    setHelpfulCount((prev) => prev + 1);
    setClicked(true);

    // Optional backend update here
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="
          group h-full rounded-[24px] border border-[#e5e7eb] bg-white p-5
          transition-all duration-300 hover:border-[#d2d6db] hover:shadow-[0_4px_18px_rgba(15,23,42,0.06)]
        "
      >
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div
            className="
              flex h-11 w-11 shrink-0 items-center justify-center rounded-full
              bg-[#e8f0fe] text-sm font-semibold text-[#1967d2]
            "
          >
            {getInitials(name)}
          </div>

          <div className="min-w-0 flex-1">
            {/* Top Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-medium text-[#202124] sm:text-base">
                  {name}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <StarRating rating={rating} className="text-[#01875f]" />
                  <span className="text-xs text-[#5f6368]">
                    {formatDateTime(createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Verified */}
            <div className="mt-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#01875f]" />
              <span className="text-xs font-medium text-[#5f6368]">
                Verified review
              </span>
            </div>

            {/* Message */}
            <div className="mt-3 min-w-0 overflow-hidden">
              <p
                className={`
                  whitespace-pre-line break-words text-sm leading-6 text-[#202124]
                  ${truncate ? "line-clamp-2" : ""}
                `}
                title={message}
              >
                {message}
              </p>

              {truncate && isLongMessage && (
                <button
                  type="button"
                  onClick={() => setShowFullMessage(true)}
                  className="mt-2 text-sm font-medium text-[#01875f] transition hover:text-[#017154]"
                >
                  Read more
                </button>
              )}
            </div>

            {/* Helpful */}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-xs text-[#5f6368]">Was this helpful?</span>

              <button
                onClick={handleHelpfulClick}
                disabled={clicked}
                className={`
                  inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all
                  ${
                    clicked
                      ? "cursor-not-allowed border-[#dadce0] bg-[#f1f3f4] text-[#9aa0a6]"
                      : "border-[#dadce0] bg-white text-[#202124] hover:bg-[#f8f9fa]"
                  }
                `}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                {clicked ? "Helpful" : `Helpful `}
              </button>
            </div>
          </div>
        </div>
      </motion.article>

      {/* Full Message Modal */}
{/* Full Message Modal */}
<AnimatePresence>
  {showFullMessage && (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 px-3 py-3 backdrop-blur-[6px] sm:px-4 sm:py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setShowFullMessage(false)}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.24, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="
          relative w-full max-w-2xl overflow-hidden rounded-[20px] sm:rounded-[28px]
          border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]
          max-h-[92vh] sm:max-h-[88vh]
        "
      >
        {/* top accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#01875f] via-[#34a853] to-[#1967d2]" />

        {/* floating close button */}
        <button
          type="button"
          onClick={() => setShowFullMessage(false)}
          aria-label="Close full review"
          className="
            absolute right-3 top-3 z-20 inline-flex h-9 w-9 items-center justify-center
            rounded-full border border-[#e5e7eb] bg-white/95 text-[#5f6368]
            shadow-sm transition hover:bg-[#f8f9fa] hover:text-[#202124]
            sm:right-4 sm:top-4 sm:h-10 sm:w-10
          "
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="px-4 pb-4 pt-5 sm:px-7 sm:pb-6 sm:pt-7">
          {/* Header */}
          <div className="border-b border-[#e5e7eb] pb-4 pr-10 sm:pb-5 sm:pr-12">
            <div className="flex items-start gap-3 sm:gap-4">
              <div
                className="
                  flex h-11 w-11 shrink-0 items-center justify-center rounded-full
                  bg-gradient-to-br from-[#e8f0fe] to-[#dbeafe]
                  text-sm font-semibold text-[#1967d2]
                  ring-4 ring-[#f8fafc]
                  sm:h-14 sm:w-14 sm:text-base
                "
              >
                {getInitials(name)}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <h3 className="text-base font-semibold tracking-tight text-[#202124] break-words sm:text-xl">
                    {name}
                  </h3>

                  <span className="inline-flex w-fit items-center rounded-full bg-[#eaf6f1] px-2.5 py-1 text-[11px] font-medium text-[#01875f]">
                    Full Review
                  </span>
                </div>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-2">
                  <StarRating rating={rating} className="text-[#01875f]" />

                  <span className="text-xs text-[#5f6368] sm:text-sm">
                    {formatDateTime(createdAt)}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5f6368] sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#01875f]" />
                    Verified review
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="mt-4 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar sm:mt-5 sm:max-h-[52vh]">
            <div className="rounded-[16px] bg-[#f8f9fa] p-3 sm:rounded-[22px] sm:p-5">
              <p className="whitespace-pre-line break-words text-sm leading-6 text-[#202124] sm:text-[15px] sm:leading-8">
                {message}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex flex-col gap-4 border-t border-[#e5e7eb] pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-[#5f6368] sm:text-sm">
              Thank you for reading this client review.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <button
                type="button"
                onClick={() => setShowFullMessage(false)}
                className="
                  w-full rounded-full border border-[#dadce0] bg-white px-4 py-2.5
                  text-sm font-medium text-[#202124] transition hover:bg-[#f8f9fa]
                  sm:w-auto sm:px-5
                "
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleHelpfulClick}
                disabled={clicked}
                className={`
                  inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition sm:w-auto sm:px-5
                  ${
                    clicked
                      ? "cursor-not-allowed bg-[#f1f3f4] text-[#9aa0a6]"
                      : "bg-[#01875f] text-white hover:bg-[#017154]"
                  }
                `}
              >
                <ThumbsUp className="h-4 w-4" />
                {clicked ? "Marked helpful" : "Helpful"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </>
  );
}