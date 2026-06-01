import { useEffect, useRef, useState, useMemo, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { optimizeImage } from "../utils/image.js";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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


function NowItem({ label, value }) {
  const { dark } = useTheme();
  return (
    <span className="flex items-center gap-2">
      <span className={`text-[10px] tracking-[0.2em] uppercase ${dark ? "text-white/25" : "text-[#9A8A70]"}`}>{label}</span>
      <span className={`text-[13px] ${dark ? "text-white/55" : "text-[#3D2F1F]"}`}>{value}</span>
    </span>
  );
}

export default function Home() {
  const { dark } = useTheme();
  const [roleIndex, setRoleIndex] = useState(0);
  const [workIdx, setWorkIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [bioRef, bioInView] = useInView();
  const reduceMotion = useReducedMotion();

  const previewPhotos = useMemo(() => {
    const shuffled = [...allPhotoSrcs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 14);
  }, []);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setRoleIndex(i => (i + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Cycle the photo thumbnail inside the primary CTA — the button literally
  // becomes a tiny rotating window into Toby's photography.
  useEffect(() => {
    if (!previewPhotos.length || reduceMotion) return;
    const id = setInterval(() => {
      setWorkIdx(i => (i + 1) % previewPhotos.length);
    }, 2400);
    return () => clearInterval(id);
  }, [previewPhotos.length, reduceMotion]);

  const muted = dark ? "text-white/45" : "text-[#3D2F1F]";
  const superMuted = dark ? "text-white/30" : "text-[#5A4A36]";
  const accent = dark ? "text-[#E8B257]" : "text-[#2D4A2B]";
  const accentBg = dark ? "bg-white" : "bg-[#2A2014]";
  const accentText = dark ? "text-[#0E1812]" : "text-white";
  const accentHover = dark ? "hover:bg-[#E8B257]" : "hover:bg-[#3D2F1F]";
  const borderBtn = dark ? "border-white/20 text-white hover:border-white/50" : "border-black/20 text-black/70 hover:border-black/50";

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center px-6 md:px-16 pt-20 overflow-hidden">
        {/* Hero background photo */}
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
            ? "bg-gradient-to-r from-[#0E1812] from-[45%] via-[#0E1812]/80 to-[#0E1812]/40"
            : "bg-gradient-to-r from-[#EFE6D2] from-[45%] via-[#EFE6D2]/80 to-[#EFE6D2]/40"
          }`} />
          <div className={`absolute inset-0 ${dark ? "bg-[#0E1812]/30" : "bg-[#EFE6D2]/20"}`} />
        </div>
        <div className={`absolute inset-0 opacity-[0.02] ${dark ? "" : "invert"}`}
          style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: "80px 80px" }}
        />

        <div className="relative max-w-6xl mx-auto w-full">
          <div className={`flex items-center gap-3 mb-10 transition-[opacity,transform] duration-700 ease-snappy ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "100ms" }}>
            <div className="w-6 h-px bg-[#E8B257]/60" />
            <span className={`text-[11px] tracking-[0.35em] uppercase ${dark ? "text-[#E8B257]/60" : "text-[#2D4A2B]/70"}`}>Welcome!</span>
          </div>

          <h1 className={`font-display text-[clamp(3rem,9vw,8rem)] leading-[1.05] tracking-tight pb-[0.05em] mb-4 transition-[opacity,transform] duration-700 ease-snappy ${dark ? "text-white" : "text-[#2A2014]"} ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: "200ms" }}>
            Hi, I'm Toby.
          </h1>

          <div className="mb-12 min-h-[5rem] md:min-h-[10rem]">
            <p className={`font-display text-[clamp(3rem,9vw,8rem)] leading-[0.92] tracking-tight transition-[opacity,transform] duration-700 ease-snappy ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"}`} style={{ transitionDelay: "350ms" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={roleIndex}
                  className={`bg-gradient-to-r bg-clip-text text-transparent inline-block ${dark ? "from-[#E8B257] to-[#C9913B]" : "from-[#2D4A2B] to-[#1F3320]"}`}
                  style={{ paddingBottom: '0.2em' }}
                  initial={{ opacity: 0, filter: "blur(8px)", y: 8 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0, transition: { duration: 0.42, ease: [0.23, 1, 0.32, 1] } }}
                  exit={{ opacity: 0, filter: "blur(6px)", y: -6, transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] } }}
                >
                  {roles[roleIndex]}
                </motion.span>
              </AnimatePresence>
            </p>
          </div>

          <div className={`flex flex-col md:flex-row md:items-end gap-8 transition-[opacity,transform] duration-700 ease-snappy ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "550ms" }}>
            <p className={`max-w-md text-[15px] leading-relaxed font-body ${muted}`}>
              Hi, I'm Toby! A 24 yo creative and software developer based in Austin, TX. Currently, I work at Visa full time, and primarily shoot photos and videos for my church, Lifeway ATX.
            </p>
            <div className="flex flex-wrap gap-4 md:ml-auto items-center">
              {/* Primary CTA — sticker pill whose icon is a tiny cycling
                  photo of Toby's actual work. The button IS the portfolio. */}
              <Link
                to="/developer"
                className={`group relative inline-flex items-center gap-3 pl-7 pr-2 py-2 rounded-full font-display italic text-[17px] leading-none active:scale-[0.97] -rotate-[2deg] hover:rotate-0 hover:-translate-y-0.5 transition-[transform,box-shadow,background-color] duration-500 ${
                  dark
                    ? "bg-[#E8B257] text-[#0E1812] shadow-[0_10px_28px_-10px_rgba(232,178,87,0.55)] hover:shadow-[0_14px_36px_-10px_rgba(232,178,87,0.65)]"
                    : "bg-[#2D4A2B] text-[#EFE6D2] shadow-[0_10px_28px_-10px_rgba(45,74,43,0.45)] hover:shadow-[0_14px_36px_-10px_rgba(45,74,43,0.55)]"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
              >
                <span style={{ fontVariationSettings: '"opsz" 24, "SOFT" 80, "WONK" 1' }}>See my work</span>
                <span
                  className={`relative w-9 h-9 rounded-full overflow-hidden ring-1 transition-transform duration-500 group-hover:scale-[1.18] group-hover:rotate-[8deg] ${
                    dark ? "ring-[#0E1812]/25 bg-[#0E1812]/20" : "ring-[#EFE6D2]/40 bg-[#EFE6D2]/20"
                  }`}
                  style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                >
                  <AnimatePresence mode="popLayout">
                    <motion.img
                      key={workIdx}
                      src={optimizeImage(previewPhotos[workIdx], 120)}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ opacity: 0, scale: 1.15 }}
                      animate={{ opacity: 1, scale: 1, transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } }}
                      exit={{ opacity: 0, transition: { duration: 0.45 } }}
                      loading="lazy"
                      draggable={false}
                    />
                  </AnimatePresence>
                </span>
              </Link>

              {/* Secondary CTA — paper plane that flies off on hover, leaves
                  a tiny dashed trail behind. */}
              <Link
                to="/contact"
                className={`group relative inline-flex items-center gap-3 pl-7 pr-2 py-2 rounded-full font-display italic text-[17px] leading-none active:scale-[0.97] rotate-[2deg] hover:rotate-0 hover:-translate-y-0.5 ring-1 backdrop-blur-sm transition-[transform,box-shadow,background-color,border-color] duration-500 ${
                  dark
                    ? "text-white ring-white/25 hover:ring-white/55 bg-white/[0.06] hover:bg-white/[0.12]"
                    : "text-[#2A2014] ring-[#2A2014]/25 hover:ring-[#2A2014]/55 bg-white/40 hover:bg-white/60"
                }`}
                style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
              >
                <span style={{ fontVariationSettings: '"opsz" 24, "SOFT" 80, "WONK" 1' }}>Say hi</span>
                <span
                  className={`relative w-9 h-9 rounded-full flex items-center justify-center overflow-visible ${
                    dark ? "bg-white/10" : "bg-[#2A2014]/[0.08]"
                  }`}
                >
                  {/* dashed trail — appears as plane "takes off" */}
                  <svg
                    aria-hidden
                    className="absolute right-7 top-1/2 -translate-y-1/2 w-10 h-3 opacity-0 group-hover:opacity-70 transition-opacity duration-500"
                    viewBox="0 0 40 12"
                    style={{ transitionDelay: "120ms" }}
                  >
                    <path d="M2 6 H38" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2 3" fill="none" />
                  </svg>
                  {/* paper plane */}
                  <svg
                    className="w-4 h-4 transition-transform duration-700 group-hover:translate-x-3 group-hover:-translate-y-1.5 group-hover:rotate-[18deg]"
                    style={{ transitionTimingFunction: "cubic-bezier(0.32,0.72,0,1)" }}
                    viewBox="0 0 24 24" fill="currentColor"
                  >
                    <path d="M2.5 11.2 21 3l-7.2 18-2.7-7.1L2.5 11.2zm9 1.8 6.2-6.2-4 10z" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 transition-[opacity] duration-700 ease-snappy ${mounted ? "opacity-100" : "opacity-0"}`} style={{ transitionDelay: "1000ms" }}>
          <span className={`text-[9px] tracking-[0.35em] uppercase ${superMuted}`}>Scroll</span>
          <div className={`w-[22px] h-9 rounded-full border flex items-start justify-center pt-[5px] ${dark ? "border-white/20" : "border-black/15"}`}>
            <div className={`w-[3px] h-[6px] rounded-full ${dark ? "bg-white/50" : "bg-black/35"}`}
              style={{ animation: "scrollDot 1.6s cubic-bezier(0.23,1,0.32,1) infinite" }} />
          </div>
        </div>
      </section>

      {/* Now */}
      <section className={`px-6 md:px-16 py-5 border-y ${dark ? "border-white/6" : "border-black/6"}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
          <span className={`text-[10px] tracking-[0.35em] uppercase shrink-0 ${superMuted}`}>Now</span>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <NowItem label="Working on" value="Payment infrastructure at Visa" />
            <NowItem label="Shooting" value="Sony a7V + Fujifilm XT30" />
            <NowItem label="Serving" value="Lifeway ATX" />
            <NowItem label="Based in" value="Austin, TX" />
          </div>
        </div>
      </section>

      {/* About */}
      <section ref={bioRef} className="relative px-6 md:px-16 py-24 overflow-hidden">
        <Suspense fallback={null}>
          {bioInView && <WaterBackground dark={dark} />}
        </Suspense>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 md:gap-24 items-center">
          <div>
            <div className={`transition-[opacity,transform] duration-600 ease-snappy ${bioInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
              <span className={`text-[11px] tracking-[0.35em] uppercase mb-6 block ${superMuted}`}>About Me</span>
              <h2 className={`font-display text-4xl md:text-5xl leading-tight mb-8 ${dark ? "text-white" : "text-[#2A2014]"}`}>
                Where has the<br />time gone?
              </h2>
              <p className={`leading-relaxed text-[15px] mb-8 ${muted}`}>
                Over the past few years of my life, my faith has led me on a journey of capturing what God shows me. Most of my inspiration comes from the idea of capturing the experiences and moments where God has worked or is working already.
              </p>
              <blockquote className={`relative pl-5 mb-10 border-l-2 ${dark ? "border-[#E8B257]/30" : "border-[#2D4A2B]/25"}`}>
                <p className={`font-display text-[17px] leading-relaxed italic mb-2 ${dark ? "text-white/55" : "text-[#5A4A36]"}`}>
                  "Let this be recorded for a generation to come, so that a people yet to be created may praise the Lord."
                </p>
                <cite className={`not-italic text-[11px] tracking-[0.2em] uppercase ${dark ? "text-white/25" : "text-[#9A8A70]"}`}>Psalm 102:18 ESV</cite>
              </blockquote>
              <Link to="/contact" className={`inline-flex items-center gap-3 text-[13px] tracking-[0.15em] uppercase hover:gap-5 transition-[color,gap] duration-200 ease-snappy ${accent}`}>
                Let's work together
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>

          <div>
            {/* Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-[2fr_1fr] gap-4 mb-4">
              {[
                { val: "3+", label: "Years Coding", p: "p-8", h: "min-h-[140px]", size: "text-[clamp(3rem,5vw,4rem)]" },
                { val: "4",  label: "Videos Made",  p: "p-6", h: "min-h-[140px]", size: "text-4xl" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className={`${s.p} rounded-2xl border flex flex-col justify-between ${s.h} ${dark ? "border-white/8 bg-white/[0.02]" : "border-[#C8B996] bg-[#E0D5BA]"}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 340, damping: 28 } }}
                >
                  <p className={`font-display ${s.size} leading-none tracking-tighter mb-2 ${dark ? "text-white" : "text-[#2A2014]"}`}>{s.val}</p>
                  <p className={`text-[11px] tracking-[0.25em] uppercase ${superMuted}`}>{s.label}</p>
                </motion.div>
              ))}
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-2 sm:grid-cols-[1fr_2fr] gap-4">
              {[
                { val: `${allPhotoSrcs.length}+`, label: "Photos Shot",      p: "p-6", h: "min-h-[120px]", size: "text-4xl" },
                { val: "∞",                       label: "Coffee Consumed",  p: "p-8", h: "min-h-[120px]", size: "text-[clamp(2.5rem,4vw,3.5rem)]" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  className={`${s.p} rounded-2xl border flex flex-col justify-between ${s.h} ${dark ? "border-white/8 bg-white/[0.02]" : "border-[#C8B996] bg-[#E0D5BA]"}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  whileHover={{ y: -3, transition: { type: "spring", stiffness: 340, damping: 28 } }}
                >
                  <p className={`font-display ${s.size} leading-none tracking-tighter mb-2 ${dark ? "text-white" : "text-[#2A2014]"}`}>{s.val}</p>
                  <p className={`text-[11px] tracking-[0.25em] uppercase ${superMuted}`}>{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo strip — infinite marquee */}
      <section className="px-6 md:px-16 py-16">
        <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
          <span className={`text-[11px] tracking-[0.35em] uppercase ${superMuted}`}>Photography</span>
          <Link to="/photography" className={`inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase transition-colors duration-300 ${accent}`}>
            View all
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="-mx-6 md:-mx-16 overflow-hidden">
          <motion.div
            className="flex gap-3 w-max pl-6 md:pl-16"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 40, ease: "linear", repeat: Infinity }}
            whileHover={{ animationPlayState: "paused" }}
          >
            {[...previewPhotos, ...previewPhotos].map((src, i) => (
              <Link key={i} to="/photography" className="flex-shrink-0 h-64 overflow-hidden rounded-xl cursor-pointer group">
                <motion.img
                  src={optimizeImage(src, 600)} alt=""
                  className="h-full w-auto object-cover"
                  whileHover={{ scale: 1.06 }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  loading="lazy"
                />
              </Link>
            ))}
          </motion.div>
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
                    className="w-full h-full object-cover transition-transform duration-300 ease-snappy [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-105"
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
                <p className={`text-[13px] leading-tight transition-colors duration-300 ${dark ? "text-white/70 group-hover:text-white" : "text-[#3D2F1F] group-hover:text-[#2D4A2B]"}`}>{v.title}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

    </main>
  );
}