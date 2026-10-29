// ============================================
// NEW.JSX - UI COMPONENTS TO ADD TO THE FORM
// ============================================
// Add these sections to your form in New.jsx

// ============================================
// 1. TAGS MULTI-SELECT SECTION
// Add this in the sidebar (aside section), after Category dropdown
// ============================================
<div>
  <label className="mb-2 block text-sm font-semibold text-slate-200">
    Tags
  </label>

  {tags.length === 0 ? (
    <p className="text-sm text-slate-500">Loading tags...</p>
  ) : (
    <div className="max-h-48 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => toggleTag(tag.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
              selectedTags.includes(tag.id)
                ? "bg-[#d4af37] text-black"
                : "border border-white/10 bg-white/5 text-slate-300 hover:border-[#d4af37]/40"
            }`}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  )}

  <p className="mt-2 text-xs text-slate-500">
    Selected: {selectedTags.length} tag{selectedTags.length !== 1 ? "s" : ""}
  </p>
</div>

// ============================================
// 2. FAQ REPEATER SECTION
// Add this as a new section in the main content area (left column)
// Place it after the "SEO Settings" section
// ============================================
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

// ============================================
// 3. ARTICLE SECTIONS REPEATER
// Add this as another new section in the main content area
// Place it after the FAQ section
// ============================================
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

// ============================================
// END OF UI COMPONENTS
// ============================================
