import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

const allPhotosGlob = import.meta.glob('../Photos/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}', { eager: true });
const allPhotoSrcs = Object.values(allPhotosGlob).map(m => m.default);

const videos = [
  { id: "EZSCrRH-s98", title: "The Beginning" },
  { id: "kMMSE32bWWI", title: "CRWR 2026: REDEFINED" },
  { id: "9TvsSfOUyfQ", title: "What did I even do this month?" },
  { id: "JjLO0TkWRPM", title: "Did a lot, filmed a little." },
];

const roles = ["Software Developer", "Photographer", "Videographer", "Disciple"];


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


export default function Home() {
  const { dark } = useTheme();
  const [roleIndex, setRoleIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [bioRef, bioInView] = useInView();

  const previewPhotos = useMemo(() => {
    const shuffled = [...allPhotoSrcs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 10);
  }, []);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => { setRoleIndex(i => (i + 1) % roles.length); setFade(true); }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const muted = dark ? "text-white/45" : "text-[#3a3a3a]";
  const superMuted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const accent = dark ? "text-[#E8D5B7]" : "text-[#6B4F2A]";
  const accentBg = dark ? "bg-white" : "bg-[#1a1a1a]";
  const accentText = dark ? "text-[#080808]" : "text-white";
  const accentHover = dark ? "hover:bg-[#E8D5B7]" : "hover:bg-[#3a3a3a]";
  const borderBtn = dark ? "border-white/20 text-white hover:border-white/50" : "border-black/20 text-black/70 hover:border-black/50";

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col justify-center px-6 md:px-16 pt-20 overflow-hidden">
        {/* Hero background photo */}
        <div className="absolute inset-0">
          <img
            src="/DSC04511.jpg"
            alt=""
            className="w-full h-full object-cover object-center"
          />
          <div className={`absolute inset-0 ${dark
            ? "bg-gradient-to-r from-[#080808] from-[45%] via-[#080808]/80 to-[#080808]/40"
            : "bg-gradient-to-r from-[#F5F2ED] from-[45%] via-[#F5F2ED]/80 to-[#F5F2ED]/40"
          }`} />
          <div className={`absolute inset-0 ${dark ? "bg-[#080808]/30" : "bg-[#F5F2ED]/20"}`} />
        </div>
        <div className={`absolute inset-0 opacity-[0.02] ${dark ? "" : "invert"}`}
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: "80px 80px" }}
        />

        <div className="relative max-w-6xl mx-auto w-full">
          <div className={`flex items-center gap-3 mb-10 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "100ms" }}>
            <div className="w-6 h-px bg-[#E8D5B7]/60" />
            <span className={`text-[11px] tracking-[0.35em] uppercase ${dark ? "text-[#E8D5B7]/60" : "text-[#6B4F2A]/70"}`}>Welcome!</span>
          </div>

          <div className="overflow-hidden mb-4">
            <h1 className={`font-display text-[clamp(3rem,9vw,8rem)] leading-[0.92] tracking-tight transition-all duration-1000 ${dark ? "text-white" : "text-[#1a1a1a]"} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`} style={{ transitionDelay: "200ms" }}>
              Hi, I'm Toby.
            </h1>
          </div>

          <div className="overflow-hidden mb-12 min-h-[5rem] md:min-h-[10rem]">
            <p className={`font-display text-[clamp(3rem,9vw,8rem)] leading-[0.92] tracking-tight transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`} style={{ transitionDelay: "350ms" }}>
              <span className="bg-gradient-to-r from-[#E8D5B7] to-[#C4A882] bg-clip-text text-transparent transition-opacity duration-400" style={{ opacity: fade ? 1 : 0 }}>
                {roles[roleIndex]}
              </span>
            </p>
          </div>

          <div className={`flex flex-col md:flex-row md:items-end gap-8 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "550ms" }}>
            <p className={`max-w-md text-[15px] leading-relaxed font-body ${muted}`}>
              Hi, I'm Toby! A 24 yo creative and software developer based in Austin, TX. Currently, I work at Visa full time, and primarily shoot photos and videos for my church, Lifeway ATX.
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
              <span className={`text-[11px] tracking-[0.35em] uppercase mb-6 block ${superMuted}`}>About Me</span>
              <h2 className={`font-display text-4xl md:text-5xl leading-tight mb-8 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>
                Where has the<br />time gone?
              </h2>
              <p className={`leading-relaxed text-[15px] mb-6 ${muted}`}>
                Over the past few years of my life, my faith has led me on a journey of capturing what God shows me. Most of my inspiration comes from the idea of capturing the experiences and moments where God has worked or is working already.
              </p>
              <p className={`leading-relaxed text-[15px] mb-10 ${muted}`}>
                A verse that comes to mind: "Let this be recorded for a generation to come, so that a people yet to be created may praise the Lord:" -Psalm 102:18 ESV.
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
              { num: `${allPhotoSrcs.length}+`, label: "Photos Shot" },
              { num: "4", label: "Videos Made" },
              { num: "∞", label: "Coffee Consumed" },
            ].map(({ num, label }) => (
              <div key={label} className={`p-8 rounded-2xl border ${dark ? "border-white/8 bg-white/[0.02]" : "border-[#b0a090] bg-[#ede8e0]"}`}>
                <p className={`font-display text-5xl mb-2 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>{num}</p>
                <p className={`text-[12px] tracking-[0.2em] uppercase ${superMuted}`}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 md:px-16 mb-8 flex items-center justify-between">
          <span className={`text-[11px] tracking-[0.35em] uppercase ${superMuted}`}>Photography</span>
          <Link to="/photography" className={`inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase transition-colors duration-300 ${accent}`}>
            View all
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto px-6 md:px-16 pb-2 no-scrollbar">
          {previewPhotos.map((src, i) => (
            <Link key={i} to="/photography" className="flex-shrink-0 h-64 overflow-hidden rounded-xl">
              <img src={src} alt="" className="h-full w-auto object-cover hover:scale-105 transition-transform duration-500" loading="lazy" />
            </Link>
          ))}
        </div>
      </section>

      {/* Video grid */}
      <section className="px-6 md:px-16 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <span className={`text-[11px] tracking-[0.35em] uppercase ${superMuted}`}>Videography</span>
            <a href="https://www.youtube.com/@1tobyan" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase transition-colors duration-300 ${accent}`}>
              View channel
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {videos.map((v) => (
              <a key={v.id} href={`https://youtu.be/${v.id}`} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="relative overflow-hidden rounded-xl mb-3 aspect-video bg-stone-800">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className={`text-[13px] leading-tight transition-colors duration-300 ${dark ? "text-white/70 group-hover:text-white" : "text-[#3a3a3a] group-hover:text-[#6B4F2A]"}`}>{v.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`px-6 md:px-16 py-10 border-t ${dark ? "border-white/8" : "border-black/8"}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <p className={`font-display text-lg ${dark ? "text-white/50" : "text-[#5a4a3a]"}`}>Tobyan Sohn</p>
          <div className="flex items-center gap-6">
            <Link to="/developer" className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 ${dark ? "text-white/30 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}>Dev</Link>
            <Link to="/photography" className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 ${dark ? "text-white/30 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}>Photography</Link>
            <Link to="/videography" className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 ${dark ? "text-white/30 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}>Videography</Link>
            <Link to="/contact" className={`text-[11px] tracking-[0.2em] uppercase transition-colors duration-200 ${dark ? "text-white/30 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}>Contact</Link>
          </div>
          <p className={`text-[11px] tracking-[0.1em] ${dark ? "text-white/20" : "text-[#9a8a7a]"}`}>© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </main>
  );
}