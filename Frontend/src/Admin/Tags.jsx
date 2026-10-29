import { useCallback, useEffect, useRef, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.faizalamfaizi.com" : "http://localhost:5000");
const TAGS_API = import.meta.env.VITE_TAGS_API || `${API_BASE_URL}/api/tags`;
const CATEGORIES_API = import.meta.env.VITE_CATEGORIES_API || `${API_BASE_URL}/api/categories`;

// The 12 required law category names (used as fallback if DB categories differ)
const LAW_CATEGORIES = [
  "Cyber Law", "Fraud Recovery", "Family Law", "Business Law",
  "Legal Documents", "Immigration Law", "Dispute Resolution", "Property Law",
  "Education Law", "Criminal Law", "Litigation", "Corporate Law",
];

// Icon components
function IconEye() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}
function IconEdit() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function IconTrash() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function IconChevron({ open }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconBtn({ onClick, title, disabled, children, variant = "default" }) {
  const base = "group relative flex h-8 w-8 items-center justify-center rounded-full transition";
  const variants = {
    default: "border border-white/10 bg-white/5 text-slate-300 hover:border-[#d4af37]/40 hover:text-[#d4af37]",
    gold: "bg-[#d4af37]/15 text-[#d4af37] hover:bg-[#d4af37] hover:text-black",
    danger: "border border-red-400/30 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white",
  };
  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title}
      className={`${base} ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-60`}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
        {title}
      </span>
    </button>
  );
}

