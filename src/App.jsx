import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
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
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

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
      <Navbar />
      <AnimatedRoutes />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <CustomCursor />
        <ThemedApp />
        <SpeedInsights />
        <Analytics />
      </Router>
    </ThemeProvider>
  );
}