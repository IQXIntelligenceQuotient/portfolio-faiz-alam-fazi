import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? "https://api.faizalamfaizi.com" : "http://localhost:5000");

const POSTS_API =
  import.meta.env.VITE_POSTS_API || `${API_BASE_URL}/api/posts`;

const CATEGORIES_API =
  import.meta.env.VITE_CATEGORIES_API || `${API_BASE_URL}/api/categories`;

const TAGS_API =
  import.meta.env.VITE_TAGS_API || `${API_BASE_URL}/api/tags`;

function New() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [articleSections, setArticleSections] = useState([{ heading: "", content: "" }]);

  // Tags panel state
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
  
  const slugDebounceTimer = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    seo_title: "",
    meta_description: "",
    excerpt: "",
    content: "",
    featured_image: "",
    status: "draft",
    category_id: "",
    author_id: 1,
    publish_date: "",
  });

  const handleImageChange = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

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

  const createSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If user manually changes slug, mark it as touched
    if (name === "slug") {
      setSlugTouched(true);
    }

    // Don't auto-update slug from title anymore (debounce handles it)
    if (name === "title") {
      setFormData((prev) => ({
        ...prev,
        title: value,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSlugRefresh = () => {
    const newSlug = createSlug(formData.title);
    setFormData((prev) => ({
      ...prev,
      slug: newSlug,
    }));
    setSlugTouched(false); // Reset touched state
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);

      const response = await fetch(CATEGORIES_API);
      const data = await response.json();

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error("Categories loading failed:", error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
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
      const token = localStorage.getItem("adminToken");
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

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  // Fetch category tags when categories load
  useEffect(() => {
    categories.forEach((c) => fetchTagsForCategory(c.id));
  }, [categories]);

  // Slug auto-generation with debounce
  useEffect(() => {
    if (slugDebounceTimer.current) {
      clearTimeout(slugDebounceTimer.current);
    }

    if (!slugTouched && formData.title) {
      slugDebounceTimer.current = setTimeout(() => {
        const autoSlug = createSlug(formData.title);
        setFormData((prev) => ({
          ...prev,
          slug: autoSlug,
        }));
      }, 600);
    }

    return () => {
      if (slugDebounceTimer.current) {
        clearTimeout(slugDebounceTimer.current);
      }
    };
  }, [formData.title, slugTouched]);
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.title.trim()) {
    alert("Post title is required.");
    return;
  }

  if (!formData.slug.trim()) {
    alert("Post slug is required.");
    return;
  }

  if (!formData.content.trim()) {
    alert("Post content is required.");
    return;
  }

  try {
    setSubmitting(true);

    const token = localStorage.getItem("adminToken");

    // Clean FAQs - only include non-empty ones
    const cleanFaqs = faqs.filter(
      (faq) => faq.question.trim() && faq.answer.trim()
    );

    // Clean article sections - only include non-empty ones
    const cleanArticleSections = articleSections.filter(
      (section) => section.heading.trim() || section.content.trim()
    );

    const postForm = new FormData();

    postForm.append("title", formData.title.trim());
    postForm.append("slug", formData.slug.trim());
    postForm.append("seo_title", formData.seo_title.trim());
    postForm.append("meta_description", formData.meta_description.trim());
    postForm.append("excerpt", formData.excerpt.trim());
    postForm.append("content", formData.content.trim());
    postForm.append("status", formData.status);
    // Include publish_date if provided
    if (formData.publish_date) {
      postForm.append("publish_date", formData.publish_date);
    }

    // Only append category_id if it has a value
    if (formData.category_id) {
      postForm.append("category_id", Number(formData.category_id));
    }

    // Only append author_id if it has a value
    if (formData.author_id) {
      postForm.append("author_id", Number(formData.author_id));
    }

    // Append tags as JSON string
    postForm.append("tag_ids", JSON.stringify(selectedTags));

    // Append FAQs as JSON string
    postForm.append("faqs", JSON.stringify(cleanFaqs));

    // Append article sections as JSON string
    postForm.append("article_sections", JSON.stringify(cleanArticleSections));

    // File upload for Multer
    if (imageFile) {
      postForm.append("featured_image", imageFile);
    }

    // Optional fallback, if user enters image URL instead of uploading
    if (!imageFile && formData.featured_image.trim()) {
      postForm.append("featured_image_url", formData.featured_image.trim());
    }

    const response = await fetch(POSTS_API, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        // Do NOT add Content-Type for FormData
      },
      body: postForm,
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('Error details:', data);
      throw new Error(data.message || data.error || "Post creation failed.");
    }

    alert("Post created successfully.");
    navigate("/admin/posts");
  } catch (error) {
    console.error('Catch error:', error);
    alert(error.message || "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
};

  return (
    <main className="min-h-screen bg-[#05070d] px-4 py-28 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-[28px] border border-[#d4af37]/20 bg-gradient-to-br from-[#111827] to-[#070a12] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Admin Panel
          </p>

          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-black text-white md:text-4xl">
                Create New Blog Post
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Add SEO title, meta description, slug, category, featured image,
                and full content for a professional blog article.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/admin/posts")}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
            >
              Back to Posts
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-6">
            <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
              <h2 className="mb-5 text-xl font-bold text-white">
                Main Post Details
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Post Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Foreign Direct Investment Lawyer in Pakistan"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                    required
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-200">
                      URL Slug
                    </label>

                    <button
                      type="button"
                      onClick={handleSlugRefresh}
                      className="text-xs font-bold text-[#d4af37] hover:text-white"
                    >
                      Generate from title
                    </button>
                  </div>

                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="foreign-direct-investment-lawyer-pakistan"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Short summary shown on blog listing page."
                    className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                   Summary of the blog
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Write or paste the complete blog Summary here..."
                    className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
              <h2 className="mb-5 text-xl font-bold text-white">
                SEO Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    name="seo_title"
                    value={formData.seo_title}
                    onChange={handleChange}
                    placeholder="Foreign Direct Investment Lawyer in Pakistan | FDI Legal Advisory"
                    maxLength="255"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Recommended length: 50 to 60 characters.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Meta Description
                  </label>
                  <textarea
                    name="meta_description"
                    value={formData.meta_description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Write a Google-friendly meta description..."
                    className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Recommended length: 140 to 160 characters.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    FAQs
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Add frequently asked questions for this post
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

              <div className="space-y-5">
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
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                          Question
                        </label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) =>
                            handleFaqChange(index, "question", e.target.value)
                          }
                          placeholder="What is FDI?"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                          Answer
                        </label>
                        <textarea
                          value={faq.answer}
                          onChange={(e) =>
                            handleFaqChange(index, "answer", e.target.value)
                          }
                          rows="4"
                          placeholder="Foreign Direct Investment means..."
                          className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Article Sections
                  </h2>
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

              <div className="space-y-5">
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
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                          Section Heading
                        </label>
                        <input
                          type="text"
                          value={section.heading}
                          onChange={(e) =>
                            handleArticleSectionChange(index, "heading", e.target.value)
                          }
                          placeholder="Why Foreign Investors Need Legal Advisory"
                          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-200">
                          Section Content
                        </label>
                        <textarea
                          value={section.content}
                          onChange={(e) =>
                            handleArticleSectionChange(index, "content", e.target.value)
                          }
                          rows="6"
                          placeholder="Foreign investment is not only about bringing capital..."
                          className="w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-[#d4af37]/20 bg-[#080b13]/95 p-6 shadow-2xl">
              <h2 className="mb-5 text-xl font-bold text-white">
                Publish Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                   <label className="mb-2 block text-sm font-semibold text-slate-200">
                     Publish Date
                   </label>
                   <input
                     type="datetime-local"
                     name="publish_date"
                     value={formData.publish_date}
                     onChange={handleChange}
                     className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                   />
                   <p className="mt-2 text-xs text-slate-500">
                     Leave empty for drafts. Required for published posts.
                   </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-[#0b1020] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  >
                    <option value="">
                      {loadingCategories ? "Loading..." : "Select category"}
                    </option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name || category.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-200">
                    Author ID
                  </label>
                  <input
                    type="number"
                    name="author_id"
                    value={formData.author_id}
                    onChange={handleChange}
                    min="1"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-200">Tags</label>
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

                  {/* 12 Category dropdowns */}
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {categories.map((cat) => {
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
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Creating Post..." : "Create Post"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      status: "draft",
                    }))
                  }
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
                >
                  Save as Draft
                </button>
              </div>
            </div>

           <div className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
  <h2 className="mb-5 text-xl font-bold text-white">
    Featured Image
  </h2>

  <label className="mb-3 block text-sm font-semibold text-slate-200">
    Upload Image
  </label>

  <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#d4af37]/30 bg-white/[0.03] px-4 py-8 text-center transition hover:border-[#d4af37]/60 hover:bg-white/[0.06]">
    <input
      type="file"
      accept="image/png, image/jpeg, image/jpg, image/webp"
      onChange={handleImageChange}
      className="hidden"
    />

    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#d4af37]/10 text-2xl text-[#d4af37]">
      +
    </span>

    <span className="mt-3 text-sm font-semibold text-white">
      Click to upload image
    </span>

    <span className="mt-1 text-xs text-slate-500">
      JPG, PNG, JPEG, or WEBP. Max size 5MB.
    </span>
  </label>

  {imageFile && (
    <div className="mt-3 rounded-2xl border border-[#d4af37]/20 bg-[#d4af37]/10 px-4 py-3">
      <p className="text-sm font-semibold text-[#d4af37]">
        Selected File:
      </p>
      <p className="mt-1 break-all text-xs text-slate-300">
        {imageFile.name}
      </p>
    </div>
  )}

  <div className="mt-5">
    <label className="mb-2 block text-sm font-semibold text-slate-200">
      Or Image URL
    </label>

    <input
      type="url"
      name="featured_image"
      value={formData.featured_image}
      onChange={handleChange}
      placeholder="https://example.com/image.webp"
      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
    />

    <p className="mt-2 text-xs text-slate-500">
      Uploaded image will be used first. URL is optional fallback.
    </p>
  </div>

  {imagePreview || formData.featured_image ? (
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <img
        src={imagePreview || formData.featured_image}
        alt="Featured preview"
        className="h-48 w-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  ) : (
    <div className="mt-5 flex h-48 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-sm text-slate-500">
      Image preview will appear here
    </div>
  )}

  {(imageFile || imagePreview) && (
    <button
      type="button"
      onClick={() => {
        setImageFile(null);
        setImagePreview("");
      }}
      className="mt-4 w-full rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500 hover:text-white"
    >
      Remove Uploaded Image
    </button>
  )}
</div>

          </aside>
        </form>
      </div>
    </main>
  );
}

export default New;
