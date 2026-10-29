import { useEffect, useState, useCallback, memo } from 'react';
import { Link, NavLink,useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PublicNavbarDesktop from './public_navbar_desktop';
import PublicNavbarMobile from './Public_Navbar_Mobile';
import AdminNavbarDesktop from './admin_navbar_desktop';
import AdminNavbarMobile from './admin_Navbar_Mobile';
import AdminLoginModal from "./AdminLoginModal";
const desktopDropdownVariants = {
  hidden: { opacity: 0, y: 14, pointerEvents: 'none', transition: { duration: 0.18 } },
  visible: { opacity: 1, y: 0, pointerEvents: 'auto', transition: { duration: 0.22 } },
};

const mobileMenuVariants = {
  hidden: { opacity: 0, y: -18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28 } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.2 } },
};

const submenuVariants = {
  hidden: { height: 0, opacity: 0 },
  visible: { height: 'auto', opacity: 1, transition: { duration: 0.25 } },
  exit: { height: 0, opacity: 0, transition: { duration: 0.2 } },
};

const ChevronIcon = memo(({ open }) => (
  <svg
    className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
  </svg>
));
ChevronIcon.displayName = 'ChevronIcon';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const location = useLocation();
const navigate = useNavigate();

const isAdminSection = location.pathname.startsWith("/admin");

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("adminToken");
  closeMobile();
  navigate("/");
};

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 30);
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0);
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(handleScroll);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => { cancelAnimationFrame(frame); window.removeEventListener('scroll', handleScroll); };
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      {/* Scroll progress bar */}
      <div
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="fixed left-0 top-0 z-[70] h-[3px] bg-orange-500 transition-[width] duration-100"
        style={{ width: `${scrollProgress}%` }}
      />

      <header
        className={`fixed top-0 left-0 w-full z-[60] border-b border-white/10 transition-[background-color,box-shadow,backdrop-filter] duration-300 ${
          isScrolled
            ? 'bg-[rgba(10,10,10,0.78)] backdrop-blur-[16px] shadow-[0_10px_35px_rgba(0,0,0,0.18)]'
            : 'bg-[rgba(10,10,10,0.22)] backdrop-blur-[10px]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[84px]">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-3 shrink-0"
              onClick={closeMobile}
              aria-label="Faiz Alam Faizi — Home"
            >
              <img
                src="/faiz-alam-faizi-logo1.webp" 
                alt="Faiz Alam Faizi"
                className="h-19 w-auto object-contain"
                width="190"
                height="2"
                fetchPriority="high"
              />
            </Link>

            {/* Desktop Nav */}
          {isAdminSection ? (
  <AdminNavbarDesktop handleLogout={handleLogout} />
) : (
  <PublicNavbarDesktop
  openDropdown={openDropdown}
  setOpenDropdown={setOpenDropdown}
  ChevronIcon={ChevronIcon}
  desktopDropdownVariants={desktopDropdownVariants}
  openLoginModal={() => setLoginModalOpen(true)}
/>
)}
            {/* Mobile Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="xl:hidden inline-flex items-center justify-center w-11 h-11 rounded-full border border-white/15 text-white hover:border-orange-500 hover:text-orange-400 transition"
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {!mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 6l12 12M18 6L6 18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 xl:hidden bg-black/70 backdrop-blur-sm pt-[84px]"
          >
           {isAdminSection ? (
  <AdminNavbarMobile closeMobile={closeMobile} handleLogout={handleLogout} />
) : (
 <PublicNavbarMobile
  openDropdown={openDropdown}
  setOpenDropdown={setOpenDropdown}
  closeMobile={closeMobile}
  submenuVariants={submenuVariants}
  openLoginModal={() => setLoginModalOpen(true)}
/>
)}
          </motion.div>
        )}
      </AnimatePresence>

      {loginModalOpen && (
  <AdminLoginModal onClose={() => setLoginModalOpen(false)} />
)}
    </>
  );
}
