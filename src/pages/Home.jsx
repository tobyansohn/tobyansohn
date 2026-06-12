import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { optimizeImage } from "../utils/image.js";
import { AnimatePresence, motion } from "framer-motion";
// WaterBackground only renders in the About section (below the fold) — lazy so
// its canvas code isn't in the critical-path bundle.
const WaterBackground = lazy(() => import("../components/WaterBackground.jsx"));

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
  const [mounted, setMounted] = useState(false);
  const [bioRef, bioInView] = useInView();

  const previewPhotos = useMemo(() => {
    const shuffled = [...allPhotoSrcs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 14);
  }, []);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setRoleIndex(i => (i + 1) % roles.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const muted       = dark ? "text-white/55" : "text-[#3D2F1F]";
  const superMuted  = dark ? "text-white/35" : "text-[#5A4A36]";
  const accent      = dark ? "text-[#E8B257]" : "text-[#2D4A2B]";
  const heading     = dark ? "text-white" : "text-[#1F1810]";
  const rule        = dark ? "bg-white/12" : "bg-black/12";
  const accentBorder= dark ? "border-[#E8B257]/50" : "border-[#2D4A2B]/50";

  // Editorial layout primitives
  const wrap   = "max-w-5xl mx-auto px-6 sm:px-8";
  const kicker = "text-[11px] tracking-[0.24em] uppercase font-medium";

  return (
    <main>
      {/* Hero — 01 */}
      <section className="relative min-h-[100dvh] flex flex-col overflow-hidden">
        {/* Full-bleed photo */}
        <div className="absolute inset-0">
          <img
            src={optimizeImage("/DSC04511.jpg", 1920)}
            srcSet={`${optimizeImage("/DSC04511.jpg", 800)} 800w, ${optimizeImage("/DSC04511.jpg", 1200)} 1200w, ${optimizeImage("/DSC04511.jpg", 1920)} 1920w`}
            sizes="100vw"
            width="1600"
            height="2400"
            alt=""
            fetchpriority="high"
            decoding="async"
            className="w-full h-full object-cover object-center"
          />
          <div className={`absolute inset-0 ${dark
            ? "bg-gradient-to-r from-[#0E1812] from-[40%] via-[#0E1812]/80 to-[#0E1812]/20"
            : "bg-gradient-to-r from-[#EFE6D2] from-[40%] via-[#EFE6D2]/80 to-[#EFE6D2]/20"
          }`} />
        </div>

        {/* Top metadata bar */}
        <div className={`relative z-10 ${wrap} w-full pt-20 pb-4 flex items-center justify-between gap-4 ${kicker} transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"} ${superMuted}`}>
          <span>Index 01</span>
          <span className="hidden sm:block">Austin, Texas</span>
          <span>Portfolio — 2026</span>
        </div>
        <div className={`relative z-10 ${wrap} w-full`}><div className={`h-px ${rule}`} /></div>

        {/* Headline */}
        <div className={`relative z-10 flex-1 flex flex-col justify-center ${wrap} w-full py-12`}>
          <span className={`${kicker} mb-6 ${accent}`}>Welcome</span>

          <h1
            className={`font-bold tracking-tight leading-[1.0] transition-[opacity,transform] duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"} ${heading}`}
            style={{ fontSize: "clamp(2.75rem, 8.5vw, 6.5rem)", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            Hi, I&rsquo;m <span className={`font-display italic ${accent}`}>Toby</span>.
          </h1>

          <div className="relative overflow-hidden mt-3" style={{ fontSize: "clamp(1.5rem, 4.5vw, 2.75rem)", height: "1.2em" }}>
            <AnimatePresence>
              <motion.span
                key={roleIndex}
                className={`absolute inset-x-0 top-0 block font-display italic font-medium leading-[1.2] ${accent}`}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
                exit={{ y: "-100%", opacity: 0, transition: { duration: 0.5, ease: [0.7, 0, 0.84, 0] } }}
              >
                {roles[roleIndex]}
              </motion.span>
            </AnimatePresence>
          </div>

          <div
            className={`mt-12 flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-12 transition-[opacity,transform] duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: "200ms", transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
          >
            <p className={`text-[15px] leading-relaxed max-w-sm ${muted}`}>
              24-year-old creative &amp; software developer in Austin, Texas. Full-time at Visa; shooting photo &amp; video for Lifeway ATX.
            </p>
            <div className="flex items-center gap-8 sm:ml-auto">
              <Link
                to="/developer"
                className={`group inline-flex items-center gap-2 pb-1.5 border-b ${accentBorder} ${kicker} ${accent} transition-colors duration-200`}
              >
                See my work
                <span className="transition-transform duration-300 group-hover:translate-x-1">&rarr;</span>
              </Link>
              <Link
                to="/contact"
                className={`group inline-flex items-center gap-2 pb-1.5 border-b border-transparent ${kicker} ${superMuted} ${dark ? "hover:text-white hover:border-white/40" : "hover:text-[#1F1810] hover:border-black/40"} transition-colors duration-200`}
              >
                Say hi
                <span className="transition-transform duration-300 group-hover:translate-x-1">&#8599;</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Photo marquee band */}
        <div className="relative z-10">
          <div className={`${wrap} w-full`}><div className={`h-px ${rule}`} /></div>
          <div className={`${wrap} w-full flex items-baseline justify-between py-4`}>
            <span className={`${kicker} ${accent}`}>Selected Photography</span>
            <Link to="/photography" className={`group inline-flex items-center gap-2 ${kicker} ${superMuted} transition-colors duration-200`}>
              View all
              <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
            </Link>
          </div>
          <div className="overflow-hidden">
            <motion.div
              className="flex gap-2 w-max px-6 sm:px-8"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 48, ease: "linear", repeat: Infinity }}
            >
              {[...previewPhotos, ...previewPhotos].map((src, i) => (
                <Link key={i} to="/photography" className="flex-shrink-0 h-32 sm:h-40 cursor-pointer group transition-transform duration-300 ease-out hover:-rotate-2 hover:scale-[1.05] hover:z-10">
                  <img
                    src={optimizeImage(src, 600)} alt=""
                    className="h-full w-auto object-cover"
                    loading="lazy"
                  />
                </Link>
              ))}
            </motion.div>
          </div>
        </div>

      </section>

      {/* About — 03 */}
      <section ref={bioRef} className="relative overflow-hidden">
        <Suspense fallback={null}>
          {bioInView && <WaterBackground dark={dark} />}
        </Suspense>
        <div className={`relative ${wrap} py-24 md:py-32`}>
          <div className="flex items-baseline gap-3 mb-3">
            <span className={`${kicker} ${accent}`}>About</span>
            <span className={`${kicker} ${superMuted}`}>03</span>
          </div>
          <div className={`h-px mb-16 ${rule}`} />

          {/* Spinning badge — links to contact */}
          <Link
            to="/contact"
            aria-label="Say hi"
            className="hidden md:flex absolute top-16 right-8 w-28 h-28 items-center justify-center group"
          >
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-spin-slow">
              <defs>
                <path id="badge-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
              </defs>
              <text className={`text-[8.5px] font-medium uppercase ${dark ? "fill-[#E8B257]/70" : "fill-[#2D4A2B]/70"}`} style={{ letterSpacing: "0.18em" }}>
                <textPath href="#badge-circle">Open to projects ✦ Say hi ✦&nbsp;</textPath>
              </text>
            </svg>
            <span className={`text-xl transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${accent}`}>&#8599;</span>
          </Link>

          <div className="grid md:grid-cols-12 gap-12 md:gap-16">
            {/* Lead column */}
            <div className="md:col-span-7">
              <div className={`transition-[opacity,transform] duration-700 ${bioInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
                <h2 className={`font-bold tracking-tight leading-[1.05] text-[clamp(2rem,4.5vw,3.5rem)] mb-10 ${heading}`}>
                  Where has the <span className={`font-display italic ${accent}`}>time</span> gone?
                </h2>
                <p className={`text-[16px] leading-[1.8] mb-10 max-w-xl ${muted}`}>
                  Over the past few years of my life, my faith has led me on a journey of capturing what God shows me. Most of my inspiration comes from the idea of capturing the experiences and moments where God has worked, or is working already.
                </p>
                <blockquote className="mb-12 max-w-xl">
                  <p className={`font-display text-[22px] md:text-[26px] leading-[1.5] italic mb-3 ${dark ? "text-white/70" : "text-[#2A2014]"}`}>
                    &ldquo;Let this be recorded for a generation to come, so that a people yet to be created may praise the&nbsp;Lord.&rdquo;
                  </p>
                  <cite className={`not-italic ${kicker} ${superMuted}`}>Psalm 102:18 ESV</cite>
                </blockquote>
                <Link to="/contact" className={`group inline-flex items-center gap-2 pb-1.5 border-b ${accentBorder} ${kicker} ${accent} transition-colors duration-200`}>
                  Let&rsquo;s work together
                  <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Stats column */}
            <div className="md:col-span-5">
              <div className={`grid grid-cols-2 gap-x-8 gap-y-12 transition-[opacity,transform] duration-700 ${bioInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "150ms" }}>
                {[
                  { val: "3+",                      label: "Years Coding" },
                  { val: "4",                       label: "Videos Made" },
                  { val: `${allPhotoSrcs.length}+`, label: "Photos Shot" },
                  { val: "∞",                       label: "Coffee Consumed" },
                ].map((s) => (
                  <div key={s.label} className="group flex flex-col gap-3 cursor-default">
                    <p className={`font-light tracking-tight leading-none text-[clamp(2.5rem,5vw,3.75rem)] transition-colors duration-300 ${heading} ${dark ? "group-hover:text-[#E8B257]" : "group-hover:text-[#2D4A2B]"}`}>{s.val}</p>
                    <div className={`h-px w-8 transition-all duration-500 ease-out group-hover:w-16 ${dark ? "bg-[#E8B257]/50" : "bg-[#2D4A2B]/40"}`} />
                    <p className={`text-[10px] tracking-[0.22em] uppercase ${superMuted}`}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video grid — 04 */}
      <section className={`border-t ${dark ? "border-white/10" : "border-black/10"}`}>
        <div className={`${wrap} py-24 md:py-32`}>
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-baseline gap-3">
              <span className={`${kicker} ${accent}`}>Videography</span>
              <span className={`${kicker} ${superMuted}`}>04</span>
            </div>
            <a href="https://www.youtube.com/@1tobyan" target="_blank" rel="noopener noreferrer" className={`group inline-flex items-center gap-2 ${kicker} ${superMuted} transition-colors duration-200`}>
              View channel
              <span className="transition-transform duration-200 group-hover:translate-x-1">&rarr;</span>
            </a>
          </div>
          <div className={`h-px mb-14 ${rule}`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {videos.map((v) => (
              <a key={v.id} href={`https://youtu.be/${v.id}`} target="_blank" rel="noopener noreferrer" className="group block">
                <div className="relative overflow-hidden mb-4 aspect-video bg-stone-800">
                  <img
                    src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                    alt={v.title}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-4 h-4 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <p className={`text-[13px] leading-snug transition-colors duration-300 ${dark ? "text-white/70 group-hover:text-white" : "text-[#3D2F1F] group-hover:text-[#2D4A2B]"}`}>{v.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}
