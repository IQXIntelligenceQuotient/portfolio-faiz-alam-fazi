import {Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { navItems } from "./publicNavitems";
function PublicNavbarDesktop({
  openDropdown,
  setOpenDropdown,
  ChevronIcon,

  desktopDropdownVariants,
  openLoginModal,
}) {


  return (
<>
    <nav aria-label="Main navigation" className="hidden xl:flex items-center gap-7">
      {navItems.map((item, index) => {
        const hasChildren = !!item.children?.length;
        const isOpen = openDropdown === index;

        return (
          <div
            key={item.path}
            className="relative"
            onMouseEnter={() => hasChildren && setOpenDropdown(index)}
            onMouseLeave={() => hasChildren && setOpenDropdown(null)}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `relative px-4 py-3 text-[15px] font-medium transition-colors duration-300 rounded-full ${
                  isActive ? 'text-orange-500' : 'text-white hover:text-orange-400'
                }`
              }
            >
              <span className="flex items-center gap-2">
                {item.label}
                {hasChildren && <ChevronIcon open={isOpen} />}
              </span>
            </NavLink>

            {hasChildren && (
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    variants={desktopDropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    role="menu"
                    className="absolute left-0 top-full z-50 pt-4 min-w-[310px]"
                  >
                    <div className="rounded-2xl border border-white/10 bg-[#0f0f0f]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-3">
                      <div className="max-h-[420px] overflow-y-auto">
                        {item.children.map((subItem) => (
                          <NavLink
                            key={subItem.path}
                            to={subItem.path}
                            className={({ isActive }) =>
                              `block rounded-xl px-4 py-3 text-sm transition duration-300 ${
                                isActive
                                  ? 'bg-orange-500 text-white'
                                  : 'text-gray-200 hover:bg-white/10 hover:text-orange-400'
                              }`
                            }
                          >
                            {subItem.label}
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        );
      })}
    </nav>
      {/* Desktop CTA */}
            <div className="hidden xl:flex gap-2 items-center">
              <a
                href="https://wa.me/923214277856"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-orange-600"
              >
                Get Started
              </a>
              <button
  type="button"
  onClick={openLoginModal}
  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:-translate-y-0.5 hover:from-[#b8460b] hover:to-[#d9af37] hover:text-black hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2"
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
</>
    
  );
}

export default PublicNavbarDesktop;
