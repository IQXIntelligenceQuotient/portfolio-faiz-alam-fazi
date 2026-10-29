import React from "react";
import { Link } from "react-router-dom";
import { Clock, Tag, ArrowRight } from "lucide-react";

// Helper to get image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const path = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${(import.meta.env.VITE_API_BASE_URL || "https://api.faizalamfaizi.com")}${path}`;
};

export default function BlogCard({ blog, priority = false }) {
  if (!blog) return null;

  const title = blog.title || "Legal Article";
  const description = blog.excerpt || blog.meta_description || "Read this practical legal and business guide for clients in Pakistan and overseas.";
  const category = blog.category_name || blog.category || "Legal Services";
  const readTime = `${Math.ceil((blog.content?.length || 0) / 1000)} min read`;
  const publishDate = blog.published_at 
    ? new Date(blog.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : "";
  const slug = blog.slug || "#";
  const image = getImageUrl(blog.featured_image) || "/images/blogs/default-blog.jpg";
  const imageAlt = blog.title;

  return (
<article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:border-orange-500/40 hover:bg-white/[0.05]">
  <Link
    to={`/blogs/${slug}`}
    className="block aspect-[16/9] overflow-hidden"
    tabIndex={-1}
    aria-hidden="true"
  >
    <img
      src={image}
      alt={imageAlt}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      width="640"
      height="360"
    />
  </Link>

  <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5">
    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 text-xs text-gray-400">
      <span className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full bg-orange-500/15 px-3 py-1 font-medium text-orange-400 sm:max-w-[220px]">
        <Tag className="h-3 w-3 shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">
          {category}
        </span>
      </span>

      <span className="inline-flex shrink-0 items-center gap-1">
        <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
        {readTime}
      </span>

      {publishDate ? (
        <time className="shrink-0" dateTime={blog.published_at}>
          {publishDate}
        </time>
      ) : null}
    </div>

    <h2 className="text-base font-semibold leading-snug text-white transition-colors line-clamp-2 group-hover:text-orange-400">
      <Link to={`/blogs/${slug}`}>{title}</Link>
    </h2>

    <p className="flex-1 text-sm leading-relaxed text-gray-400 line-clamp-3">
      {description}
    </p>

    <Link
      to={`/blogs/${slug}`}
      className="mt-auto inline-flex items-center gap-2 text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
      aria-label={`Read more about ${title}`}
    >
      Read More
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  </div>
</article>
  );
}
