import { Link, NavLink } from "react-router-dom";
import { adminNavItems } from "./adminNavItems";

function AdminNavbarDesktop({ handleLogout }) {
  return (
    <>
      <nav
        aria-label="Admin desktop navigation"
        className="hidden xl:flex items-center gap-2 rounded-full border border-[#d4af37]/20 bg-[#080b13]/70 px-3 py-2 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl"
      >
    <div className="ml-auto mr-2 flex w-fit items-center gap-2 rounded-full border border-yellow-400/20 bg-gradient-to-r from-yellow-400/10 via-yellow-500/5 to-transparent px-3 py-1.5 shadow-sm shadow-yellow-500/10 backdrop-blur-md">
  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-yellow-400">
    Admin
  </span>

  <span className="h-4 w-px bg-yellow-400/25" />

  <span className="rounded-full w-20 border border-yellow-300/20 bg-slate-950/40 px-5 py-0.5 text-[15px] font-medium text-slate-300 shadow-sm shadow-yellow-300/20">
    <span className="text-yellow-300">v- </span>
    <span className="text-white">2.0</span>
  </span>
</div>

        {adminNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              `group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-[#b8860b] to-[#d4af37] text-black shadow-lg shadow-yellow-900/25"
                  : "text-slate-200 hover:bg-white/10 hover:text-[#d4af37]"
              }`
            }
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs transition duration-300 group-hover:bg-[#d4af37] group-hover:text-black">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="hidden xl:flex items-center px-5 py-2">
        {/* <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#d4af37]/40 hover:text-[#d4af37]"
        >
          View Site
        </Link> */}

        {handleLogout && (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-5 py-2.5 text-sm font-semibold text-red-300 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        )}
      </div>
    </>
  );
}

export default AdminNavbarDesktop;