import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import SEOHead from "../../components/seo/SEOHead";
import FeaturedReviews from "../../components/reviews/FeaturedReviews";
import ShareButtons from "../../components/share/ShareButtons";
import { ChevronDown } from "lucide-react";

const PROFESSIONAL_DISCLAIMER =
  "Client routing, consultation allocation, and any appearance or advisory role remain subject to availability, conflict checks, document review, forum requirements, and written engagement scope.";

// Helper to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${import.meta.env.VITE_API_BASE_URL}${path}`;
};

function buildArticleSchema(blog) {
  // Build keywords from actual tags first, fall back to seo_title
  const tagKeywords = blog.tags && blog.tags.length > 0
    ? blog.tags.map((t) => t.name).join(', ')
    : blog.seo_title || '';

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.meta_description || blog.excerpt,
    image: blog.featured_image ? getImageUrl(blog.featured_image) : undefined,
    datePublished: blog.publish_date || blog.published_at,
    dateModified: blog.updated_at || blog.publish_date || blog.published_at,
    author: {
      "@type": "Person",
      name: "Faiz Alam Faizi",
      jobTitle: "Corporate, Technology, IP & Cyber Law Practice",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Lahore",
        addressCountry: "PK",
      },
    },
    publisher: {
      "@type": "Organization",
      name: "Legal Bridge LLP®",
      url: "https://legalbridge.pk",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://faizalamfaizi.com/blogs/${blog.slug}`,
    },
    keywords: tagKeywords,
    articleSection: blog.category_name || "Legal Services in Pakistan",
    inLanguage: "en-PK",
  };
}

function buildBreadcrumbSchema(blog) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://faizalamfaizi.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: "https://faizalamfaizi.com/blogs",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: blog.title,
        item: `https://faizalamfaizi.com/blogs/${blog.slug}`,
      },
    ],
  };
}

