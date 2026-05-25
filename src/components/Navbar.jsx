import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

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
      ? "bg-[#080808]/90 backdrop-blur-xl border-b border-white/5"
      : "bg-[#F5F2ED]/90 backdrop-blur-xl border-b border-[#b0a090]"
    : "bg-transparent";

  const linkActive = dark ? "text-[#E8D5B7]" : "text-[#6B4F2A]";
  const linkInactive = dark ? "text-white/50 hover:text-white/80" : "text-[#4a4a4a] hover:text-black/70";
  const dotColor = dark ? "bg-[#E8D5B7]" : "bg-[#6B4F2A]";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500 ease-snappy ${navBg}`}>
      <nav className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <NavLink to="/" className="group flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E8D5B7] to-[#C4A882] flex items-center justify-center">
            <span className="text-[#080808] font-name text-xs font-bold tracking-tight">TS</span>
          </div>
          <span className={`font-name text-sm tracking-[0.15em] uppercase transition-colors duration-300 ${dark ? "text-white/60 group-hover:text-white/90" : "text-black/50 group-hover:text-black/80"}`}>
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
                  `relative px-4 py-2 text-[13px] tracking-[0.15em] uppercase font-body transition-colors duration-200 ${isActive ? linkActive : linkInactive}`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${dotColor}`} />}
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
            className={`btn-press w-9 h-9 rounded-full border flex items-center justify-center ${
              dark
                ? "border-white/15 text-white/50 hover:text-white hover:border-white/40"
                : "border-black/15 text-[#4a4a4a] hover:text-black/70 hover:border-black/30"
            }`}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>

          <NavLink
            to="/contact"
            className={`btn-press flex items-center gap-2 px-4 py-2 rounded-full border text-[12px] tracking-[0.15em] uppercase ${
              dark
                ? "border-white/15 text-white/60 hover:text-white hover:border-white/40"
                : "border-black/20 text-black/50 hover:text-black hover:border-black/40"
            }`}
          >
            Contact Me
          </NavLink>
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className={`btn-press w-8 h-8 rounded-full border flex items-center justify-center ${
              dark ? "border-white/15 text-white/50" : "border-black/15 text-[#4a4a4a]"
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
      <div className={`md:hidden transition-[max-height,opacity] duration-350 ease-snappy overflow-hidden ${menuOpen ? "max-h-80 border-b opacity-100" : "max-h-0 opacity-0"} ${dark ? "border-white/5" : "border-[#b0a090]"}`}>
        <ul className={`px-6 py-4 backdrop-blur-xl flex flex-col gap-1 ${dark ? "bg-[#0d0d0d]/95" : "bg-[#F0EDE8]/95"}`}>
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `block py-3 text-sm tracking-[0.2em] uppercase ${isActive ? linkActive : linkInactive}`
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