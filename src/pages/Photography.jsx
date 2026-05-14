import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

// ── Photo imports ──────────────────────────────────────────────────────────────

const forFunHomeGlob = import.meta.glob(
  '../Photos/For Fun/Home/*.{jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: true }
);
const forFunPorchGlob = import.meta.glob(
  '../Photos/For Fun/The Porch/*.{jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: true }
);
const gradPicsGlob = import.meta.glob(
  '../Photos/Grad Pics/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: true }
);
const portraitGlob = import.meta.glob(
  '../Photos/Portrait/**/*.{jpg,JPG,jpeg,JPEG,png,PNG}',
  { eager: true }
);

const sessionName = (path) => path.split('/').slice(-2)[0];

function buildPhotos(glob, getTitle) {
  return Object.entries(glob).map(([path, mod], i) => ({
    id: i,
    src: mod.default,
    title: getTitle(path),
  }));
}

// ── Gallery data ───────────────────────────────────────────────────────────────

const galleries = [
  {
    id: 'home',
    label: 'Home',
    description: 'Candid moments and daily life.',
    photos: buildPhotos(forFunHomeGlob, () => 'Home'),
  },
  {
    id: 'the-porch',
    label: 'The Porch',
    description: 'Sessions at The Porch.',
    photos: buildPhotos(forFunPorchGlob, () => 'The Porch'),
  },
  {
    id: 'grad-pics',
    label: 'Grad Pics',
    description: 'Celebrating milestones and new chapters.',
    photos: buildPhotos(gradPicsGlob, sessionName),
  },
  {
    id: 'portrait',
    label: 'Portrait',
    description: 'People, expression, and the stories faces tell.',
    photos: buildPhotos(portraitGlob, sessionName),
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function GalleryCard({ gallery, index, onClick, dark }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const previews = gallery.photos.slice(0, 3);

  return (
    <div
      ref={ref}
      className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transitionDelay: `${index * 80}ms` }}
      onClick={() => onClick(gallery)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Cover */}
      <div className="relative h-52 bg-stone-300 dark:bg-stone-800 overflow-hidden">
        {previews.length > 0 && (
          <div className="absolute inset-0 grid gap-px" style={{ gridTemplateColumns: `repeat(${previews.length}, 1fr)` }}>
            {previews.map((p, i) => (
              <img key={i} src={p.src} alt="" className="w-full h-full object-cover" />
            ))}
          </div>
        )}
        <div className="absolute inset-0 bg-black/35 group-hover:bg-black/15 transition-all duration-500" />
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/70 to-transparent">
          <p className="text-white font-display text-xl">{gallery.label}</p>
          <p className="text-white/55 text-[12px] mt-0.5">{gallery.photos.length} photos</p>
        </div>
      </div>

      {/* Description */}
      <div className={`px-5 py-4 border-x border-b rounded-b-2xl transition-colors duration-300 ${dark ? "border-white/8 bg-white/[0.02]" : "border-[#b0a090] bg-[#ede8e0]"}`}>
        <p className={`text-[13px] leading-relaxed ${dark ? "text-white/50" : "text-[#3a3a3a]"}`}>{gallery.description}</p>
        <span className={`inline-flex items-center gap-2 mt-3 text-[11px] tracking-[0.15em] uppercase transition-all duration-300 ${dark ? "text-[#E8D5B7]/70 group-hover:text-[#E8D5B7]" : "text-[#6B4F2A]/80 group-hover:text-[#6B4F2A]"}`}>
          Browse gallery
          <svg className={`w-3 h-3 transition-transform duration-300 ${hovered ? "translate-x-1" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function PhotoCard({ photo, index, onClick }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={`group cursor-pointer break-inside-avoid mb-3 overflow-hidden rounded-xl transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}
      style={{ transitionDelay: `${(index % 6) * 60}ms` }}
      onClick={() => onClick(photo)}
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
          </div>
        </div>
      </div>
    </div>
  );
}

function Lightbox({ photo, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/92 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-4xl w-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
        <img
          src={photo.src}
          alt={photo.title}
          className="max-w-full max-h-[85vh] rounded-2xl object-contain"
        />
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl pointer-events-none">
          <p className="font-display text-2xl text-white">{photo.title}</p>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/70 transition-all duration-200">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Gallery detail view ────────────────────────────────────────────────────────

function GalleryDetail({ gallery, onBack, dark }) {
  const [lightbox, setLightbox] = useState(null);
  const [ref, inView] = useInView();

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const body = dark ? "text-white/50" : "text-[#3a3a3a]";
  const heading = dark ? "text-white" : "text-[#1a1a1a]";

  return (
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
      <button
        onClick={onBack}
        className={`flex items-center gap-2 mb-12 text-[12px] tracking-[0.15em] uppercase transition-colors duration-300 ${dark ? "text-white/35 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        All Galleries
      </button>

      <div ref={ref} className="mb-14">
        <div className={`transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-4 ${muted}`}>Photography · {gallery.label}</span>
          <h1 className={`font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.92] mb-5 ${heading}`}>{gallery.label}</h1>
          <p className={`max-w-md text-[15px] leading-relaxed ${body}`}>{gallery.description}</p>
        </div>
      </div>

      <div className="columns-2 md:columns-3 gap-3">
        {gallery.photos.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} index={i} onClick={setLightbox} />
        ))}
      </div>

      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </main>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Photography() {
  const { dark } = useTheme();
  const [activeGallery, setActiveGallery] = useState(null);
  const [headerRef, headerInView] = useInView();

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const body = dark ? "text-white/50" : "text-[#3a3a3a]";
  const heading = dark ? "text-white" : "text-[#1a1a1a]";
  const headingFaded = dark ? "text-white/30" : "text-[#7a6a5a]";

  if (activeGallery) {
    return <GalleryDetail gallery={activeGallery} onBack={() => setActiveGallery(null)} dark={dark} />;
  }

  return (
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
      <div ref={headerRef} className="mb-16">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${muted}`}>Photography</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${heading}`}>
            The world through<br />
            <span className={headingFaded}>my lens.</span>
          </h1>
          <p className={`max-w-lg text-[15px] leading-relaxed ${body}`}>
            Every image is an observation — a moment suspended in time. Browse by collection below.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {galleries.map((gallery, i) => (
          <GalleryCard key={gallery.id} gallery={gallery} index={i} onClick={setActiveGallery} dark={dark} />
        ))}
      </div>
    </main>
  );
}
