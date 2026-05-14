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

const photos = [
  { id: 1, title: "Golden Hour", location: "Sedona, AZ", aspect: "tall", gradient: "from-amber-900 via-orange-800 to-red-900", category: "Landscape" },
  { id: 2, title: "Urban Geometry", location: "New York, NY", aspect: "wide", gradient: "from-slate-800 via-slate-700 to-zinc-800", category: "Architecture" },
  { id: 3, title: "Misty Peaks", location: "Colorado", aspect: "square", gradient: "from-blue-900 via-slate-700 to-slate-900", category: "Landscape" },
  { id: 4, title: "City Lights", location: "Chicago, IL", aspect: "tall", gradient: "from-indigo-900 via-purple-900 to-slate-900", category: "Urban" },
  { id: 5, title: "Still Life", location: "Studio", aspect: "square", gradient: "from-stone-700 via-stone-600 to-stone-800", category: "Still Life" },
  { id: 6, title: "The Coast", location: "Big Sur, CA", aspect: "wide", gradient: "from-teal-900 via-cyan-800 to-blue-900", category: "Landscape" },
  { id: 7, title: "Portraits", location: "Austin, TX", aspect: "tall", gradient: "from-rose-900 via-pink-900 to-slate-900", category: "Portrait" },
  { id: 8, title: "Forest Path", location: "Pacific NW", aspect: "square", gradient: "from-green-900 via-emerald-800 to-slate-900", category: "Nature" },
  { id: 9, title: "Reflections", location: "Portland, OR", aspect: "wide", gradient: "from-sky-900 via-blue-800 to-indigo-900", category: "Urban" },
];

const categories = ["All", "Landscape", "Architecture", "Urban", "Portrait", "Nature", "Still Life"];

function PhotoCard({ photo, index, onClick }) {
  const [ref, inView] = useInView();
  const aspectClass = photo.aspect === "tall" ? "row-span-2" : photo.aspect === "wide" ? "col-span-2" : "";

  return (
    <div
      ref={ref}
      className={`group cursor-pointer overflow-hidden rounded-xl ${aspectClass} transition-all duration-700 ${inView ? "opacity-100 scale-100" : "opacity-0 scale-[0.97]"}`}
      style={{ transitionDelay: `${(index % 3) * 80}ms` }}
      onClick={() => onClick(photo)}
    >
      <div className={`w-full h-full min-h-[200px] bg-gradient-to-br ${photo.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-400 flex items-end p-5">
          <div className="translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-400">
            <p className="text-white font-display text-lg leading-tight">{photo.title}</p>
            <p className="text-white/60 text-[12px] tracking-[0.1em] mt-1">{photo.location}</p>
          </div>
        </div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
          <span className="px-2 py-1 rounded-full bg-black/40 text-[10px] tracking-[0.1em] uppercase text-white/70 backdrop-blur-sm">
            {photo.category}
          </span>
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
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm" onClick={onClose}>
      <div className="relative max-w-3xl w-full max-h-[85vh] rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`w-full h-[60vh] bg-gradient-to-br ${photo.gradient}`} />
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
          <p className="font-display text-2xl text-white">{photo.title}</p>
          <p className="text-white/50 text-sm mt-1">{photo.location} · {photo.category}</p>
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

export default function Photography() {
  const { dark } = useTheme();
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState(null);
  const [headerRef, headerInView] = useInView();

  const filtered = active === "All" ? photos : photos.filter(p => p.category === active);

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const body = dark ? "text-white/45" : "text-[#3a3a3a]";

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
            Every image is an observation — a moment suspended in time. I shoot landscapes, architecture, and portraits with a love for natural light and quiet compositions.
          </p>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-[12px] tracking-[0.1em] uppercase transition-all duration-300 ${
              active === cat
                ? dark ? "bg-white text-[#080808]" : "bg-[#1a1a1a] text-white"
                : dark ? "border border-white/15 text-white/40 hover:text-white/70 hover:border-white/30"
                       : "border border-black/15 text-[#4a4a4a] hover:text-black/70 hover:border-black/30"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] gap-3">
        {filtered.map((photo, i) => (
          <PhotoCard key={photo.id} photo={photo} index={i} onClick={setLightbox} />
        ))}
      </div>

      {lightbox && <Lightbox photo={lightbox} onClose={() => setLightbox(null)} />}
    </main>
  );
}