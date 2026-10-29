import { Link, NavLink } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { navItems } from "./publicNavitems";

function PublicNavbarMobile({
  openDropdown,
  setOpenDropdown,
  closeMobile,
  submenuVariants,
    openLoginModal,
}) {

  return (
    <nav
      aria-label="Mobile navigation"
      className="h-full overflow-y-auto bg-[#0f0f0f] border-t border-white/10 px-4 py-6"
    >
      <div className="space-y-3">
        {navItems.map((item, index) => {
          const hasChildren = !!item.children?.length;
          const isOpen = openDropdown === index;

          return (
            <div
              key={item.path}
              className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <NavLink
                  to={item.path}
                  onClick={() => {
                    if (!hasChildren) closeMobile();
                  }}
                  className={({ isActive }) =>
                    `flex-1 px-5 py-4 text-sm font-medium ${
                      isActive ? "text-orange-500" : "text-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>

                {hasChildren && (
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(isOpen ? null : index)}
                    className="px-5 py-4 text-white"
                    aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.label} menu`}
                    aria-expanded={isOpen}
                  >
                    <motion.svg
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </motion.svg>
                  </button>
                )}
              </div>

              {hasChildren && (
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      variants={submenuVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      className="overflow-hidden border-t border-white/10"
                    >
                      <div className="px-3 py-2">
                        {item.children.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            onClick={closeMobile}
                            className={({ isActive }) =>
                              `block rounded-xl px-4 py-3 text-sm transition ${
                                isActive
                                  ? "bg-orange-500 text-white"
                                  : "text-gray-300 hover:bg-white/10 hover:text-orange-400"
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}

        <a
          href="https://wa.me/923214277856"
          target="_blank"
          rel="noreferrer noopener"
          className="block w-full text-center rounded-2xl bg-orange-500 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-orange-600"
        >
          Get Started
        </a>

    <button
  type="button"
  onClick={() => {
    closeMobile();
    openLoginModal();
  }}
  className="
    inline-flex w-full items-center justify-center gap-2
    rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b]
    px-5 py-3 text-sm font-semibold text-white
    shadow-lg shadow-slate-900/20
    transition-all duration-300
    hover:-translate-y-0.5 hover:from-[#b8860b] hover:to-[#d4af37] hover:text-black hover:shadow-xl
    focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2
  "
>
  <span>Login</span>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12H3m12 0l-4-4m4 4l-4 4m7-10h3a2 2 0 012 2v8a2 2 0 01-2 2h-3"
    />
  </svg>
</button>
      </div>
    </nav>
  );
}

export default PublicNavbarMobile;