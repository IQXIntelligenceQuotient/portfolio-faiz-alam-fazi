import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./common/Header";
import Footer from "./common/Footer";
import StickyActions from "./common/StickyActions.jsx";
import ScrollToTop from "./common/ScrollToTop.jsx";

// Lazy-load all pages for code splitting
const Home = lazy(() => import("./pages/Home"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const Contact = lazy(() => import("./pages/Contact"));
const TechnologyPractice = lazy(() => import("./pages/TechnologyPractice.jsx"));
const Legal_Consultant = lazy(() => import("./pages/Service/Legal_Consultant"));
const Representation = lazy(() => import("./pages/Service/Representation"));
const DocumentDrafting = lazy(() => import("./pages/Service/DocumentDrafting"));
const ExtensiveResearch = lazy(() => import("./pages/Service/ExtensiveResearch"));
const Skillful_Negotiations = lazy(() => import("./pages/Service/Skillful_Negotiations"));
const CourtroomRepresentation = lazy(() => import("./pages/Service/Courtroom_Representation"));
const Business_Consultant = lazy(() => import("./pages/Service/Business_Consultant"));
const Life_Coach = lazy(() => import("./pages/Service/Life_Coach"));
const Company_Formation = lazy(() => import("./pages/Service/company_Formation.jsx"));
const Vat_And_Tax = lazy(() => import("./pages/Service/Vat_And_Tax.jsx"));
const Accountancy = lazy(() => import("./pages/Service/Accountancy.jsx"));
const Intellectual_Property = lazy(() => import("./pages/Service/Intellectual_Property.jsx"));
const NadraConsultancy = lazy(() => import("./pages/Service/NadraConsultancy.jsx"));
const Insurance_Consultancy = lazy(() => import("./pages/Service/Insurance_Consultancy.jsx"));
const Visit_Visa_Consultation = lazy(() => import("./pages/Service/Visit_Visa_Consultation.jsx"));
const BlogList = lazy(() => import("./pages/Blog/BlogList"));
const BlogPost = lazy(() => import("./pages/Blog/BlogPost"));
const Reviews = lazy(() => import("./pages/Reviews"));
const AboutFaizAlamFaizi = lazy(() => import("./pages/about_faiz-alam_faizi.jsx"));

const Catagories = lazy(() => import("./Admin/Categories.jsx"));
const Posts = lazy(() => import("./Admin/Posts.jsx"));
const Tags = lazy(() => import("./Admin/Tags.jsx"));  
const ReviewsAdmin = lazy(() => import("./Admin/Reviews.jsx"));
const Dashboard = lazy(() => import("./Admin/Dashboard.jsx"));
const New = lazy(()=> import("./Admin/New.jsx"));
const ContactAdmin = lazy(()=> import("./Admin/Contacts.jsx"));



function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="flex min-h-[60vh] items-center justify-center bg-black"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Skip to main content
      </a>
      <Navbar />
      <ScrollToTop />
      <StickyActions />
      <main id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/technology-ip-cyber-law-pakistan" element={<TechnologyPractice />} />
            <Route path="/Legal_Consultant" element={<Legal_Consultant />} />
            <Route path="/Representation" element={<Representation />} />
            <Route path="/DocumentDrafting" element={<DocumentDrafting />} />
            <Route path="/ExtensiveResearch" element={<ExtensiveResearch />} />
            <Route path="/Skillful_Negotiations" element={<Skillful_Negotiations />} />
            <Route path="/Courtroom_Representation" element={<CourtroomRepresentation />} />
            <Route path="/Business_Consultant" element={<Business_Consultant />} />
            <Route path="/life-coach" element={<Life_Coach />} />
            <Route path="/company_formation" element={<Company_Formation />} />
            <Route path="/vat_and_tax" element={<Vat_And_Tax />} />
            <Route path="/accountancy" element={<Accountancy />} />
            <Route path="/intellectual_property" element={<Intellectual_Property />} />
            <Route path="/nadra_consultancy" element={<NadraConsultancy />} />
            <Route path="/insurance_consultancy" element={<Insurance_Consultancy />} />
            <Route path="/visit_visa_consultation" element={<Visit_Visa_Consultation />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/:slug" element={<BlogPost />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/about-faiz-alam-faizi" element={<AboutFaizAlamFaizi />} />
            {/* Admin Routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/categories" element={<Catagories />} />
            <Route path="/admin/posts" element={<Posts />} />
            <Route path="/admin/tags" element={<Tags />} />
            <Route path="/admin/reviews" element={<ReviewsAdmin />} />
            <Route path="/admin/new" element={<New />} />
            <Route path="/admin/contacts" element={<ContactAdmin />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
