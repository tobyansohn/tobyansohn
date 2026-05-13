import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const roles = ["Software Developer", "Photographer", "Videographer", "Creator"];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function Card({ to, label, sub, accent, dark }) {
  return (
    <Link
      to={to}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 p-8 flex flex-col justify-between min-h-[200px] ${
        dark
          ? "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]"
          : "border-black/8 bg-black/[0.03] hover:bg-black/[0.06]"
      }`}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 30% 50%, ${accent}22 0%, transparent 70%)` }}
      />
      <span className={`text-[11px] tracking-[0.3em] uppercase ${dark ? "text-white/30" : "text-black/30"}`}>{sub}</span>
      <div>
        <h3 className={`font-display text-2xl mb-3 transition-colors duration-300 ${dark ? "text-white/90 group-hover:text-white" : "text-black/80 group-hover:text-black"}`}>{label}</h3>
        <span className={`inline-flex items-center gap-2 text-[12px] tracking-[0.15em] uppercase transition-colors duration-300 ${dark ? "text-white/40 group-hover:text-white/70" : "text-black/35 group-hover:text-black/60"}`}>
          View Work
          <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { dark } = useTheme();
  const [roleIndex, setRoleIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [bioRef, bioInView] = useInView();
  const [cardsRef, cardsInView] = useInView();

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => { setRoleIndex(i => (i + 1) % roles.length); setFade(true); }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const muted = dark ? "text-white/45" : "text-black/45";
  const superMuted = dark ? "text-white/30" : "text-black/30";
  const accent = dark ? "text-[#E8D5B7]" : "text-[#8B6F47]";
  const accentBg = dark ? "bg-white" : "bg-[#1a1a1a]";
  const accentText = dark ? "text-[#080808]" : "text-white";
  const accentHover = dark ? "hover:bg-[#E8D5B7]" : "hover:bg-[#3a3a3a]";
  const borderBtn = dark ? "border-white/20 text-white hover:border-white/50" : "border-black/20 text-black/70 hover:border-black/50";

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 pt-20 overflow-hidden">
        <div className={`absolute inset-0 opacity-[0.03] ${dark ? "" : "invert"}`}
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: "80px 80px" }}
        />
        <div className={`absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[120px] pointer-events-none ${dark ? "bg-[#E8D5B7]/5" : "bg-[#C4A882]/10"}`} />
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[100px] pointer-events-none ${dark ? "bg-[#8B9DC3]/5" : "bg-[#8B9DC3]/8"}`} />

        <div className="relative max-w-6xl mx-auto w-full">
          <div className={`flex items-center gap-3 mb-10 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "100ms" }}>
            <div className="w-6 h-px bg-[#E8D5B7]/60" />
            <span className={`text-[11px] tracking-[0.35em] uppercase ${dark ? "text-[#E8D5B7]/60" : "text-[#8B6F47]/70"}`}>Available for Work</span>
          </div>

          <div className="overflow-hidden mb-4">
            <h1 className={`font-display text-[clamp(3rem,9vw,8rem)] leading-[0.92] tracking-tight transition-all duration-1000 ${dark ? "text-white" : "text-[#1a1a1a]"} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`} style={{ transitionDelay: "200ms" }}>
              Your Name
            </h1>
          </div>

          <div className="overflow-hidden mb-12">
            <p className={`font-display text-[clamp(3rem,9vw,8rem)] leading-[0.92] tracking-tight transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`} style={{ transitionDelay: "350ms" }}>
              <span className="bg-gradient-to-r from-[#E8D5B7] to-[#C4A882] bg-clip-text text-transparent transition-opacity duration-400" style={{ opacity: fade ? 1 : 0 }}>
                {roles[roleIndex]}
              </span>
            </p>
          </div>

          <div className={`flex flex-col md:flex-row md:items-end gap-8 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "550ms" }}>
            <p className={`max-w-md text-[15px] leading-relaxed font-body ${muted}`}>
              Crafting elegant software and capturing moments that tell stories. Based in [Your City] — blending code and creativity.
            </p>
            <div className="flex gap-4 md:ml-auto">
              <Link to="/developer" className={`px-6 py-3 rounded-full text-[13px] tracking-[0.1em] uppercase font-medium transition-colors duration-300 ${accentBg} ${accentText} ${accentHover}`}>
                See My Work
              </Link>
              <Link to="/contact" className={`px-6 py-3 rounded-full border text-[13px] tracking-[0.1em] uppercase transition-colors duration-300 ${borderBtn}`}>
                Get In Touch
              </Link>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 ${mounted ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1000ms" }}>
          <span className={`text-[10px] tracking-[0.3em] uppercase ${superMuted}`}>Scroll</span>
          <div className={`w-px h-12 bg-gradient-to-b animate-pulse ${dark ? "from-white/30" : "from-black/20"} to-transparent`} />
        </div>
      </section>

      {/* About */}
      <section ref={bioRef} className="px-6 md:px-16 py-32">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <div className={`transition-all duration-700 ${bioInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <span className={`text-[11px] tracking-[0.35em] uppercase mb-6 block ${superMuted}`}>About</span>
              <h2 className={`font-display text-4xl md:text-5xl leading-tight mb-8 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>
                Two passions,<br />one vision.
              </h2>
              <p className={`leading-relaxed text-[15px] mb-6 ${muted}`}>
                I'm a full-stack software developer with a deep love for the visual arts. My work sits at the intersection of technology and creativity — building seamless digital experiences by day and capturing the world through a lens by night.
              </p>
              <p className={`leading-relaxed text-[15px] mb-10 ${muted}`}>
                Whether I'm architecting a scalable API or composing a cinematic shot, I bring the same obsessive attention to detail and desire to create something that truly resonates.
              </p>
              <Link to="/contact" className={`inline-flex items-center gap-3 text-[13px] tracking-[0.15em] uppercase hover:gap-5 transition-all duration-300 ${accent}`}>
                Let's work together
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div className={`grid grid-cols-2 gap-6 transition-all duration-700 ${bioInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "200ms" }}>
            {[
              { num: "3+", label: "Years Coding" },
              { num: "50+", label: "Projects Built" },
              { num: "1K+", label: "Photos Taken" },
              { num: "∞", label: "Coffee Consumed" },
            ].map(({ num, label }) => (
              <div key={label} className={`p-8 rounded-2xl border ${dark ? "border-white/8 bg-white/[0.02]" : "border-black/8 bg-black/[0.02]"}`}>
                <p className={`font-display text-5xl mb-2 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>{num}</p>
                <p className={`text-[12px] tracking-[0.2em] uppercase ${superMuted}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section cards */}
      <section ref={cardsRef} className="px-6 md:px-16 py-16 pb-32">
        <div className="max-w-6xl mx-auto">
          <p className={`text-[11px] tracking-[0.35em] uppercase mb-12 ${superMuted}`}>Explore</p>
          <div className={`grid md:grid-cols-3 gap-4 transition-all duration-700 ${cardsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: "100ms" }}>
            <Card to="/developer" label="Software Dev" sub="Engineering" accent="#8B9DC3" dark={dark} />
            <Card to="/photography" label="Photography" sub="Visual Arts" accent="#E8D5B7" dark={dark} />
            <Card to="/videography" label="Videography" sub="Motion" accent="#C4A882" dark={dark} />
          </div>
        </div>
      </section>
    </main>
  );
}