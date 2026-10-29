// ============================================
// NEW.JSX - CODE ADDITIONS AND MODIFICATIONS
// ============================================
// Add these to your existing New.jsx file

// ============================================
// 1. ADD THESE IMPORTS AT THE TOP
// ============================================
import { useEffect, useState, useRef } from "react";

// ============================================
// 2. ADD THESE STATE VARIABLES (after existing states)
// ============================================
const [tags, setTags] = useState([]);
const [selectedTags, setSelectedTags] = useState([]);
const [slugTouched, setSlugTouched] = useState(false);
const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
const [articleSections, setArticleSections] = useState([{ heading: "", content: "" }]);

// Debounce timer ref
const slugDebounceTimer = useRef(null);

// ============================================
// 3. ADD TAGS_API CONSTANT (after other API constants)
// ============================================
const TAGS_API =
  import.meta.env.VITE_TAGS_API || `${API_BASE_URL}/api/tags`;

// ============================================
// 4. ADD FETCH TAGS FUNCTION
// ============================================
const fetchTags = async () => {
  try {
    const response = await fetch(TAGS_API);
    const data = await response.json();

    if (Array.isArray(data)) {
      setTags(data);
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

// ============================================
// 5. ADD useEffect TO FETCH TAGS AND CATEGORIES
// ============================================
useEffect(() => {
  fetchCategories();
  fetchTags(); // ADD THIS LINE
}, []);

// ============================================
// 6. ADD SLUG AUTO-GENERATION WITH DEBOUNCE
// ============================================
useEffect(() => {
  // Clear existing timer
  if (slugDebounceTimer.current) {
    clearTimeout(slugDebounceTimer.current);
  }

  // Only auto-generate if slug hasn't been manually touched
  if (!slugTouched && formData.title) {
    slugDebounceTimer.current = setTimeout(() => {
      const autoSlug = createSlug(formData.title);
      setFormData((prev) => ({
        ...prev,
        slug: autoSlug,
      }));
    }, 600); // 600ms debounce
  }

  // Cleanup
  return () => {
    if (slugDebounceTimer.current) {
      clearTimeout(slugDebounceTimer.current);
    }
  };
}, [formData.title, slugTouched]);

// ============================================
// 7. MODIFY handleChange TO TRACK SLUG TOUCHES
// ============================================
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

// ============================================
// 8. UPDATE handleSlugRefresh FUNCTION
// ============================================
const handleSlugRefresh = () => {
  const newSlug = createSlug(formData.title);
  setFormData((prev) => ({
    ...prev,
    slug: newSlug,
  }));
  setSlugTouched(false); // Reset touched state
};

// ============================================
// 9. ADD TAGS TOGGLE FUNCTION
// ============================================
const toggleTag = (tagId) => {
  setSelectedTags((prev) =>
    prev.includes(tagId)
      ? prev.filter((id) => id !== tagId)
      : [...prev, tagId]
  );
};

// ============================================
// 10. ADD FAQ HANDLER FUNCTIONS
// ============================================
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

// ============================================
// 11. ADD ARTICLE SECTION HANDLER FUNCTIONS
// ============================================
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

// ============================================
// 12. UPDATE handleSubmit FUNCTION
// ============================================
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

    postForm.append(
      "category_id",
      formData.category_id ? Number(formData.category_id) : ""
    );

    postForm.append(
      "author_id",
      formData.author_id ? Number(formData.author_id) : ""
    );

    postForm.append(
      "published_at",
      formData.status === "published"
        ? formData.published_at || new Date().toISOString()
        : ""
    );

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

    if (!response.ok) {
      throw new Error(data.message || "Post creation failed.");
    }

    alert("Post created successfully.");
    navigate("/admin/posts");
  } catch (error) {
    alert(error.message || "Something went wrong.");
  } finally {
    setSubmitting(false);
  }
};

// ============================================
// END OF FUNCTION ADDITIONS
// ============================================
