import React, { useState } from "react";
import { motion } from "framer-motion";

const StarPicker = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className={`text-2xl transition ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ReviewPopupForm = ({ fetchReviews, setFilter, setPage, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    rating: 0,
  });

  const [submitting, setSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim() || form.rating === 0) return;

    setSubmitting(true);
    setFormStatus(null);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setFormStatus("success");
        setForm({ name: "", email: "", message: "", rating: 0 });

        if (fetchReviews) await fetchReviews();
        if (setFilter) setFilter(0);
        if (setPage) setPage(1);

        setTimeout(() => {
          if (onClose) onClose();
        }, 1200);
      } else {
        setFormStatus("error");
      }
    } catch {
      setFormStatus("error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#1A2A4D] text-xl font-bold"
        >
          ×
        </button>

        <h2 className="text-xl font-black text-[#1A2A4D] mb-1">Write a Review</h2>
        <p className="text-sm text-gray-500 mb-6">
          Share your experience with Legal Bridge LLP® client-service coordination.
        </p>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-[#1A2A4D] mb-1">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Full name"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-yellow-100 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A4D] mb-1">
              Your Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="your@email.com"
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-yellow-100 transition"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your email will not be displayed publicly
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A4D] mb-2">
              Rating <span className="text-red-500">*</span>
            </label>
            <StarPicker
              value={form.rating}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, rating: value }))
              }
            />
            {form.rating > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                {form.rating} / 5 stars selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A2A4D] mb-1">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.message}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="Write your experience..."
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-yellow-100 transition resize-none"
            />
          </div>

          {formStatus === "success" && (
            <p className="text-green-600 text-sm font-medium">
              ✓ Review submitted successfully. Thank you!
            </p>
          )}

          {formStatus === "error" && (
            <p className="text-red-600 text-sm font-medium">
              Something went wrong. Please try again.
            </p>
          )}

          <button
            type="submit"
            disabled={
              submitting ||
              !form.name.trim() ||
              !form.email.trim() ||
              !form.message.trim() ||
              form.rating === 0
            }
            className="bg-[#1A2A4D] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#D4AF37] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ReviewPopupForm;