// Category table section — shows tags grouped under one category
function CategoryTagTable({ category, tags, onEdit, onDelete, deletingId }) {
  const [open, setOpen] = useState(true);
  if (!tags) return null;
  return (
    <div className="rounded-[20px] border border-white/10 bg-[#080b13]/95 overflow-hidden shadow-xl">
      <button type="button" onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-[#d4af37]">{category.name}</span>
          <span className="rounded-full bg-[#d4af37]/10 px-2 py-0.5 text-[10px] font-bold text-[#d4af37]">
            {tags.length} tag{tags.length !== 1 ? "s" : ""}
          </span>
        </div>
        <span className="text-slate-400"><IconChevron open={open} /></span>
      </button>
      {open && (
        <div className="border-t border-white/10">
          {tags.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">No tags in this category yet.</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">#</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Tag Name</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Slug</th>
                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag, idx) => (
                  <tr key={tag.id} className="border-t border-white/[0.06] transition hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-sm font-bold text-slate-500">{idx + 1}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-bold text-[#d4af37]">{tag.name}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-slate-400">{tag.slug}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <IconBtn onClick={() => onEdit(tag)} title="Edit tag" variant="gold"><IconEdit /></IconBtn>
                        <IconBtn onClick={() => onDelete(tag.id)} disabled={deletingId === tag.id} title="Delete tag" variant="danger"><IconTrash /></IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Tags({ _selectedCategory = null }) {
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTags, setCategoryTags] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Search
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const searchTimerRef = useRef(null);

  // Create form
  const [formData, setFormData] = useState({ name: "", slug: "", category_id: "" });
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");

  // Edit modal
  const [editTag, setEditTag] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "", category_id: "" });

  const token = localStorage.getItem("adminToken");

  const createSlug = (v) =>
    v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await fetch(TAGS_API, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch tags.");
      const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
      setTags(list);
    } catch (e) { alert(e.message); }
    finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(CATEGORIES_API);
      const data = await res.json();
      const list = Array.isArray(data) ? data
        : Array.isArray(data.data) ? data.data
        : Array.isArray(data.categories) ? data.categories : [];
      setCategories(list);
    } catch { /* optional */ }
  };

  const fetchTagsForCategory = async (categoryId) => {
    try {
      const res = await fetch(`${TAGS_API}/by-category/${categoryId}`);
      const data = await res.json();
      const list = Array.isArray(data.data) ? data.data : [];
      setCategoryTags((prev) => ({ ...prev, [categoryId]: list }));
    } catch {
      setCategoryTags((prev) => ({ ...prev, [categoryId]: [] }));
    }
  };

  useEffect(() => { fetchTags(); fetchCategories(); }, []);
  useEffect(() => { categories.forEach((c) => fetchTagsForCategory(c.id)); }, [categories]);

  // Debounced search
  const handleSearchChange = useCallback((e) => {
    const v = e.target.value;
    setSearch(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!v.trim()) { setSearchResults(null); return; }
    searchTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${TAGS_API}/search?q=${encodeURIComponent(v.trim())}`);
        const data = await res.json();
        setSearchResults(Array.isArray(data.data) ? data.data : []);
      } catch { setSearchResults([]); }
    }, 300);
  }, []);

  const _displayedTags = searchResults !== null ? searchResults : tags;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      setFormData((p) => ({ ...p, name: value, slug: p.slug ? p.slug : createSlug(value) }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    setCreateError(""); setCreateSuccess("");
    if (!formData.name.trim()) { setCreateError("Tag name is required."); return; }
    if (!formData.slug.trim()) { setCreateError("Tag slug is required."); return; }
    try {
      setSubmitting(true);
      const body = { name: formData.name.trim(), slug: formData.slug.trim() };
      if (formData.category_id) body.category_id = Number(formData.category_id);
      const res = await fetch(TAGS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tag creation failed.");
      setFormData({ name: "", slug: "", category_id: "" });
      setCreateSuccess(`Tag "${formData.name.trim()}" created successfully.`);
      await fetchTags();
      categories.forEach((c) => fetchTagsForCategory(c.id));
    } catch (e) { setCreateError(e.message); }
    finally { setSubmitting(false); }
  };

  const openEditModal = (tag) => {
    setEditTag(tag);
    setEditForm({ name: tag.name || "", slug: tag.slug || "", category_id: tag.category_id || "" });
  };
  const closeEditModal = () => { setEditTag(null); setEditForm({ name: "", slug: "", category_id: "" }); };

  const handleUpdateTag = async (e) => {
    e.preventDefault();
    if (!editTag?.id) return;
    if (!editForm.name.trim() || !editForm.slug.trim()) { alert("Name and slug are required."); return; }
    try {
      setSubmitting(true);
      const body = { name: editForm.name.trim(), slug: editForm.slug.trim() };
      if (editForm.category_id) body.category_id = Number(editForm.category_id);
      const res = await fetch(`${TAGS_API}/${editTag.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tag update failed.");
      closeEditModal();
      fetchTags();
      categories.forEach((c) => fetchTagsForCategory(c.id));
    } catch (e) { alert(e.message); }
    finally { setSubmitting(false); }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Delete this tag? This cannot be undone.")) return;
    try {
      setDeletingId(tagId);
      const res = await fetch(`${TAGS_API}/${tagId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Delete failed.");
      setTags((p) => p.filter((t) => t.id !== tagId));
      setCategoryTags((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => { next[k] = next[k].filter((t) => t.id !== tagId); });
        return next;
      });
    } catch (e) { alert(e.message); }
    finally { setDeletingId(null); }
  };

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 rounded-[28px] border border-[#d4af37]/20 bg-gradient-to-br from-[#111827] to-[#070a12] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">Admin Panel</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">Manage Tags</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Create, search, and manage tags organized by law category.
              </p>
            </div>
            <div className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-5 py-3 text-sm font-bold text-[#d4af37]">
              Total Tags: {tags.length}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_1fr] xl:grid-cols-[380px_1fr]">
          {/* ── Left panel: Create New Tag ── */}
          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white">Create New Tag</h2>
              <p className="mt-1 text-sm text-slate-400">Add a tag and assign it to a law category.</p>
              <form onSubmit={handleCreateTag} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-200">Tag Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange}
                    placeholder="e.g. Cybercrime Defense"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                    required />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-200">Slug</label>
                    <button type="button" onClick={() => setFormData((p) => ({ ...p, slug: createSlug(p.name) }))}
                      className="text-xs font-bold text-[#d4af37] hover:text-white">Auto-generate</button>
                  </div>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange}
                    placeholder="cybercrime-defense"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                    required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-200">Category</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20">
                    <option value="">— Select category —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                  {submitting ? "Creating..." : "Create Tag"}
                </button>
                {createError && <p className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300">{createError}</p>}
                {createSuccess && <p className="rounded-xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-300">{createSuccess}</p>}
              </form>
            </section>

            {/* Search */}
            <section className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
              <h2 className="mb-3 text-xl font-bold text-white">Search Tags</h2>
              <input type="text" value={search} onChange={handleSearchChange}
                placeholder="Search by tag name..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20" />
              {search && (
                <div className="mt-4">
                  {searchResults === null ? (
                    <p className="text-sm text-slate-500">Searching...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-sm text-slate-500">No tags match "{search}".</p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</p>
                      <div className="max-h-48 overflow-y-auto space-y-1">
                        {searchResults.map((tag, idx) => (
                          <div key={tag.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                              <span className="text-sm font-bold text-[#d4af37]">{tag.name}</span>
                              <span className="text-xs text-slate-500">{tag.slug}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <IconBtn onClick={() => openEditModal(tag)} title="Edit" variant="gold"><IconEdit /></IconBtn>
                              <IconBtn onClick={() => handleDeleteTag(tag.id)} disabled={deletingId === tag.id} title="Delete" variant="danger"><IconTrash /></IconBtn>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* ── Right panel: All Tags grouped by category ── */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">All Tags by Category</h2>
                <p className="mt-1 text-sm text-slate-400">Each law category has its own table. Serial numbers are display-only.</p>
              </div>
            </div>
            {loading ? (
              <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-12 text-center text-slate-400 shadow-2xl">
                Loading tags...
              </div>
            ) : categories.length === 0 ? (
              <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-12 text-center text-slate-400 shadow-2xl">
                No categories found. Add categories first.
              </div>
            ) : (
              <div className="space-y-4">
                {categories.map((cat) => (
                  <CategoryTagTable
                    key={cat.id}
                    category={cat}
                    tags={categoryTags[cat.id] || []}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTag}
                    deletingId={deletingId}
                  />
                ))}
                {/* Uncategorized tags */}
                {(() => {
                  const catTagIds = new Set(Object.values(categoryTags).flat().map((t) => t.id));
                  const uncategorized = tags.filter((t) => !catTagIds.has(t.id));
                  if (uncategorized.length === 0) return null;
                  return (
                    <CategoryTagTable
                      category={{ id: "uncategorized", name: "Uncategorized" }}
                      tags={uncategorized}
                      onEdit={openEditModal}
                      onDelete={handleDeleteTag}
                      deletingId={deletingId}
                    />
                  );
                })()}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Edit Modal */}
      {editTag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">Edit Tag</p>
                <h2 className="mt-2 text-2xl font-black text-white">Update Tag</h2>
              </div>
              <button type="button" onClick={closeEditModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]">×</button>
            </div>
            <form onSubmit={handleUpdateTag} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-200">Tag Name</label>
                <input type="text" name="name" value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  required />
              </div>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-200">Slug</label>
                  <button type="button" onClick={() => setEditForm((p) => ({ ...p, slug: createSlug(p.name) }))}
                    className="text-xs font-bold text-[#d4af37] hover:text-white">Auto-generate</button>
                </div>
                <input type="text" name="slug" value={editForm.slug}
                  onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-200">Category</label>
                <select value={editForm.category_id}
                  onChange={(e) => setEditForm((p) => ({ ...p, category_id: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20">
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? "Updating..." : "Update Tag"}
              </button>
              <button type="button" onClick={closeEditModal}
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

export default Tags;
