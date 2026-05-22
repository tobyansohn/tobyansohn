import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold, rootMargin: '100px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Photo imports ──────────────────────────────────────────────────────────────

const forFunHomeGlob    = import.meta.glob('../Photos/For Fun/Home/*.{jpg,JPG,jpeg,JPEG,png,PNG}',        { eager: true });
const forFunPorchGlob   = import.meta.glob('../Photos/For Fun/The Porch/*.{jpg,JPG,jpeg,JPEG,png,PNG}',   { eager: true });
const forFunLifewayGlob = import.meta.glob('../Photos/For Fun/LifewayATX/*.{jpg,JPG,jpeg,JPEG,png,PNG}',  { eager: true });
const forFunYejinGlob   = import.meta.glob('../Photos/For Fun/Yejinfloral/*.{jpg,JPG,jpeg,JPEG,png,PNG}', { eager: true });
const gradPicsGlob      = import.meta.glob('../Photos/Grad Pics/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}',         { eager: true });
const peopleGlob        = import.meta.glob('../Photos/People/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}',            { eager: true });
const travelsGlob       = import.meta.glob('../Photos/Travels/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}',           { eager: true });

const folderName = (path) => path.split('/').slice(-2)[0];

function buildPhotos(glob, category, getSub) {
  return Object.entries(glob).map(([path, mod], i) => {
    const subCategory = typeof getSub === 'function' ? getSub(path) : getSub;
    return { id: `${category}-${subCategory}-${i}`, src: mod.default, title: subCategory, category, subCategory };
  });
}

const photos = [
  ...buildPhotos(forFunHomeGlob,    'For Fun',   'Home'),
  ...buildPhotos(forFunPorchGlob,   'For Fun',   'The Porch'),
  ...buildPhotos(forFunLifewayGlob, 'For Fun',   'Lifeway ATX'),
  ...buildPhotos(forFunYejinGlob,   'For Fun',   'Yejinfloral'),
  ...buildPhotos(gradPicsGlob,      'Grad Pics', folderName),
  ...buildPhotos(peopleGlob,        'People',    folderName),
  ...buildPhotos(travelsGlob,       'Travels',   folderName),
];

const topCategories = ['All', 'For Fun', 'Grad Pics', 'People', 'Travels'];

// ── Sub-components ─────────────────────────────────────────────────────────────

function PhotoCard({ photo, index, onClick }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      className={`group cursor-pointer break-inside-avoid mb-3 overflow-hidden rounded-xl transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}
      style={{ transitionDelay: `${(index % 9) * 40}ms` }}
      onClick={() => onClick(index)}
    >
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={photo.src}
          alt={photo.title}
          className="w-full block group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-400 flex items-end p-4">
          <div className="translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
            <p className="text-white font-display text-base leading-tight">{photo.title}</p>
            <p className="text-white/60 text-[11px] tracking-[0.1em] mt-0.5">{photo.category}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ photo, onClose, onPrev, onNext, hasPrev, hasNext, counter }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  return createPortal(
    <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-4xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <img src={photo.src} alt={photo.title} className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl pointer-events-none">
          <p className="font-display text-2xl text-white">{photo.title}</p>
          <p className="text-white/50 text-sm mt-1">{photo.category}</p>
          {counter && <p className="text-white/25 text-[11px] tracking-[0.15em] uppercase mt-2">{counter}</p>}
        </div>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all duration-200 cursor-pointer">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {hasPrev && (
          <button onClick={onPrev} aria-label="Previous photo" className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-all duration-200 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {hasNext && (
          <button onClick={onNext} aria-label="Next photo" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/60 hover:text-white hover:bg-black/70 transition-all duration-200 cursor-pointer">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>,
    document.body
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Photography() {
  const { dark } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'All');
  const [activeSub, setActiveSub] = useState(searchParams.get('sub') || 'All');
  const [allSeed, setAllSeed] = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [headerRef, headerInView] = useInView();

  const randomAll = useMemo(() => {
    const shuffled = [...photos].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }, [allSeed]);

  const randomCategoryAll = useMemo(() => {
    if (activeCategory === 'All' || activeSub !== 'All') return null;
    const inCat = photos.filter(p => p.category === activeCategory);
    const shuffled = [...inCat].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 15);
  }, [activeCategory, activeSub]);

  const subCategories = activeCategory === 'All'
    ? []
    : ['All', ...new Set(photos.filter(p => p.category === activeCategory).map(p => p.subCategory))];

  const filtered = activeCategory === 'All'
    ? randomAll
    : activeSub === 'All'
    ? randomCategoryAll
    : photos.filter(p => {
        if (p.category !== activeCategory) return false;
        if (p.subCategory !== activeSub) return false;
        return true;
      });

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const body  = dark ? "text-white/45" : "text-[#3a3a3a]";

  const pillBase = "px-4 py-2 rounded-full text-[12px] tracking-[0.1em] uppercase transition-all duration-300";
  const pillActive = dark ? "bg-white text-[#080808]" : "bg-[#1a1a1a] text-white";
  const pillInactive = dark
    ? "border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30"
    : "border border-black/15 text-[#4a4a4a] hover:text-black/70 hover:border-black/30";

  const subPillBase = "px-3 py-1 rounded-md text-[11px] tracking-[0.08em] transition-all duration-300";
  const subPillActive = dark
    ? "bg-[#E8D5B7]/15 text-[#E8D5B7] border border-[#E8D5B7]/30"
    : "bg-[#6B4F2A]/10 text-[#6B4F2A] border border-[#6B4F2A]/30";
  const subPillInactive = dark
    ? "border border-white/10 text-white/35 hover:text-white/65 hover:border-white/25 hover:bg-white/5"
    : "border border-black/10 text-[#5a4a3a] hover:text-[#1a1a1a] hover:border-black/20 hover:bg-black/5";

  return (
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
      <div ref={headerRef} className="mb-16">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${muted}`}>Photography</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>
            The world through<br />
            <span className={dark ? "text-white/30" : "text-[#7a6a5a]"}>my lens.</span>
          </h1>
          <p className={`max-w-lg text-[15px] leading-relaxed ${body}`}>
            I love the opportunity to capture everywhere I go, whether it's at home or on the go.
            <br /><br />
            I normally shoot on Sony (a7V) and a Fujifilm xt30.
          </p>
        </div>
      </div>

      {/* Top-level pills */}
      <div className="flex flex-wrap gap-2 mb-3">
        {topCategories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(cat); setActiveSub('All'); if (cat === 'All') setAllSeed(s => s + 1); }}
            className={`${pillBase} ${activeCategory === cat ? pillActive : pillInactive}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sub-category pills */}
      {subCategories.length > 0 ? (
        <div className={`mb-10 pl-4 border-l-2 ${dark ? "border-white/10" : "border-black/10"}`}>
          <p className={`text-[10px] tracking-[0.25em] uppercase mb-2.5 ${dark ? "text-white/25" : "text-[#9a8a7a]"}`}>
            {activeCategory}
          </p>
          <div className="flex flex-wrap gap-2">
            {subCategories.map(sub => (
              <button
                key={sub}
                onClick={() => setActiveSub(sub)}
                className={`${subPillBase} ${activeSub === sub ? subPillActive : subPillInactive}`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-10" />
      )}

      {/* Masonry grid */}
      <div className="columns-2 md:columns-3 gap-3">
        {filtered.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} index={i} onClick={setLightboxIdx} />
        ))}
      </div>

      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <Lightbox
          photo={filtered[lightboxIdx]}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx(i => Math.max(0, i - 1))}
          onNext={() => setLightboxIdx(i => Math.min(filtered.length - 1, i + 1))}
          hasPrev={lightboxIdx > 0}
          hasNext={lightboxIdx < filtered.length - 1}
          counter={`${lightboxIdx + 1} / ${filtered.length}`}
        />
      )}
    </main>
  );
}
