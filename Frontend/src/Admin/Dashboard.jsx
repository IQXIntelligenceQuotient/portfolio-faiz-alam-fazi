import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.faizalamfaizi.com" : "http://localhost:5000");

const POSTS_API =
  import.meta.env.VITE_POSTS_API || `${API_BASE_URL}/api/posts`;

const CATEGORIES_API =
  import.meta.env.VITE_CATEGORIES_API || `${API_BASE_URL}/api/categories`;

const TAGS_API =
  import.meta.env.VITE_TAGS_API || `${API_BASE_URL}/api/tags`;

const REVIEWS_ADMIN_API =
  import.meta.env.VITE_REVIEWS_ADMIN_API ||
  `${API_BASE_URL}/api/review/admin/all`;

const CONTACTS_API =
  import.meta.env.VITE_CONTACTS_ADMIN_API || `${API_BASE_URL}/api/contact/admin/all`;

const SUBSCRIBERS_API = `${API_BASE_URL}/api/subscribers`;

function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [subscribers, setSubscribers] = useState([]);
  const [deletingSubId, setDeletingSubId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("adminToken");

  const getArrayData = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.[key])) return data[key];
    return [];
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const headers = {
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const [postsRes, categoriesRes, tagsRes, reviewsRes, contactsRes, subsRes] =
        await Promise.allSettled([
          fetch(POSTS_API, { headers }),
          fetch(CATEGORIES_API, { headers }),
          fetch(TAGS_API, { headers }),
          fetch(REVIEWS_ADMIN_API, { headers }),
          fetch(CONTACTS_API, { headers }),
          fetch(`${SUBSCRIBERS_API}/admin/all`, { headers }),
        ]);

      if (postsRes.status === "fulfilled" && postsRes.value.ok) {
        const data = await postsRes.value.json();
        setPosts(getArrayData(data, "posts"));
      }

      if (categoriesRes.status === "fulfilled" && categoriesRes.value.ok) {
        const data = await categoriesRes.value.json();
        setCategories(getArrayData(data, "categories"));
      }

      if (tagsRes.status === "fulfilled" && tagsRes.value.ok) {
        const data = await tagsRes.value.json();
        setTags(getArrayData(data, "tags"));
      }

      if (reviewsRes.status === "fulfilled" && reviewsRes.value.ok) {
        const data = await reviewsRes.value.json();
        setReviews(getArrayData(data, "reviews"));
      }

      if (contactsRes.status === "fulfilled" && contactsRes.value.ok) {
        const data = await contactsRes.value.json();
        setContacts(getArrayData(data, "contacts"));
      }

      if (subsRes.status === "fulfilled" && subsRes.value.ok) {
        const data = await subsRes.value.json();
        setSubscribers(getArrayData(data, "subscribers"));
      }
    } catch (err) {
      setError(err.message || "Dashboard data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const publishedPosts = posts.filter(
      (post) => post.status === "published"
    ).length;

    const draftPosts = posts.filter((post) => post.status === "draft").length;

    const approvedReviews = reviews.filter(
      (review) => review.is_approved
    ).length;

    const pendingReviews = reviews.filter(
      (review) => !review.is_approved
    ).length;

    const activeSubscribers = subscribers.filter((s) => s.is_active).length;

    return {
      totalPosts: posts.length,
      publishedPosts,
      draftPosts,
      categories: categories.length,
      tags: tags.length,
      totalReviews: reviews.length,
      approvedReviews,
      pendingReviews,
      contacts: contacts.length,
      totalSubscribers: subscribers.length,
      activeSubscribers,
    };
  }, [posts, categories, tags, reviews, contacts, subscribers]);

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm("Remove this subscriber?")) return;
    try {
      setDeletingSubId(id);
      const res = await fetch(`${SUBSCRIBERS_API}/admin/${id}`, {
        method: "DELETE",
        headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed.");
      setSubscribers((prev) => prev.filter((s) => s.id !== id));
    } catch (e) {
      alert(e.message);
    } finally {
      setDeletingSubId(null);
    }
  };

  const recentPosts = posts.slice(0, 5);
  const recentReviews = reviews.slice(0, 5);

  const formatDate = (date) => {
    if (!date) return "Not available";
    return new Date(date).toLocaleDateString();
  };

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-28 text-white">
      <div className="mx-auto max-w-7xl">

        <section className="mb-8 rounded-[28px] border border-[#d4af37]/20 bg-gradient-to-br from-[#111827] to-[#070a12] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Admin Panel
            
          </p>
          

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              
              <h1 className="text-3xl font-black text-white md:text-4xl">
                Dashboard
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Control blog posts, categories, tags, reviews, contacts, and
                website content from one secure admin area.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/new"
                className="rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-3 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition hover:-translate-y-0.5"
              >
                Create New Post
              </Link>

              <button
                type="button"
                onClick={fetchDashboardData}
                className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-6 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-5 py-4 text-sm font-semibold text-[#d4af37]">
            Loading dashboard data...
          </div>
        )}

        <section className="mb-8 grid gap-5 grid-cols-2 lg:grid-cols-5">
          <DashboardCard
            title="Total Posts"
            value={stats.totalPosts}
            subtitle={`${stats.publishedPosts} published, ${stats.draftPosts} drafts`}
            icon="✎"
            link="/admin/posts"
          />

          <DashboardCard
            title="Categories"
            value={stats.categories}
            subtitle="Blog content structure"
            icon="◧"
            link="/admin/categories"
          />

          <DashboardCard
            title="Tags"
            value={stats.tags}
            subtitle="SEO and topic labels"
            icon="#"
            link="/admin/tags"
          />

          <DashboardCard
            title="Reviews"
            value={stats.totalReviews}
            subtitle={`${stats.approvedReviews} approved, ${stats.pendingReviews} pending`}
            icon="★"
            link="/admin/reviews"
          />

          <DashboardCard
            title="Subscribers"
            value={stats.activeSubscribers}
            subtitle={`${stats.totalSubscribers} total, ${stats.activeSubscribers} active`}
            icon="✉"
            link="#subscribers"
          />
        </section>

        <section className="mb-8 grid gap-5 grid-cols-2 md:grid-cols-4">
          <SmallStat
            title="Published Posts"
            value={stats.publishedPosts}
            tone="green"
          />

          <SmallStat
            title="Draft Posts"
            value={stats.draftPosts}
            tone="yellow"
          />

          <SmallStat
            title="Contact Messages"
            value={stats.contacts}
            tone="blue"
          />

          <SmallStat
            title="Active Subscribers"
            value={stats.activeSubscribers}
            tone="purple"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Recent Posts
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest blog records from your post database.
                </p>
              </div>

              <Link
                to="/admin/posts"
                className="text-sm font-bold text-[#d4af37] hover:text-white"
              >
                View All
              </Link>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                      Title
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                      Status
                    </th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                      Published
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {recentPosts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="px-5 py-10 text-center text-sm text-slate-400"
                      >
                        No posts found.
                      </td>
                    </tr>
                  ) : (
                    recentPosts.map((post) => (
                      <tr
                        key={post.id}
                        className="border-b border-white/10 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <h3 className="line-clamp-1 text-sm font-bold text-white">
                            {post.title}
                          </h3>
                          <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                            /{post.slug}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                              post.status === "published"
                                ? "bg-emerald-500/10 text-emerald-300"
                                : post.status === "archived"
                                ? "bg-red-500/10 text-red-300"
                                : "bg-yellow-500/10 text-yellow-300"
                            }`}
                          >
                            {post.status || "draft"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(post.published_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

          <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Recent Reviews
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest client feedback and approval status.
                </p>
              </div>

              <Link
                to="/admin/reviews"
                className="text-sm font-bold text-[#d4af37] hover:text-white"
              >
                Manage
              </Link>
            </div>

            <div className="max-h-[400px] space-y-3 overflow-auto">
              {recentReviews.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-8 text-center text-sm text-slate-400">
                  No reviews found.
                </div>
              ) : (
                recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#d4af37]/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {review.name}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {review.email}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                          review.is_approved
                            ? "bg-emerald-500/10 text-emerald-300"
                            : "bg-yellow-500/10 text-yellow-300"
                        }`}
                      >
                        {review.is_approved ? "Approved" : "Pending"}
                      </span>
                    </div>

                    <div className="mt-3 text-sm text-[#d4af37]">
                      {"★".repeat(Number(review.rating) || 0)}
                      <span className="text-slate-600">
                        {"★".repeat(5 - (Number(review.rating) || 0))}
                      </span>
                    </div>

                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">
                      {review.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
          <QuickAction
            title="Create Post"
            text="Write a new SEO blog article."
            link="/admin/new"
          />

          <QuickAction
            title="Manage Categories"
            text="Organize posts by topic."
            link="/admin/categories"
          />

          <QuickAction
            title="Manage Tags"
            text="Control searchable keywords."
            link="/admin/tags"
          />

          <QuickAction
            title="Review Feedback"
            text="Approve or edit testimonials."
            link="/admin/reviews"
          />

          <QuickAction
            title="Contact Inquiries"
            text="Manage and respond to messages."
            link="/admin/contacts"
          />
        </section>

        {/* ── Subscribers Section ── */}
        <section id="subscribers" className="mt-8 rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Newsletter Subscribers</h2>
              <p className="mt-1 text-sm text-slate-400">
                Emails collected from the website footer. A notification is sent to all active subscribers whenever a new post is published.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-2 text-sm font-bold text-[#d4af37]">
                {stats.activeSubscribers} active
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-400">
                {stats.totalSubscribers} total
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">#</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Email</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Status</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Subscribed At</th>
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-12 text-center text-sm text-slate-400">
                        No subscribers yet. The subscribe form is in the website footer.
                      </td>
                    </tr>
                  ) : (
                    subscribers.map((sub, idx) => (
                      <tr key={sub.id} className="border-b border-white/10 transition hover:bg-white/[0.03]">
                        <td className="px-5 py-4 text-sm font-bold text-slate-500">{idx + 1}</td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-white">{sub.email}</span>
                        </td>
                        <td className="px-5 py-4">
                          {sub.is_active ? (
                            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">Active</span>
                          ) : (
                            <span className="rounded-full bg-slate-500/10 px-3 py-1 text-xs font-bold text-slate-400">Unsubscribed</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {sub.subscribed_at ? new Date(sub.subscribed_at).toLocaleString() : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(sub.id)}
                            disabled={deletingSubId === sub.id}
                            title="Remove subscriber"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                              Remove
                            </span>
                          </button>
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
    </main>
  );
}

function DashboardCard({ title, value, subtitle, icon, link }) {
  return (
    <Link
      to={link}
      className="group rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#d4af37]/40"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">{title}</p>

          <h2 className="mt-3 text-4xl font-black text-white">
            {value}
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {subtitle}
          </p>
        </div>

        <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-2xl text-[#d4af37] transition group-hover:bg-[#d4af37] group-hover:text-black">
          {icon}
        </span>
      </div>
    </Link>
  );
}

function SmallStat({ title, value, tone }) {
  const toneClasses = {
    green: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    yellow: "border-yellow-400/20 bg-yellow-500/10 text-yellow-300",
    blue: "border-blue-400/20 bg-blue-500/10 text-blue-300",
    purple: "border-purple-400/20 bg-purple-500/10 text-purple-300",
  };

  return (
    <div
      className={`rounded-[24px] border px-5 py-4 shadow-2xl ${
        toneClasses[tone] || toneClasses.blue
      }`}
    >
      <p className="text-sm font-bold">{title}</p>
      <h3 className="mt-2 text-3xl font-black">{value}</h3>
    </div>
  );
}

function QuickAction({ title, text, link }) {
  return (
    <Link
      to={link}
      className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-[#d4af37]/40 hover:bg-white/[0.06]"
    >
      <h3 className="text-base font-black text-white">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {text}
      </p>

      <span className="mt-4 inline-block text-sm font-bold text-[#d4af37]">
        Open →
      </span>
    </Link>
  );
}

export default Dashboard;
