import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

// Utility Components
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import GoogleAnalytics from "./components/GoogleAnalytics";
import { SkeletonPage } from "./components/Skeleton";

// Components
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded Public Pages (code splitting)
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Admissions = lazy(() => import("./pages/Admissions"));
const Academics = lazy(() => import("./pages/Academics"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));

// Lazy-loaded Admin Pages / Dashboard
const AdminLogin = lazy(() => import("./components/Adminlogin"));
const DashboardLayout = lazy(() => import("./components/Dashboardlayout"));
const HomeDashboard = lazy(() => import("./dashboard/homedashboard"));
const AboutDashboard = lazy(() => import("./dashboard/aboutdashboard"));
const AdmissionsDashboard = lazy(() => import("./dashboard/admissionsdashboard"));
const AcademicsDashboard = lazy(() => import("./dashboard/academicsdashboard"));
const GalleryDashboard = lazy(() => import("./dashboard/gallerydashboard"));
const ContactDashboard = lazy(() => import("./dashboard/contactdashboard"));
const ApplicationsViewer = lazy(() => import("./pages/ApplicationsViewer"));

// Loading fallback component
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
  return (
    <ErrorBoundary>
      <GoogleAnalytics />
      <ToastContainer />
      <div className="App">
        {/* Navbar */}
        <Navbar />

        {/* Routes */}
        <main>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* PUBLIC */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/admissions" element={<Admissions />} />
              <Route path="/academics" element={<Academics />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />

              {/* ADMIN LOGIN */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* ADMIN APPLICATIONS VIEWER */}
              <Route
                path="/admin/applications"
                element={
                  <ProtectedRoute>
                    <ApplicationsViewer />
                  </ProtectedRoute>
                }
              />

              {/* ADMIN DASHBOARD */}
              <Route path="/admin/dashboard" element={<DashboardLayout />}>
                <Route index element={<HomeDashboard />} />
                <Route path="home" element={<HomeDashboard />} />
                <Route path="about" element={<AboutDashboard />} />
                <Route path="admissions" element={<AdmissionsDashboard />} />
                <Route path="academics" element={<AcademicsDashboard />} />
                <Route path="gallery" element={<GalleryDashboard />} />
                <Route path="contact" element={<ContactDashboard />} />
              </Route>

              {/* 404 */}
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

        {/* Footer */}
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;