function buildFAQSchema(faqs = []) {
  if (!faqs.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-[#d4af37] transition-colors">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left group"
      >
        <span className="text-base font-semibold text-gray-900 group-hover:text-[#d4af37] transition-colors">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-[#d4af37] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="px-5 pb-5 text-[15px] text-gray-700 leading-relaxed">
          {faq.answer}
        </div>
      </div>
    </div>
  );
}

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch blog post from API
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const API_URL = import.meta.env.VITE_POSTS_API || `${import.meta.env.VITE_API_BASE_URL}/api/posts`;
        const response = await fetch(`${API_URL}/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('not_found');
          } else {
            throw new Error('Failed to fetch blog post');
          }
          return;
        }

        const result = await response.json();
        const blogData = result.data || result;
        
        // Only show published posts on public page
        if (blogData.status !== 'published') {
          setError('not_found');
          return;
        }
        
        setBlog(blogData);
        setError(null);

        // Fetch related blogs from same category
        if (blogData.category_id) {
          try {
            const relatedResponse = await fetch(API_URL);
            const relatedResult = await relatedResponse.json();
            const allBlogs = relatedResult.data || relatedResult.posts || relatedResult || [];
            
            const related = allBlogs
              .filter(b => 
                b.status === 'published' && 
                b.category_id === blogData.category_id && 
                b.id !== blogData.id
              )
              .slice(0, 3);
            
            setRelatedBlogs(related);
          } catch (err) {
            console.error('Error fetching related blogs:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('error');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // Generate schemas - must be called before any conditional returns
  const articleSchema = useMemo(() => {
    if (!blog) return null;
    return buildArticleSchema(blog);
  }, [blog]);

  const breadcrumbSchema = useMemo(() => {
    if (!blog) return null;
    return buildBreadcrumbSchema(blog);
  }, [blog]);

  const faqSchema = useMemo(() => {
    if (!blog || !blog.faqs) return null;
    return buildFAQSchema(blog.faqs || []);
  }, [blog]);

  const schema = useMemo(() => {
    const schemas = [articleSchema, breadcrumbSchema].filter(Boolean);
    if (faqSchema) schemas.push(faqSchema);
    return schemas;
  }, [articleSchema, breadcrumbSchema, faqSchema]);

  const pageTitle = blog?.seo_title || blog?.title || "Legal Article | Faiz Alam Faizi";
  const metaDescription = blog?.meta_description || blog?.excerpt || "Read this premium legal guide for practical insight on legal services in Pakistan.";
  const featuredImage = blog ? getImageUrl(blog.featured_image) : "";

  // Build keywords from actual tags — this is what goes into <meta name="keywords">
  const tagKeywords = blog?.tags && blog.tags.length > 0
    ? blog.tags.map((t) => t.name).join(', ')
    : blog?.seo_title || "";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-[760px] mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#d4af37] border-t-transparent" />
            <p className="ml-4 text-[#6b6b6b]">Loading article...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-white pt-28 pb-20">
        <div className="max-w-[760px] mx-auto px-6">
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold text-[#242424] mb-4">Article Not Found</h1>
            <p className="text-[#6b6b6b] mb-8">
              The article you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/blogs"
              className="inline-flex items-center justify-center rounded-full bg-[#d4af37] px-7 py-3 text-sm font-semibold text-white hover:bg-[#b8960b] transition-all duration-300"
            >
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${pageTitle} | Faiz Alam Faizi`}
        description={metaDescription}
        keywords={tagKeywords}
        canonical={`/blogs/${blog.slug}`}
        ogImage={featuredImage}
        ogType="article"
        schema={schema}
        articleTags={blog.tags || []}
        publishedTime={blog.publish_date || blog.published_at}
        modifiedTime={blog.updated_at || blog.publish_date || blog.published_at}
        category={blog.category_name}
      />

      <article className="min-h-screen bg-white">
        {/* Spacer for fixed navbar */}
        <div className="h-[84px]" aria-hidden="true" />
        
        {/* Article Content Container */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Category Badge */}
          {blog.category_name && (
            <div className="mb-6">
              <span className="inline-block bg-[#d4af37] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full">
                {blog.category_name}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <img
                src="/faiz-alam-fazi.webp"
                alt="Faiz Alam Faizi"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#d4af37]"
              />
              <span className="font-semibold text-gray-900">Faiz Alam Faizi</span>
            </div>
            {blog.published_at && (
              <>
                <span>•</span>
                <time dateTime={blog.published_at}>
                  {new Date(blog.published_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </time>
              </>
            )}
            <span>•</span>
            <span>{Math.ceil((blog.content?.length || 0) / 1000)} min read</span>
          </div>

          {/* Share this article */}
          <div className="mb-10 pb-10 border-b border-gray-200">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Share this article
            </p>
            <ShareButtons
              title={blog.title}
              url={typeof window !== "undefined" ? `${window.location.origin}/blogs/${blog.slug}` : `https://faizalamfaizi.com/blogs/${blog.slug}`}
              variant="public"
            />
          </div>

          {/* Excerpt */}
          {blog.excerpt && (
            <div className="mb-12 pb-10 border-b border-gray-200">
              <p className="text-2xl text-gray-500 font-bold leading-relaxed font-serif italic">
                {blog.excerpt}
              </p>
            </div>
          )}

          {/* Featured Image with Description */}
          {featuredImage && (
            <figure className="mb-12">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-gray-50">
                <img
                  src={featuredImage}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
              
              {/* Image Caption/Description */}
              <figcaption className="mt-4 px-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#d4af37] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-900">Featured Image:</span> {blog.title} - 
                      Professional legal insights from Faiz Alam Faizi, Corporate, Technology, IP & Cyber Law Practice, with Legal Bridge LLP® leadership in Lahore, Pakistan.
                    </p>
                  </div>
                </div>
              </figcaption>
            </figure>
          )}

          {/* Main Content */}
          <div className="prose prose-lg bg-slate-100/50 border border-slate-200 p-3 rounded prose-slate max-w-none mb-12">
            <div 
              className="font-serif  text-gray-800 leading-relaxed"
              style={{
                fontSize: '19px',
                lineHeight: '1.75',
              }}
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Article Sections */}
          {blog.article_sections && blog.article_sections.length > 0 && (
            <div className="space-y-12 mb-12">
              {blog.article_sections.map((section, idx) => (
                <section key={idx} className="scroll-mt-24">
                  {section.heading && (
                    <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3 pb-3 ">
                      {section.heading}
                    </h2>
                  )}
                  {section.content && (
                    <div>
                    <div 
                      className="prose prose-lg prose-slate max-w-none font-serif text-gray-800 leading-relaxed"
                      style={{
                        fontSize: '19px',
                        lineHeight: '1.75',
                      }}
                      dangerouslySetInnerHTML={{ __html: section.content }}
                      
                   /> <span className="block mt-8 w-full h-2 border-b-2 border-[#d4af37]" /></div>
                    
                    
                  )}
                  
                </section>
               
              ))}
            </div>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="mb-12 pb-12 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/blogs?tag=${encodeURIComponent(tag.slug || tag.name)}`}
                    className="inline-block bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-full hover:bg-[#d4af37] hover:text-white transition-all duration-300"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {blog.faqs && blog.faqs.length > 0 && (
            <div className="mb-12 pb-12 border-b border-gray-200">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 flex items-center gap-3">
                  <span className="text-[#d4af37]">?</span>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-1">
                  {blog.faqs.map((faq, i) => (
                    <FAQItem key={i} faq={faq} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">
                Continue Reading
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedBlogs.map((relatedBlog) => (
                  <Link
                    key={relatedBlog.id}
                    to={`/blogs/${relatedBlog.slug}`}
                    className="group block bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-[#d4af37] hover:shadow-lg transition-all duration-300"
                  >
                    {relatedBlog.featured_image && (
                      <div className="aspect-video overflow-hidden bg-gray-100">
                        <img
                          src={getImageUrl(relatedBlog.featured_image)}
                          alt={relatedBlog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#d4af37] transition-colors mb-2 line-clamp-2">
                        {relatedBlog.title}
                      </h3>
                      {relatedBlog.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-3">
                          {relatedBlog.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Author Bio Section */}
        <div className="bg-gradient-to-br from-gray-50 to-white border-y border-gray-200">
          <div className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-shrink-0">
                <img
                  src="/faiz-alam-fazi.webp"
                  alt="Faiz Alam Faizi"
                  className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Written by Faiz Alam Faizi
                </h3>
                <p className="text-[#d4af37] font-semibold mb-4">
                  Corporate, Technology, IP & Cyber Law Practice | Legal Bridge LLP®
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Faiz Alam Faizi serves as Managing Director with Legal Bridge LLP®. His profile is aligned with Firm Leadership, Corporate Advisory, Technology Law, Intellectual Property Advisory, Cyber Law Practice, Client Service Systems, Legal Documentation Workflow, and Cross-Practice Coordination. He leads firm strategy, client-service standards, corporate advisory systems, legal documentation workflow, technology-sector legal support, IP documentation coordination, cyber law advisory coordination, and coordination across practice teams.
                </p>
                <p className="mb-4 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
                  {PROFESSIONAL_DISCLAIMER}
                </p>
                <div className="flex gap-3">
                  <a
                    href="tel:+923214277856"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#d4af37] hover:text-[#b8960b] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Contact
                  </a>
                  <span className="text-gray-300">|</span>
                  <Link
                    to="/about-faiz-alam-faizi"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#d4af37] hover:text-[#b8960b] transition-colors"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <FeaturedReviews />
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-left">
                <div className="inline-flex items-center gap-2 bg-[#d4af37]/20 backdrop-blur-sm rounded-full px-5 py-2 mb-6 border border-[#d4af37]/30">
                  <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-[#d4af37] text-sm font-bold uppercase tracking-wider">
                    Expert Legal Consultation
                  </span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-6 leading-tight">
                  Get Professional Legal Guidance Today
                </h2>
                
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  Whether you need strategic legal counsel, precise document drafting, or strong courtroom representation in Lahore, Pakistan, or cross-border matters, Legal Bridge LLP® provides expert solutions tailored to your needs.
                </p>

                {/* Features List */}
                <div className="space-y-4 mb-10">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Forum Procedure Review</p>
                      <p className="text-gray-400 text-sm">Experienced representation in complex legal matters</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Cross-Border Solutions</p>
                      <p className="text-gray-400 text-sm">International legal matters handled with precision</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#d4af37]/20 flex items-center justify-center mt-0.5">
                      <svg className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-semibold">Client-Focused Approach</p>
                      <p className="text-gray-400 text-sm">Personalized strategies for your unique situation</p>
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#d4af37] px-8 py-4 text-base font-bold text-white hover:bg-[#b8960b] transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Schedule Consultation
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  
                  <a
                    href="tel:+923214277856"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/30 px-8 py-4 text-base font-bold text-white hover:bg-white/20 hover:border-white transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    Call Now
                  </a>
                </div>
              </div>

              {/* Right Content - Contact Card */}
              <div className="lg:pl-8">
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                    <img
                      src="/faiz-alam-fazi.webp"
                      alt="Faiz Alam Faizi"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#d4af37] shadow-lg"
                    />
                    <div>
                      <h3 className="text-xl font-bold text-white">Faiz Alam Faizi</h3>
                      <p className="text-[#d4af37] text-sm font-semibold">Corporate, Technology, IP & Cyber Law Practice</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#d4af37]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Office Location</p>
                        <p className="text-white text-sm">12-UGF, Central Plaza<br />Garden Town, Lahore, Pakistan</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#d4af37]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Phone Numbers</p>
                        <a href="tel:+923214277856" className="text-white text-sm hover:text-[#d4af37] transition-colors block">
                          +92 321 4277856
                        </a>
                        <a href="tel:+971565750052" className="text-white text-sm hover:text-[#d4af37] transition-colors block">
                          +971 56 575 0052 (UAE)
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-[#d4af37]/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Email Address</p>
                        <a href="mailto:legalbridgelhr@gmail.com" className="text-white text-sm hover:text-[#d4af37] transition-colors">
                          legalbridgelhr@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <a
                      href="https://wa.me/923214277856"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-[#20BA5A] transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Message on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="bg-gray-50">
          <div className="max-w-4xl mx-auto px-6 py-16">
            <ContactFormSection />
          </div>
        </div>
      </article>
    </>
  );
}

// Contact Form Component
function ContactFormSection() {
  const [formStatus, setFormStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormStatus("");
    setIsSubmitting(true);

    const form = e.target;
    const data = new FormData(form);

    const name = data.get("name")?.toString().trim() || "";
    const email = data.get("email")?.toString().trim() || "";
    const phone = data.get("phone")?.toString().trim() || "";
    const message = data.get("message")?.toString().trim() || "";

    const subject = phone
      ? `Contact from ${name} | Phone: ${phone}`
      : `Contact from ${name}`;

    if (!name || !email || !message) {
      setFormStatus("validation-error");
      setIsSubmitting(false);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
        }),
      });

      const result = await res.json().catch(() => null);

      if (res.ok && result?.success) {
        setFormStatus("sent");
        form.reset();
      } else {
        console.error("API error:", result);
        setFormStatus("server-error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setFormStatus("server-error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#d4af37] to-[#b8960b] px-8 py-6">
          <h2 className="text-3xl font-serif font-bold text-white mb-2">
            Get in Touch
          </h2>
          <p className="text-white/90">
            Have a legal question? We're here to help.
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  Contact Information
                </h3>
                <div className="space-y-3 text-[15px]">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Office</p>
                      <p className="text-gray-600">12-UGF, Central Plaza, Garden Town<br />Lahore, Pakistan</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <a href="mailto:legalbridgelhr@gmail.com" className="text-[#d4af37] hover:text-[#b8960b]">
                        legalbridgelhr@gmail.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#d4af37] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <a href="tel:+923214277856" className="text-[#d4af37] hover:text-[#b8960b]">
                        +92 321 4277856
                      </a>
                      <br />
                      <a href="tel:+971565750052" className="text-[#d4af37] hover:text-[#b8960b]">
                        +971 56 575 0052 (UAE)
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                <a
                  href="tel:+923214277856"
                  className="inline-flex items-center gap-2 rounded-full bg-[#d4af37] px-6 py-3 text-sm font-bold text-white hover:bg-[#b8960b] transition-all duration-300 shadow-md hover:shadow-lg"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call Now
                </a>

                <a
                  href="https://wa.me/923214277856"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#d4af37] px-6 py-3 text-sm font-bold text-[#d4af37] hover:bg-[#d4af37] hover:text-white transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Send a Message
              </h3>
              
              <form className="space-y-4" noValidate onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    placeholder="John Doe"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="john@example.com"
                    required
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-phone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="+92 300 1234567"
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    placeholder="Describe your legal matter or question..."
                    required
                    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-[#d4af37] focus:ring-4 focus:ring-[#d4af37]/10 transition-all resize-none"
                  />
                </div>

                {formStatus === "validation-error" && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Please fill in all required fields.
                  </div>
                )}

                {formStatus === "server-error" && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Failed to send message. Please try again or contact us directly.
                  </div>
                )}

                {formStatus === "sent" && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-gradient-to-r from-[#d4af37] to-[#b8960b] px-6 py-4 text-base font-bold text-white hover:from-[#b8960b] hover:to-[#d4af37] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
