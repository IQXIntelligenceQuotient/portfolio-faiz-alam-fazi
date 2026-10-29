import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AUTH_API =
  import.meta.env.VITE_AUTH_API || `${API_BASE_URL}/api/auth`;

function AdminLoginModal({ onClose }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation
    if (!formData.email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${AUTH_API}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password.trim(),
        }),
      });

      // Check content type before parsing — catches HTML error pages (503, 504 etc.)
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          `Server returned status ${response.status}. The backend may be offline or unreachable. Please try again later.`
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed. Please check your credentials.");
      }

      // Save token and user info to localStorage
      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        
        // Backend returns 'admin' not 'user'
        if (data.admin) {
          localStorage.setItem("adminUser", JSON.stringify(data.admin));
        }

        // Close modal and redirect to admin dashboard
        onClose();
        navigate("/admin");
      } else {
        throw new Error("No token received from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Admin login popup"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[28px] border border-[#d4af37]/25 bg-[#070a12] p-6 shadow-[0_30px_100px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-[#d4af37]/40 hover:text-[#d4af37]"
          aria-label="Close login popup"
        >
          ×
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-9 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r from-black to-gray-700 text-2xl font-black text-black shadow-md shadow-white/20">
            <img
                src="/faiz-alam-faizi-logo1.webp" 
                alt="Faiz Alam Faizi"
                className="h-19 w-auto object-contain"
                width="100"
                height="3"
                fetchPriority="high"
              />
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#d4af37]">
            Admin Access
          </p>

          <h2 className="mt-3 text-3xl font-bold text-white">
            Login to Dashboard
          </h2>

        
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <div className="flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="write you email here"
              autoComplete="email"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-200">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 pr-20 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4af37]/60 focus:ring-2 focus:ring-[#d4af37]/20"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#d4af37] transition hover:text-white"
                tabIndex="-1"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-400">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-white/10 accent-[#d4af37]"
              />
              Remember me
            </label>

            <button
              type="button"
              className="text-xs font-semibold text-[#d4af37] transition hover:text-white"
              onClick={() => alert("Please contact the administrator to reset your password.")}
            >
              Forgot password?
            </button>
          </div> */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#b8860b] to-[#d4af37] px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-yellow-900/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login Now"}
          </button>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="text-center text-xs leading-5 text-slate-400">
              <span className="font-bold text-[#d4af37]">  <p>
            Enter admin credentials to access the blog control panel.
          </p></span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminLoginModal;