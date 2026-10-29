import { Link, NavLink } from "react-router-dom";
import { adminNavItems } from "./adminNavItems";

function AdminNavbarMobile({ closeMobile, handleLogout }) {
  return (
    <nav
      aria-label="Admin mobile navigation"
      className="h-full overflow-y-auto border-t border-[#d4af37]/20 bg-[#070a12] px-4 py-6"
    >
      <div className="mb-5 rounded-3xl border border-[#d4af37]/20 bg-gradient-to-br from-[#111827] to-[#05070d] p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d4af37] text-lg font-black text-black">
            A
          </span>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#d4af37]">
              Admin Panel
            </p>
            <h3 className="mt-1 text-lg font-bold text-white">
              Blog Control Center
            </h3>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-300">
          Manage your website from this secure section.
        </p>
      </div>

      <div className="space-y-2">
        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            onClick={closeMobile}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "border-[#d4af37]/50 bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-black shadow-lg shadow-yellow-900/20"
                  : "border-white/10 bg-white/[0.03] text-slate-200 hover:border-[#d4af37]/30 hover:bg-white/10 hover:text-[#d4af37]"
              }`
            }
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-xs">
                {item.icon}
              </span>
              {item.label}
            </span>

            <span className="text-xs opacity-70">›</span>
          </NavLink>
        ))}

        <div className="pt-4">
          {/* <Link
            to="/"
            onClick={closeMobile}
            className="flex w-full items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:border-[#d4af37]/40 hover:text-[#d4af37]"
          >
            View Public Website
          </Link> */}

          {handleLogout && (
            <button
              type="button"
              onClick={() => {
                closeMobile();
                handleLogout();
              }}
              className="mt-3 flex w-full items-center justify-center rounded-full bg-red-500 px-5 py-3 text-sm font-bold text-white transition duration-300 hover:bg-red-600"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbarMobile;