import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ShareButtons from "../components/share/ShareButtons";

const CATEGORIES_API =
  (import.meta.env.VITE_CATEGORIES_API) ||
  `${(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000")}/api/categories`;

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const POSTS_API =
  import.meta.env.VITE_POSTS_API || `${API_BASE_URL}/api/posts`;

const TAGS_API =
  import.meta.env.VITE_TAGS_API || `${API_BASE_URL}/api/tags`;

const PUBLIC_SITE_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL || "http://localhost:5173";

function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updating, setUpdating] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [viewPost, setViewPost] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [sharePostId, setSharePostId] = useState(null); // which post's share panel is open

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // New state for tags, FAQs, and article sections
  const [tags, setTags] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryTags, setCategoryTags] = useState({}); // { [catId]: Tag[] }
  const [expandedCatDropdowns, setExpandedCatDropdowns] = useState({});
  const [tagSearch, setTagSearch] = useState("");
  const [tagSearchResults, setTagSearchResults] = useState(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagSlug, setNewTagSlug] = useState("");
  const [newTagCategoryId, setNewTagCategoryId] = useState("");
  const [addingTag, setAddingTag] = useState(false);
  const [showAddTagForm, setShowAddTagForm] = useState(false);
  const tagSearchTimer = useRef(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [articleSections, setArticleSections] = useState([{ heading: "", content: "" }]);

  const [editForm, setEditForm] = useState({
    title: "",
    slug: "",
    seo_title: "",
    meta_description: "",
    excerpt: "",
    content: "",
    featured_image: "",
    status: "draft",
    category_id: "",
    publish_date: "",
  });

  const token = localStorage.getItem("adminToken");

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
    return `${import.meta.env.VITE_API_BASE_URL}${path}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not published";
    return new Date(date).toLocaleString();
  };

  const toDateTimeLocal = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);
    const offset = parsedDate.getTimezoneOffset();
    const localDate = new Date(parsedDate.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const createSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await fetch(POSTS_API, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch posts.");
      }

      if (Array.isArray(data)) {
        setPosts(data);
      } else if (Array.isArray(data.data)) {
        setPosts(data.data);
      } else if (Array.isArray(data.posts)) {
        setPosts(data.posts);
      } else {
        setPosts([]);
      }
    } catch (error) {
      alert(error.message || "Unable to load posts.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch(TAGS_API);
      const data = await response.json();

      if (Array.isArray(data)) {
        setTags(data);
      } else if (Array.isArray(data.data)) {
        setTags(data.data);
      } else if (Array.isArray(data.tags)) {
        setTags(data.tags);
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error("Tags loading failed:", error);
      setTags([]);
    }
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

  const handleTagSearch = useCallback((e) => {
    const v = e.target.value;
    setTagSearch(v);
    if (tagSearchTimer.current) clearTimeout(tagSearchTimer.current);
    if (!v.trim()) { setTagSearchResults(null); return; }
    tagSearchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`${TAGS_API}/search?q=${encodeURIComponent(v.trim())}`);
        const data = await res.json();
        setTagSearchResults(Array.isArray(data.data) ? data.data : []);
      } catch { setTagSearchResults([]); }
    }, 300);
  }, []);

  const handleAddNewTag = async (e) => {
    e.preventDefault();
    if (!newTagName.trim() || !newTagSlug.trim()) { alert("Tag name and slug are required."); return; }
    try {
      setAddingTag(true);
      const body = { name: newTagName.trim(), slug: newTagSlug.trim() };
      if (newTagCategoryId) body.category_id = Number(newTagCategoryId);
      const res = await fetch(TAGS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tag creation failed.");
      const newTag = data.data || data;
      setNewTagName(""); setNewTagSlug(""); setNewTagCategoryId(""); setShowAddTagForm(false);
      await fetchTags();
      categories.forEach((c) => fetchTagsForCategory(c.id));
      if (newTag?.id) setSelectedTags((prev) => [...prev, newTag.id]);
    } catch (e) { alert(e.message); }
    finally { setAddingTag(false); }
  };

  const createTagSlug = (v) =>
    v.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  useEffect(() => {
    fetchPosts();
    fetchTags();
    fetchCategories();
  }, []);

  // Fetch per-category tags when categories load
  useEffect(() => {
    categories.forEach((c) => fetchTagsForCategory(c.id));
  }, [categories]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        post.title?.toLowerCase().includes(searchValue) ||
        post.slug?.toLowerCase().includes(searchValue) ||
        post.status?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const openEditModal = async (post) => {
    setEditPost(post);
    setImageFile(null);
    setImagePreview("");

    setEditForm({
      title: post.title || "",
      slug: post.slug || "",
      seo_title: post.seo_title || "",
      meta_description: post.meta_description || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featured_image: post.featured_image || "",
      status: post.status || "draft",
      category_id: post.category_id || "",
      publish_date: toDateTimeLocal(post.publish_date),
    });

    // Fetch full post details including tags, FAQs, and article sections
    try {
      const response = await fetch(`${POSTS_API}/${post.slug}`);
      const data = await response.json();

      if (response.ok && data.data) {
        const fullPost = data.data;

        // Load tags
        if (fullPost.tags && Array.isArray(fullPost.tags)) {
          setSelectedTags(fullPost.tags.map(tag => tag.id));
        } else {
          setSelectedTags([]);
        }

        // Load FAQs
        if (fullPost.faqs && Array.isArray(fullPost.faqs) && fullPost.faqs.length > 0) {
          setFaqs(fullPost.faqs.map(faq => ({
            question: faq.question || "",
            answer: faq.answer || ""
          })));
        } else {
          setFaqs([{ question: "", answer: "" }]);
        }

        // Load article sections
        if (fullPost.article_sections && Array.isArray(fullPost.article_sections) && fullPost.article_sections.length > 0) {
          setArticleSections(fullPost.article_sections.map(section => ({
            heading: section.heading || "",
            content: section.content || ""
          })));
        } else {
          setArticleSections([{ heading: "", content: "" }]);
        }
      }
    } catch (error) {
      console.error("Error loading full post details:", error);
      // Set defaults if loading fails
      setSelectedTags([]);
      setFaqs([{ question: "", answer: "" }]);
      setArticleSections([{ heading: "", content: "" }]);
    }
  };

  const closeEditModal = () => {
    setEditPost(null);
    setImageFile(null);
    setImagePreview("");
    setSelectedTags([]);
    setFaqs([{ question: "", answer: "" }]);
    setArticleSections([{ heading: "", content: "" }]);
    setTagSearch("");
    setTagSearchResults(null);
    setShowAddTagForm(false);
    setNewTagName(""); setNewTagSlug(""); setNewTagCategoryId("");
    setExpandedCatDropdowns({});
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleFaqChange = (index, field, value) => {
    setFaqs((prev) =>
      prev.map((faq, i) =>
        i === index ? { ...faq, [field]: value } : faq
      )
    );
  };

  const addFaq = () => {
    setFaqs((prev) => [...prev, { question: "", answer: "" }]);
  };

  const removeFaq = (index) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleArticleSectionChange = (index, field, value) => {
    setArticleSections((prev) =>
      prev.map((section, i) =>
        i === index ? { ...section, [field]: value } : section
      )
    );
  };

  const addArticleSection = () => {
    setArticleSections((prev) => [...prev, { heading: "", content: "" }]);
  };

  const removeArticleSection = (index) => {
    setArticleSections((prev) => prev.filter((_, i) => i !== index));
  };

  const openViewModal = async (post) => {
    // Fetch full post details including tags, FAQs, and article sections
    try {
      const response = await fetch(`${POSTS_API}/${post.slug}`);
      const data = await response.json();

      if (response.ok && data.data) {
        setViewPost(data.data);
      } else {
        setViewPost(post);
      }
    } catch (error) {
      console.error("Error loading full post details:", error);
      setViewPost(post);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    if (name === "title") {
      setEditForm((prev) => ({
        ...prev,
        title: value,
      }));
      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const regenerateSlug = () => {
    setEditForm((prev) => ({
      ...prev,
      slug: createSlug(prev.title),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Only JPG, PNG, JPEG, or WEBP images are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("Image size should not be more than 10MB.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleUpdatePost = async (e) => {
    e.preventDefault();

    if (!editPost?.id) {
      alert("Post ID missing.");
      return;
    }

    if (!editForm.title.trim()) {
      alert("Title is required.");
      return;
    }

    if (!editForm.slug.trim()) {
      alert("Slug is required.");
      return;
    }

    if (!editForm.content.trim()) {
      alert("Content is required.");
      return;
    }

    try {
      setUpdating(true);

      // Clean FAQs - only include non-empty ones
      const cleanFaqs = faqs.filter(
        (faq) => faq.question.trim() && faq.answer.trim()
      );

      // Clean article sections - only include non-empty ones
      const cleanArticleSections = articleSections.filter(
        (section) => section.heading.trim() || section.content.trim()
      );

      const updateForm = new FormData();

      updateForm.append("title", editForm.title.trim());
      updateForm.append("slug", editForm.slug.trim());
      updateForm.append("seo_title", editForm.seo_title.trim());
      updateForm.append("meta_description", editForm.meta_description.trim());
      updateForm.append("excerpt", editForm.excerpt.trim());
      updateForm.append("content", editForm.content.trim());
      updateForm.append("status", editForm.status);

      // Only append category_id if it has a value
      if (editForm.category_id) {
        updateForm.append("category_id", Number(editForm.category_id));
      }

      // Append publish_date (send even if empty so backend can clear it for drafts)
      updateForm.append("publish_date", editForm.publish_date || "");

      // Append tags as JSON string
      updateForm.append("tag_ids", JSON.stringify(selectedTags));

      // Append FAQs as JSON string
      updateForm.append("faqs", JSON.stringify(cleanFaqs));

      // Append article sections as JSON string
      updateForm.append("article_sections", JSON.stringify(cleanArticleSections));

      // File upload for Multer
      if (imageFile) {
        updateForm.append("featured_image", imageFile);
      }

      // Optional fallback for image URL
      if (!imageFile && editForm.featured_image.trim()) {
        updateForm.append("featured_image_url", editForm.featured_image.trim());
      }

      const response = await fetch(`${POSTS_API}/${editPost.id}`, {
        method: "PUT",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: updateForm,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Post update failed.");
      }

      alert("Post updated successfully.");
      closeEditModal();
      fetchPosts();
    } catch (error) {
      alert(error.message || "Something went wrong while updating post.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeletingId(postId);

      const response = await fetch(`${POSTS_API}/${postId}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Post delete failed.");
      }

      setPosts((prev) => prev.filter((post) => post.id !== postId));
      alert("Post deleted successfully.");
    } catch (error) {
      alert(error.message || "Something went wrong while deleting post.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-28 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[28px] border border-[#d4af37]/20 bg-gradient-to-br from-[#111827] to-[#070a12] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Admin Panel
          </p>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">
                Manage Blog Posts
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                View, edit, update, and delete blog posts from one professional
                control panel.
              </p>
            </div>

            <a
              href="/admin/new"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-6 py-3 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition hover:-translate-y-0.5"
            >
              Create New Post
            </a>
          </div>
        </div>

        <div className="mb-6 grid gap-4 rounded-[24px] border border-white/10 bg-[#080b13]/95 p-5 shadow-2xl md:grid-cols-[1fr_auto]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, slug, or status..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full min-w-[160px] rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <section className="rounded-[28px] border border-white/10 bg-[#080b13]/95 shadow-2xl">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.03]">
                <tr>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    #
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    Post
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    Slug
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    Status
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    Published Date
                  </th>
                  <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                      Loading posts...
                    </td>
                  </tr>
                ) : filteredPosts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-slate-400">
                      No posts found.
                    </td>
                  </tr>
                ) : (
                  filteredPosts.map((post, idx) => (
                    <tr
                      key={post.id}
                      className="border-b border-white/10 transition hover:bg-white/[0.03]"
                    >
                      <td className="px-5 py-4 text-sm font-bold text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-20 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                            {post.featured_image ? (
                              <img
                                src={getImageUrl(post.featured_image)}
                                alt={post.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs text-slate-500">
                                No Image
                              </div>
                            )}
                          </div>

                          <div>
                            <h3 className="line-clamp-1 max-w-[320px] text-sm font-bold text-white">
                              {post.title}
                            </h3>
                            <p className="mt-1 line-clamp-1 max-w-[320px] text-xs text-slate-500">
                              {post.excerpt || "No excerpt available"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="break-all text-sm text-slate-300">
                          {post.slug}
                        </span>
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

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          {/* View */}
                          <button
                            type="button"
                            onClick={() => openViewModal(post)}
                            title="View post"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">View</span>
                          </button>
                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => openEditModal(post)}
                            title="Edit post"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full bg-[#d4af37]/15 text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Edit</span>
                          </button>
                          {/* Share */}
                          <button
                            type="button"
                            onClick={() => setSharePostId(sharePostId === post.id ? null : post.id)}
                            disabled={!post.slug}
                            title={!post.slug ? "Slug missing — cannot share" : "Share post"}
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] transition hover:bg-[#d4af37]/20 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Share</span>
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={deletingId === post.id}
                            title="Delete post"
                            className="group relative flex h-8 w-8 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            <span className="pointer-events-none absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1a1f2e] px-2 py-1 text-[10px] font-bold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">Delete</span>
                          </button>
                        </div>

                        {/* Inline share panel */}
                        {sharePostId === post.id && post.slug && (
                          <div className="mt-3 rounded-2xl border border-[#d4af37]/20 bg-[#0b1020] p-4">
                            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                              Share this post
                            </p>
                            <ShareButtons
                              title={post.title}
                              url={`${PUBLIC_SITE_URL}/blogs/${post.slug}`}
                              variant="admin"
                            />
                          </div>
                        )}
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

      {viewPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">
                  Post Preview
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {viewPost.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setViewPost(null)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]"
              >
                ×
              </button>
            </div>

            {viewPost.featured_image && (
              <img
                src={getImageUrl(viewPost.featured_image)}
                alt={viewPost.title}
                className="mb-5 h-64 w-full rounded-2xl object-cover"
              />
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <InfoBox label="Slug" value={viewPost.slug} />
              <InfoBox label="Published Date" value={formatDate(viewPost.published_at)} />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-2 text-sm font-bold text-[#d4af37]">
                Meta Description
              </h3>
              <p className="text-sm leading-6 text-slate-300">
                {viewPost.meta_description || "No meta description."}
              </p>
            </div>

            {/* Tags Section */}
            {viewPost.tags && viewPost.tags.length > 0 && (
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="mb-3 text-sm font-bold text-[#d4af37]">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {viewPost.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-bold text-[#d4af37]"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <h3 className="mb-2 text-sm font-bold text-[#d4af37]">
                Summary
              </h3>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {viewPost.content}
              </p>
            </div>

            {/* Article Sections */}
            {viewPost.article_sections && viewPost.article_sections.length > 0 && (
              <div className="mt-5 space-y-4">
                <h3 className="text-sm font-bold text-[#d4af37]">
                  Article Sections
                </h3>
                {viewPost.article_sections.map((section, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    {section.heading && (
                      <h4 className="mb-2 text-base font-bold text-white">
                        {section.heading}
                      </h4>
                    )}
                    {section.content && (
                      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                        {section.content}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* FAQs Section */}
            {viewPost.faqs && viewPost.faqs.length > 0 && (
              <div className="mt-5 space-y-3">
                <h3 className="text-sm font-bold text-[#d4af37]">
                  FAQs
                </h3>
                {viewPost.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <h4 className="mb-2 text-sm font-bold text-white">
                      Q: {faq.question}
                    </h4>
                    <p className="text-sm leading-6 text-slate-300">
                      A: {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {editPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">
                  Edit Post
                </p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  Update Blog Post
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white hover:text-[#d4af37]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePost} className="grid gap-6 lg:grid-cols-[1fr_330px]">
              <section className="space-y-5">
                <FormInput
                  label="Post Title"
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  required
                />

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-200">
                      URL Slug
                    </label>

                    <button
                      type="button"
                      onClick={regenerateSlug}
                      className="text-xs font-bold text-[#d4af37] hover:text-white"
                    >
                      Generate
                    </button>
                  </div>

                  <input
                    name="slug"
                    value={editForm.slug}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                    required
                  />
                </div>

                <FormInput
                  label="SEO Title"
                  name="seo_title"
                  value={editForm.seo_title}
                  onChange={handleEditChange}
                />

                <FormTextarea
                  label="Meta Description"
                  name="meta_description"
                  value={editForm.meta_description}
                  onChange={handleEditChange}
                  rows="3"
                />

                <FormTextarea
                  label="Excerpt"
                  name="excerpt"
                  value={editForm.excerpt}
                  onChange={handleEditChange}
                  rows="3"
                />

                <FormTextarea
                  label="Summary"
                  name="content"
                  value={editForm.content}
                  onChange={handleEditChange}
                  rows="12"
                  required
                />

                {/* FAQs Section */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">FAQs</h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Add frequently asked questions
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addFaq}
                      className="rounded-full bg-[#d4af37] px-4 py-2 text-xs font-black text-black transition hover:bg-[#b8860b]"
                    >
                      + Add FAQ
                    </button>
                  </div>

                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#d4af37]">
                            FAQ #{index + 1}
                          </span>
                          {faqs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFaq(index)}
                              className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) =>
                              handleFaqChange(index, "question", e.target.value)
                            }
                            placeholder="Question"
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                          />
                          <textarea
                            value={faq.answer}
                            onChange={(e) =>
                              handleFaqChange(index, "answer", e.target.value)
                            }
                            rows="3"
                            placeholder="Answer"
                            className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Article Sections */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        Article Sections
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Add structured sections to your article
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addArticleSection}
                      className="rounded-full bg-[#d4af37] px-4 py-2 text-xs font-black text-black transition hover:bg-[#b8860b]"
                    >
                      + Add Section
                    </button>
                  </div>

                  <div className="space-y-4">
                    {articleSections.map((section, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#d4af37]">
                            Section #{index + 1}
                          </span>
                          {articleSections.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArticleSection(index)}
                              className="rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-300 transition hover:bg-red-500 hover:text-white"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={section.heading}
                            onChange={(e) =>
                              handleArticleSectionChange(
                                index,
                                "heading",
                                e.target.value
                              )
                            }
                            placeholder="Section Heading"
                            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                          />
                          <textarea
                            value={section.content}
                            onChange={(e) =>
                              handleArticleSectionChange(
                                index,
                                "content",
                                e.target.value
                              )
                            }
                            rows="5"
                            placeholder="Section Content"
                            className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Status
                  </label>

                  <select
                    name="status"
                    value={editForm.status}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>

                  <label className="mb-2 mt-4 block text-sm font-semibold text-slate-200">
                    Publish Date
                  </label>

                  <input
                    type="datetime-local"
                    name="publish_date"
                    value={editForm.publish_date}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Leave empty for drafts. Required for published posts.
                  </p>

                  <label className="mb-2 mt-4 block text-sm font-semibold text-slate-200">
                    Category ID
                  </label>

                  <input
                    type="number"
                    name="category_id"
                    value={editForm.category_id}
                    onChange={handleEditChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  />
                </div>

                {/* Tags Section */}
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Tags</h3>
                    <button type="button" onClick={() => setShowAddTagForm((p) => !p)}
                      className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-xs font-bold text-[#d4af37] transition hover:bg-[#d4af37] hover:text-black">
                      {showAddTagForm ? "Cancel" : "+ Add New Tag"}
                    </button>
                  </div>

                  {/* Add New Tag inline form */}
                  {showAddTagForm && (
                    <form onSubmit={handleAddNewTag} className="mb-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-3 space-y-2">
                      <input type="text" value={newTagName}
                        onChange={(e) => { setNewTagName(e.target.value); setNewTagSlug(createTagSlug(e.target.value)); }}
                        placeholder="Tag name"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60" />
                      <input type="text" value={newTagSlug}
                        onChange={(e) => setNewTagSlug(e.target.value)}
                        placeholder="tag-slug"
                        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60" />
                      <select value={newTagCategoryId} onChange={(e) => setNewTagCategoryId(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-3 py-2 text-xs text-white outline-none transition focus:border-[#d4af37]/60">
                        <option value="">— Category (optional) —</option>
                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button type="submit" disabled={addingTag}
                        className="w-full rounded-xl bg-[#d4af37] py-2 text-xs font-black text-black transition hover:bg-[#b8860b] disabled:opacity-60">
                        {addingTag ? "Saving..." : "Save & Select Tag"}
                      </button>
                    </form>
                  )}

                  {/* Search tags */}
                  <input type="text" value={tagSearch} onChange={handleTagSearch}
                    placeholder="Search tags..."
                    className="mb-3 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20" />

                  {/* Search results */}
                  {tagSearch && tagSearchResults !== null && (
                    <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2 max-h-28 overflow-y-auto">
                      {tagSearchResults.length === 0 ? (
                        <p className="px-2 py-1 text-xs text-slate-500">No tags match "{tagSearch}"</p>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {tagSearchResults.map((tag) => (
                            <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                              className={`rounded-full px-2.5 py-1 text-xs font-bold transition ${selectedTags.includes(tag.id) ? "bg-[#d4af37] text-black" : "border border-white/10 bg-white/5 text-slate-300 hover:border-[#d4af37]/40"}`}>
                              {tag.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Selected tags preview */}
                  {selectedTags.length > 0 && (
                    <div className="mb-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/5 p-2">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#d4af37]">Selected ({selectedTags.length})</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTags.map((id) => {
                          const tag = tags.find((t) => t.id === id);
                          if (!tag) return null;
                          return (
                            <button key={id} type="button" onClick={() => toggleTag(id)}
                              className="flex items-center gap-1 rounded-full bg-[#d4af37] px-2.5 py-1 text-[10px] font-bold text-black transition hover:bg-red-500 hover:text-white"
                              title="Click to remove">
                              {tag.name} ×
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Category dropdowns */}
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {categories.length === 0 ? (
                      <p className="text-xs text-slate-500">Loading categories...</p>
                    ) : (
                      categories.map((cat) => {
                        const catTags = categoryTags[cat.id] || [];
                        const isOpen = expandedCatDropdowns[cat.id];
                        const selectedCount = catTags.filter((t) => selectedTags.includes(t.id)).length;
                        return (
                          <div key={cat.id} className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
                            <button type="button"
                              onClick={() => setExpandedCatDropdowns((p) => ({ ...p, [cat.id]: !p[cat.id] }))}
                              className="flex w-full items-center justify-between px-3 py-2.5 text-left">
                              <span className="text-xs font-bold text-[#d4af37]">{cat.name}</span>
                              <div className="flex items-center gap-2">
                                {selectedCount > 0 && (
                                  <span className="rounded-full bg-[#d4af37] px-1.5 py-0.5 text-[9px] font-black text-black">{selectedCount}</span>
                                )}
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </button>
                            {isOpen && (
                              <div className="border-t border-white/10 px-3 pb-3 pt-2">
                                {catTags.length === 0 ? (
                                  <p className="text-[10px] text-slate-500">No tags in this category.</p>
                                ) : (
                                  <div className="flex flex-wrap gap-1.5">
                                    {catTags.map((tag) => (
                                      <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)}
                                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold transition ${selectedTags.includes(tag.id) ? "bg-[#d4af37] text-black" : "border border-white/10 bg-white/5 text-slate-300 hover:border-[#d4af37]/40"}`}>
                                        {tag.name}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <h3 className="mb-4 text-lg font-bold text-white">
                    Featured Image
                  </h3>

                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d4af37]/30 bg-white/[0.03] px-4 py-7 text-center transition hover:border-[#d4af37]/60 hover:bg-white/[0.06]">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />

                    <span className="text-2xl text-[#d4af37]">+</span>
                    <span className="mt-2 text-sm font-semibold text-white">
                      Upload New Image
                    </span>
                    <span className="mt-1 text-xs text-slate-500">
                      JPG, PNG, WEBP. Max 5MB.
                    </span>
                  </label>

                  {(imagePreview || editForm.featured_image) && (
                    <img
                      src={imagePreview || getImageUrl(editForm.featured_image)}
                      alt="Preview"
                      className="mt-4 h-44 w-full rounded-2xl object-cover"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {updating ? "Updating..." : "Update Post"}
                </button>

                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
                >
                  Cancel
                </button>
              </aside>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
        {label}
      </h3>
      <p className="break-words text-sm text-slate-300">
        {value || "Not available"}
      </p>
    </div>
  );
}

function FormInput({ label, name, value, onChange, required }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </label>

      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
      />
    </div>
  );
}

function FormTextarea({ label, name, value, onChange, rows = "4", required }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        required={required}
        className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
      />
    </div>
  );
}

export default Posts;