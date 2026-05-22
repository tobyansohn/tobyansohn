import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Developer from "./pages/Developer.jsx";
import Photography from "./pages/Photography.jsx";
import Videography from "./pages/Videography.jsx";
import Contact from "./pages/Contact.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import PageTransition from "./components/PageTransition.jsx";
import ScrollProgress from "./components/ScrollProgress.jsx";
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
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/photography" element={<Photography />} />
        <Route path="/videography" element={<Videography />} />
<Route path="/contact" element={<Contact />} />
      </Routes>
    </PageTransition>
  );
}

function ThemedApp() {
  const { dark } = useTheme();
  return (
    <div className={`min-h-screen font-body overflow-x-hidden transition-colors duration-500 ${dark ? "bg-[#080808] text-white" : "bg-[#F5F2ED] text-[#1a1a1a]"}`}>
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
        <KeyboardNav />
        <ThemedApp />
        <SpeedInsights />
        <Analytics />
      </Router>
    </ThemeProvider>
  );
}