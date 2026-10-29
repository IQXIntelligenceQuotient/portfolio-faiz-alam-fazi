import { useEffect, useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const CATEGORIES_API =
  import.meta.env.VITE_CATEGORIES_API || `${API_BASE_URL}/api/categories`;

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const [editCategory, setEditCategory] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
  });

  const token = localStorage.getItem("adminToken");

  const createSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await fetch(CATEGORIES_API, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch categories.");
      }

      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      alert(error.message || "Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) => {
      const value = search.toLowerCase();

      return (
        category.name?.toLowerCase().includes(value) ||
        category.slug?.toLowerCase().includes(value)
      );
    });
  }, [categories, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "name") {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: prev.slug ? prev.slug : createSlug(value),
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateCreateSlug = () => {
    setFormData((prev) => ({
      ...prev,
      slug: createSlug(prev.name),
    }));
  };

  const generateEditSlug = () => {
    setEditForm((prev) => ({
      ...prev,
      slug: createSlug(prev.name),
    }));
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Category name is required.");
      return;
    }

    if (!formData.slug.trim()) {
      alert("Category slug is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(CATEGORIES_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          slug: formData.slug.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Category creation failed.");
      }

      setFormData({
        name: "",
        slug: "",
      });

      alert("Category created successfully.");
      fetchCategories();
    } catch (error) {
      alert(error.message || "Something went wrong while creating category.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (category) => {
    setEditCategory(category);

    setEditForm({
      name: category.name || "",
      slug: category.slug || "",
    });
  };

  const closeEditModal = () => {
    setEditCategory(null);
    setEditForm({
      name: "",
      slug: "",
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!editCategory?.id) {
      alert("Category ID is missing.");
      return;
    }

    if (!editForm.name.trim()) {
      alert("Category name is required.");
      return;
    }

    if (!editForm.slug.trim()) {
      alert("Category slug is required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`${CATEGORIES_API}/${editCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          slug: editForm.slug.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Category update failed.");
      }

      alert("Category updated successfully.");
      closeEditModal();
      fetchCategories();
    } catch (error) {
      alert(error.message || "Something went wrong while updating category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category? Existing posts may lose this category."
    );

    if (!confirmed) return;

    try {
      setDeletingId(categoryId);

      const response = await fetch(`${CATEGORIES_API}/${categoryId}`, {
        method: "DELETE",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Category delete failed.");
      }

      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );

      alert("Category deleted successfully.");
    } catch (error) {
      alert(error.message || "Something went wrong while deleting category.");
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
                Manage Categories
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Create, update, search, and delete blog categories for better
                content structure.
              </p>
            </div>

            <div className="rounded-full border border-[#d4af37]/20 bg-[#d4af37]/10 px-5 py-3 text-sm font-bold text-[#d4af37]">
              Total Categories: {categories.length}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <section className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              Create New Category
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Add a clear category name with an SEO-friendly slug.
            </p>

            <form onSubmit={handleCreateCategory} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Corporate Law"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-200">
                    Slug
                  </label>

                  <button
                    type="button"
                    onClick={generateCreateSlug}
                    className="text-xs font-bold text-[#d4af37] hover:text-white"
                  >
                    Generate
                  </button>
                </div>

                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  placeholder="corporate-law"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating Category..." : "Create Category"}
              </button>
            </form>
          </section>

          <section className="rounded-[28px] border border-white/10 bg-[#080b13]/95 p-6 shadow-2xl">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  All Categories
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Search, edit, or remove existing categories.
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20 md:max-w-xs"
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10">
              <div className="max-h-[500px] overflow-auto">
                <table className="w-full min-w-[700px] text-left">
                  <thead className="border-b border-white/10 bg-white/[0.03]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                        ID
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                        Category Name
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                        Slug
                      </th>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d4af37]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-12 text-center text-slate-400"
                        >
                          Loading categories...
                        </td>
                      </tr>
                    ) : filteredCategories.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-12 text-center text-slate-400"
                        >
                          No categories found.
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category) => (
                        <tr
                          key={category.id}
                          className="border-b border-white/10 transition hover:bg-white/[0.03]"
                        >
                          <td className="px-5 py-4 text-sm text-slate-400">
                            #{category.id}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-[#d4af37]/10 px-3 py-1 text-sm font-bold text-[#d4af37]">
                              {category.name}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-300">
                            {category.slug}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => openEditModal(category)}
                                className="rounded-full bg-[#d4af37] px-4 py-2 text-xs font-black text-black transition hover:bg-[#b8860b]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                disabled={deletingId === category.id}
                                className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {deletingId === category.id
                                  ? "Deleting..."
                                  : "Delete"}
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
      </div>

      {editCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[28px] border border-[#d4af37]/20 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">
                  Edit Category
                </p>

                <h2 className="mt-2 text-2xl font-black text-white">
                  Update Category
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

            <form onSubmit={handleUpdateCategory} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-200">
                  Category Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-semibold text-slate-200">
                    Slug
                  </label>

                  <button
                    type="button"
                    onClick={generateEditSlug}
                    className="text-xs font-bold text-[#d4af37] hover:text-white"
                  >
                    Generate
                  </button>
                </div>

                <input
                  type="text"
                  name="slug"
                  value={editForm.slug}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Updating Category..." : "Update Category"}
              </button>

              <button
                type="button"
                onClick={closeEditModal}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Categories;
