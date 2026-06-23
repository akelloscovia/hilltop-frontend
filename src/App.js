import React, { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

// Utilities
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { SkeletonPage } from "./components/Skeleton";

// Layout + UI
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./components/AdminLogin";

// PUBLIC PAGES
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Admissions = lazy(() => import("./pages/Admissions"));
const Academics = lazy(() => import("./pages/Academics"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const ParentPortal = lazy(() => import("./pages/ParentPortal"));

// ADMIN AUTH


// DASHBOARD LAYOUT
const DashboardLayout = lazy(() => import("./components/Dashboardlayout"));

// DASHBOARD PAGES
const HomeDashboard = lazy(() => import("./dashboard/homedashboard"));
const AboutDashboard = lazy(() => import("./dashboard/aboutdashboard"));
const AdmissionsDashboard = lazy(() => import("./dashboard/admissionsdashboard"));
const AcademicsDashboard = lazy(() => import("./dashboard/academicsdashboard"));
const GalleryDashboard = lazy(() => import("./dashboard/gallerydashboard"));
const ContactDashboard = lazy(() => import("./dashboard/contactdashboard"));
const ManageUsersDashboard = lazy(() => import("./dashboard/manageusersdashboard"));
const FooterDashboard = lazy(() => import("./dashboard/footerdashboard"));

// EXTRA ADMIN PAGE
const ApplicationsViewer = lazy(() => import("./pages/ApplicationsViewer"));

// LOADING COMPONENT
const LoadingSpinner = () => (
  <div style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "400px"
  }}>
    <SkeletonPage />
  </div>
);

function App() {
  const location = useLocation();

  // Detect admin routes
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <ErrorBoundary>
      <GoogleAnalytics />
      <ToastContainer />

      <div className="App">

        {/* ✅ Hide Navbar on admin pages */}
        {!isAdminRoute && <Navbar />}

        <main>
          <Suspense fallback={<LoadingSpinner />}>

            <Routes>

              {/* 🌍 PUBLIC SITE */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/parent-portal" element={<ParentPortal />} />

              {/* 🔐 ADMIN LOGIN */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* 📄 APPLICATIONS VIEWER */}
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute>
                    <ApplicationsViewer />
                  </ProtectedRoute>
                }
              />

              {/* 🧭 ADMIN DASHBOARD */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomeDashboard />} />
                <Route path="home" element={<HomeDashboard />} />
                <Route path="about" element={<AboutDashboard />} />
                <Route path="admissions" element={<AdmissionsDashboard />} />
                <Route path="academics" element={<AcademicsDashboard />} />
                <Route path="gallery" element={<GalleryDashboard />} />
                <Route path="contact" element={<ContactDashboard />} />
                <Route path="users" element={<ManageUsersDashboard />} />
                <Route path="footer" element={<FooterDashboard />} />
              </Route>

              {/* ❌ 404 PAGE */}
              <Route
                path="*"
                element={
                  <div style={{ padding: "2rem", textAlign: "center" }}>
                    Page not found
                  </div>
                }
              />

            </Routes>

          </Suspense>
        </main>

        {/* ✅ Hide Footer on admin pages */}
        {!isAdminRoute && <Footer />}

      </div>
    </ErrorBoundary>
  );
}

export default App;