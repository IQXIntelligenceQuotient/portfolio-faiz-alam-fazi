import React, { useMemo, useState, useEffect } from "react";
import BlogCard from "../../components/blog/BlogCard";
import SEOHead from "../../components/seo/SEOHead";

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("All");

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_POSTS_API || `${import.meta.env.VITE_API_BASE_URL}/api/posts`;
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error('Failed to fetch blogs');
        }

        const result = await response.json();
        
        // Extract blogs array from response
        const blogsData = result.data || result.posts || result || [];
        
        // Filter only published posts for public view
        const publishedBlogs = Array.isArray(blogsData) 
          ? blogsData.filter(blog => blog.status === 'published')
          : [];
        
        setBlogs(publishedBlogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError(err.message);
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const safeBlogs = Array.isArray(blogs) ? blogs : [];

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        safeBlogs
          .map((b) => b?.category_name || b?.category)
          .filter((cat) => typeof cat === "string" && cat.trim() !== "")
      ),
    ];
    return ["All", ...uniqueCategories];
  }, [safeBlogs]);

  const filtered = useMemo(() => {
    if (active === "All") return safeBlogs;
    return safeBlogs.filter((b) => (b?.category_name || b?.category) === active);
  }, [active, safeBlogs]);

  const schema = useMemo(() => {
    const blogSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "Faiz Alam Faizi, Legal & Business Blog",
      description:
        "Expert articles on Pakistani law, company registration, trademark protection, employee rights, legal services in Pakistan, and business consulting.",
      url: "https://faizalamfaizi.com/blogs",
      publisher: {
        "@type": "Person",
        name: "Faiz Alam Faizi",
        jobTitle: "Corporate, Technology, IP & Cyber Law Practice",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lahore",
          addressCountry: "PK",
        },
      },
    };

    const collectionPageSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Pakistan Law & Business Blog",
      description:
        "Practical legal and business guides for clients in Lahore, Pakistan, and overseas, covering company registration, trademark protection, employment issues, and corporate compliance.",
      url: "https://faizalamfaizi.com/blogs",
      mainEntity: {
        "@type": "Blog",
        name: "Faiz Alam Faizi, Legal & Business Blog",
      },
    };

    const itemListSchema = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: filtered.map((blog, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://faizalamfaizi.com/blogs/${blog?.slug || ""}`,
        name: blog?.title || `Blog Post ${index + 1}`,
      })),
    };

    return [collectionPageSchema, blogSchema, itemListSchema];
  }, [filtered]);

  return (
    <>
      <SEOHead
        title="Legal & Business Blog Pakistan | Corporate, Technology, IP & Cyber Law Practice"
        description="Expert legal and business articles on company registration, trademark protection, employee rights, corporate law, and legal services in Pakistan."
        keywords="legal blog Pakistan, business law articles, company registration guide Pakistan, trademark Pakistan, employee rights Pakistan, legal services in Pakistan, Corporate, Technology, IP & Cyber Law Practice in Lahore, lawyer in Pakistan, corporate lawyer in Pakistan"
        canonical="/blogs"
        ogImage="/1-Best-Legal_Consultant-near-me.webp"
        ogType="website"
        schema={schema}
      />

      <div className="min-h-screen bg-black text-white pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-medium text-orange-400 mb-4">
              Legal & Business Insights
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Pakistan Law & Business Blog
            </h1>

            <p className="text-gray-400 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
              Practical guides on company registration, trademark protection,
              employee rights, contracts, compliance, and legal services in
              Pakistan, written with real-world insight for clients in Lahore
              and beyond.
            </p>
          </div>

          {/* Category Filter */}
          <div
            className="flex flex-wrap justify-center gap-3 mb-6"
            role="group"
            aria-label="Filter blog posts by category"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActive(cat)}
                aria-pressed={active === cat}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                  active === cat
                    ? "bg-orange-500 text-white shadow-[0_8px_20px_rgba(249,115,22,0.3)]"
                    : "border border-white/10 text-gray-300 hover:border-orange-500/50 hover:text-orange-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Result Count */}
          <p className="text-center text-sm text-gray-500 mb-10">
            Showing {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            {active !== "All" ? ` in ${active}` : ""}
          </p>

          {/* Loading State */}
          {loading ? (
            <div className="py-16 text-center">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              <p className="mt-4 text-gray-400">Loading articles...</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="text-lg text-red-400 mb-2">Failed to load articles</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((blog, idx) => (
                <BlogCard
                  key={blog?.id || blog?.slug || idx}
                  blog={blog}
                  priority={active === "All" && idx < 3}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <p className="text-lg text-gray-300 mb-2">
                No posts found in this category.
              </p>
              <p className="text-sm text-gray-500">
                Try another category or add a new article to this section.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
