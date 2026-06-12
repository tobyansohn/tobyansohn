import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Home" },
  { to: "/developer", label: "Dev" },
  { to: "/photography", label: "Photo" },
  { to: "/videography", label: "Video" },
  { to: "/contact", label: "Contact" },
];

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="5" />
      <path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const { dark, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location]);

  const navBg = scrolled
    ? dark
      ? "bg-[#0E1812]/90 backdrop-blur-xl border-b border-white/5"
      : "bg-[#EFE6D2]/90 backdrop-blur-xl border-b border-[#C8B996]"
    : "bg-transparent";

  const linkActive = dark ? "text-[#E8B257]" : "text-[#2D4A2B]";
  const linkInactive = dark ? "text-white/50 hover:text-white/80" : "text-[#4A3D2D] hover:text-black/70";
  const dotColor = dark ? "bg-[#E8B257]" : "bg-[#2D4A2B]";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ease-snappy ${navBg}`}>
      <nav className="px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="group flex items-center gap-2.5">
          <div className={`w-7 h-7 flex items-center justify-center border transition-colors duration-300 ${dark ? "border-[#E8B257]/60 group-hover:border-[#E8B257]" : "border-[#2D4A2B]/50 group-hover:border-[#2D4A2B]"}`}>
            <span className={`font-name text-[11px] font-semibold tracking-tight ${dark ? "text-[#E8B257]" : "text-[#2D4A2B]"}`}>TS</span>
          </div>
          <span className={`text-[12px] font-medium tracking-[0.24em] uppercase transition-colors duration-300 ${dark ? "text-white/65 group-hover:text-white/90" : "text-[#4A3D2D] group-hover:text-black/80"}`}>
            Tobyan Sohn
          </span>
        </NavLink>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `relative px-4 py-2 text-[12px] font-medium tracking-[0.22em] uppercase transition-colors duration-200 ${isActive ? linkActive : linkInactive}`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && <motion.span layoutId="nav-dot" className={`absolute -bottom-0.5 left-4 right-4 h-px ${dotColor}`} transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`btn-press w-9 h-9 border flex items-center justify-center ${
              dark
                ? "border-white/15 text-white/50 hover:text-white hover:border-white/40"
                : "border-black/15 text-[#4A3D2D] hover:text-black/70 hover:border-black/30"
            }`}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          <NavLink
            to="/contact"
            className={`group inline-flex items-center gap-1.5 pb-1 border-b text-[11px] font-medium tracking-[0.22em] uppercase transition-colors duration-200 ${
              dark
                ? "border-[#E8B257]/50 text-[#E8B257] hover:border-[#E8B257]"
                : "border-[#2D4A2B]/50 text-[#2D4A2B] hover:border-[#2D4A2B]"
            }`}
          >
            Contact Me
            <span className="transition-transform duration-300 group-hover:translate-x-0.5">&#8599;</span>
          </NavLink>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`btn-press w-8 h-8 border flex items-center justify-center ${
              dark ? "border-white/15 text-white/50" : "border-black/15 text-[#4A3D2D]"
            }`}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className="flex flex-col gap-1.5 p-2"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-px transition-[transform,opacity] duration-250 ease-snappy ${dark ? "bg-white" : "bg-black"} ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block w-4 h-px transition-[transform,opacity] duration-250 ease-snappy ${dark ? "bg-white/60" : "bg-black/40"} ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px transition-[transform,opacity] duration-250 ease-snappy ${dark ? "bg-white" : "bg-black"} ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-[max-height,opacity] duration-350 ease-snappy overflow-hidden ${menuOpen ? "max-h-80 border-b opacity-100" : "max-h-0 opacity-0"} ${dark ? "border-white/5" : "border-[#C8B996]"}`}>
        <ul className={`px-6 py-4 backdrop-blur-xl flex flex-col gap-1 ${dark ? "bg-[#16221C]/95" : "bg-[#E6DBC0]/95"}`}>
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `block py-3 text-[13px] font-medium tracking-[0.22em] uppercase ${isActive ? linkActive : linkInactive}`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}