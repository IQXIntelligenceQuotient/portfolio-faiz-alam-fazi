import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const REVIEWS_ADMIN_API =
  import.meta.env.VITE_REVIEWS_ADMIN_API ||
  `${API_BASE_URL}/api/review/admin/all`;

const REVIEWS_API =
  import.meta.env.VITE_REVIEWS_API || `${API_BASE_URL}/api/review`;

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [viewReview, setViewReview] = useState(null);
  const [editReview, setEditReview] = useState(null);

  // Communication modal state
  const [commReview, setCommReview] = useState(null);
  const [commTemplate, setCommTemplate] = useState("review_approved");
  const [commCustomMessage, setCommCustomMessage] = useState("");
  const [commSending, setCommSending] = useState(false);
  const [commError, setCommError] = useState("");

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    message: "",
    rating: 5,
    is_approved: false,
  });

  const token = localStorage.getItem("adminToken");

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const response = await fetch(REVIEWS_ADMIN_API, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch reviews.");
      }

      if (Array.isArray(data.data)) {
        setReviews(data.data);
      } else if (Array.isArray(data)) {
        setReviews(data);
      } else if (Array.isArray(data.reviews)) {
        setReviews(data.reviews);
      } else {
        setReviews([]);
      }
    } catch (error) {
      alert(error.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const value = search.toLowerCase();

      const matchesSearch =
        review.name?.toLowerCase().includes(value) ||
        review.email?.toLowerCase().includes(value) ||
        review.message?.toLowerCase().includes(value);

      const matchesApproval =
        approvalFilter === "all"
          ? true
          : approvalFilter === "approved"
          ? review.is_approved === true
          : review.is_approved === false;

      const matchesRating =
        ratingFilter === "all"
          ? true
          : Number(review.rating) === Number(ratingFilter);

      return matchesSearch && matchesApproval && matchesRating;
    });
  }, [reviews, search, approvalFilter, ratingFilter]);

  const approvedCount = reviews.filter((review) => review.is_approved).length;
  const pendingCount = reviews.filter((review) => !review.is_approved).length;

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleString();
  };

  const renderStars = (rating) => {
    const total = Number(rating) || 0;
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < total ? "text-[#d4af37]" : "text-slate-600"}>
        ★
      </span>
    ));
  };

  const openEditModal = (review) => {
    setEditReview(review);
    setEditForm({
      name: review.name || "",
      email: review.email || "",
      message: review.message || "",
      rating: review.rating || 5,
      is_approved: !!review.is_approved,
    });
  };

  const closeEditModal = () => {
    setEditReview(null);
    setEditForm({ name: "", email: "", message: "", rating: 5, is_approved: false });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editReview?.id) { alert("Review ID is missing."); return; }
    if (!editForm.name.trim()) { alert("Name is required."); return; }
    if (!editForm.email.trim()) { alert("Email is required."); return; }
    if (!editForm.message.trim()) { alert("Message is required."); return; }

    try {
      setUpdatingId(editReview.id);
      const response = await fetch(`${REVIEWS_API}/${editReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          email: editForm.email.trim(),
          message: editForm.message.trim(),
          rating: Number(editForm.rating),
          is_approved: Boolean(editForm.is_approved),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Review update failed.");
      alert("Review updated successfully.");
      closeEditModal();
      fetchReviews();
    } catch (error) {
      alert(error.message || "Something went wrong while updating review.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprovalToggle = async (review) => {
    try {
      setUpdatingId(review.id);
      const response = await fetch(`${REVIEWS_API}/${review.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: review.name,
          email: review.email,
          message: review.message,
          rating: Number(review.rating),
          is_approved: !review.is_approved,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Approval update failed.");
      setReviews((prev) =>
        prev.map((item) =>
          item.id === review.id ? { ...item, is_approved: !review.is_approved } : item
        )
      );
    } catch (error) {
      alert(error.message || "Something went wrong while updating approval.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review? This action cannot be undone.")) return;
    try {
      setDeletingId(reviewId);
      const response = await fetch(`${REVIEWS_API}/${reviewId}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Review delete failed.");
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      alert("Review deleted successfully.");
    } catch (error) {
      alert(error.message || "Something went wrong while deleting review.");
    } finally {
      setDeletingId(null);
    }
  };

  const closeCommModal = () => {
    setCommReview(null);
    setCommTemplate("review_approved");
    setCommCustomMessage("");
    setCommSending(false);
    setCommError("");
  };

  const handleSendCommunication = async (e) => {
    e.preventDefault();
    if (!commReview?.id) return;
    try {
      setCommSending(true);
      setCommError("");
      const response = await fetch(`${REVIEWS_API}/${commReview.id}/communication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          messageTemplate: commTemplate,
          customMessage: commCustomMessage,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to send message.");
      closeCommModal();
      fetchReviews();
      alert("Message sent successfully.");
    } catch (error) {
      setCommError(error.message || "Something went wrong while sending message.");
    } finally {
      setCommSending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-[28px] border border-[#d4af37]/20 bg-gradient-to-br from-[#111827] to-[#070a12] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">Admin Panel</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">Manage Reviews</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Review client feedback, approve public testimonials, edit review details, and remove inappropriate submissions.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-0">
              <StatCard label="Total" value={reviews.length} />
              <StatCard label="Approved" value={approvedCount} />
              <StatCard label="Pending" value={pendingCount} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid gap-4 rounded-[24px] border border-white/10 bg-[#080b13]/95 p-5 shadow-2xl md:grid-cols-[1fr_auto_auto]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or message..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
          />
          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full min-w-[160px] rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
          >
            <option value="all">All Reviews</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full min-w-[140px] rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        {/* Table */}
        <section className="rounded-[28px] border border-white/10 bg-[#080b13]/95 shadow-2xl">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">#</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Client</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Rating</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Message</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Status</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Comm. Status</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Last Message</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Created</th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-5 py-12 text-center text-slate-400">Loading reviews...</td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-5 py-12 text-center text-slate-400">No reviews found.</td>
                  </tr>
                ) : (
                  filteredReviews.map((review, idx) => (
                    <tr key={review.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                      <td className="px-5 py-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <h3 className="text-sm font-bold text-white">{review.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">{review.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex text-sm">{renderStars(review.rating)}</div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 max-w-[280px] text-sm leading-6 text-slate-300">{review.message}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${review.is_approved ? "bg-emerald-500/10 text-emerald-300" : "bg-yellow-500/10 text-yellow-300"}`}>
                          {review.is_approved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {review.communication_status === "email_sent" && (
                          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[12px] font-bold text-emerald-300">Sent</span>
                        )}
                        {review.communication_status === "email_failed" && (
                          <span className="rounded-full bg-red-500/10 px-3 py-1 text-[12px] font-bold text-red-300">Failed</span>
                        )}
                        {review.communication_status === "email_pending" && (
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-[12px] font-bold text-yellow-300">Pending</span>
                        )}
                        {!review.communication_status && (
                          <span className="rounded-full bg-slate-500/10 px-3 py-1 text-[12px] font-bold text-slate-400">Not-Sent</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-400">{review.last_message_type || "—"}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{formatDate(review.created_at)}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button type="button" onClick={() => setViewReview(review)}
                            title="View review"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">View</span>
                          </button>
                          {/* Edit */}
                          <button type="button" onClick={() => openEditModal(review)}
                            title="Edit review"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Edit</span>
                          </button>
                          {/* Approve/Unapprove */}
                          <button type="button" onClick={() => handleApprovalToggle(review)} disabled={updatingId === review.id}
                            title={review.is_approved ? "Unapprove" : "Approve"}
                            className={`group relative flex h-8 w-8 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${review.is_approved ? "border border-yellow-400/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500 hover:text-black" : "border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500 hover:text-black"}`}>
                            {review.is_approved
                              ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                              : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            }
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">{review.is_approved ? "Unapprove" : "Approve"}</span>
                          </button>
                          {/* Send Message */}
                          <button type="button"
                            onClick={() => { setCommReview(review); setCommTemplate("review_approved"); setCommCustomMessage(""); setCommError(""); }}
                            disabled={!review.is_approved}
                            title={!review.is_approved ? "Approve review first to send message" : "Send message"}
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black disabled:cursor-not-allowed disabled:opacity-40">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Send Message</span>
                          </button>
                          {/* Delete */}
                          <button type="button" onClick={() => handleDeleteReview(review.id)} disabled={deletingId === review.id}
                            title="Delete review"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </section>
      </div>

      {/* View Modal */}
      {viewReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Review Details</p>
                <h2 className="mt-2 text-2xl font-black text-white">{viewReview.name}</h2>
              </div>
              <button type="button" onClick={() => setViewReview(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]">×</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <InfoBox label="Email" value={viewReview.email} />
              <InfoBox label="Rating" value={`${viewReview.rating} / 5`} />
              <InfoBox label="Status" value={viewReview.is_approved ? "Approved" : "Pending"} />
              <InfoBox label="Created At" value={formatDate(viewReview.created_at)} />
            </div>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-2 text-sm font-bold text-[#d4af37]">Message</h3>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{viewReview.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Edit Review</p>
                <h2 className="mt-2 text-2xl font-black text-white">Update Client Review</h2>
              </div>
              <button type="button" onClick={closeEditModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]">×</button>
            </div>
            <form onSubmit={handleUpdateReview} className="space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <FormInput label="Name" name="name" value={editForm.name} onChange={handleEditChange} required />
                <FormInput label="Email" name="email" type="email" value={editForm.email} onChange={handleEditChange} required />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Rating</label>
                <select name="rating" value={editForm.rating} onChange={handleEditChange}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20">
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">Message</label>
                <textarea name="message" value={editForm.message} onChange={handleEditChange} rows="5" required
                  className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20" />
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200">
                <input type="checkbox" name="is_approved" checked={editForm.is_approved} onChange={handleEditChange} className="h-4 w-4 accent-[#d4af37]" />
                Approved for public display
              </label>
              <button type="submit" disabled={updatingId === editReview.id}
                className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                {updatingId === editReview.id ? "Updating..." : "Update Review"}
              </button>
              <button type="button" onClick={closeEditModal}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Communication Modal */}
      {commReview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Send Communication</p>
                <h2 className="mt-2 text-2xl font-black text-white">Message {commReview.name}</h2>
              </div>
              <button type="button" onClick={closeCommModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]">×</button>
            </div>
            <form onSubmit={handleSendCommunication} className="space-y-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-200">Message Template</p>
                {[
                  { value: "review_approved", label: "Review Approved" },
                  { value: "thank_you", label: "Thank You" },
                  { value: "review_published", label: "Review Published" },
                  { value: "custom", label: "Custom Message" },
                ].map((option) => (
                  <label key={option.value}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-200 transition hover:border-[#d4af37]/30">
                    <input type="radio" name="commTemplate" value={option.value}
                      checked={commTemplate === option.value}
                      onChange={(e) => setCommTemplate(e.target.value)}
                      className="accent-[#d4af37]" />
                    {option.label}
                  </label>
                ))}
              </div>
              {commTemplate === "custom" && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">Custom Message</label>
                  <textarea value={commCustomMessage} onChange={(e) => setCommCustomMessage(e.target.value)}
                    rows="4" placeholder="Enter your custom message..."
                    className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20" />
                </div>
              )}
              {commError && (
                <p className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{commError}</p>
              )}
              <button type="submit" disabled={commSending}
                className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                {commSending ? "Sending..." : "Send Message"}
              </button>
              <button type="button" onClick={closeCommModal}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]">
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3 text-center">
      <p className="text-lg font-black text-[#d4af37]">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">{label}</h3>
      <p className="break-words text-sm text-slate-300">{value || "Not available"}</p>
    </div>
  );
}

function FormInput({ label, name, value, onChange, required, type = "text" }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200">{label}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20" />
    </div>
  );
}

export default Reviews;
