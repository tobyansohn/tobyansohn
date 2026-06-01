import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
// Heavy / off-home routes are split so leaflet + exifr stay out of the initial bundle.
const Developer = lazy(() => import("./pages/Developer.jsx"));
const Photography = lazy(() => import("./pages/Photography.jsx"));
const Videography = lazy(() => import("./pages/Videography.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
import CustomCursor from "./components/CustomCursor.jsx";
import PageTransition from "./components/PageTransition.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
import GrainOverlay from "./components/GrainOverlay.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import Footer from "./components/Footer.jsx";

const PAGE_ORDER = ["/", "/developer", "/photography", "/videography", "/contact"];

function KeyboardNav() {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
      const idx = PAGE_ORDER.indexOf(location.pathname);
      if (e.key === "ArrowRight" && idx < PAGE_ORDER.length - 1) navigate(PAGE_ORDER[idx + 1]);
      if (e.key === "ArrowLeft" && idx > 0) navigate(PAGE_ORDER[idx - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [location.pathname, navigate]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <PageTransition locationKey={location.pathname}>
      <Suspense fallback={null}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/developer" element={<Developer />} />
          <Route path="/photography" element={<Photography />} />
          <Route path="/videography" element={<Videography />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </PageTransition>
  );
}

function ThemedApp() {
  const { dark } = useTheme();
  return (
    <div className={`min-h-screen font-body overflow-x-hidden transition-colors duration-500 ${dark ? "bg-[#0E1812] text-white" : "bg-[#EFE6D2] text-[#2A2014]"}`}>
      <ScrollProgress />
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <CustomCursor />
        <GrainOverlay />
        <KeyboardNav />
        <ThemedApp />
        <SpeedInsights />
        <Analytics />
      </Router>
    </ThemeProvider>
  );
}