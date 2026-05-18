import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const projects = [
  { id: "EZSCrRH-s98", title: "The Beginning",                  tags: ["Personal"],  desc: "Where it all started."                              },
  { id: "kMMSE32bWWI", title: "CRWR 2026: REDEFINED",           tags: ["Event"],     desc: "Covering the CRWR 2026 event highlights."           },
  { id: "9TvsSfOUyfQ", title: "What did I even do this month?", tags: ["Vlog"],      desc: "A look back at a busy month."                       },
  { id: "JjLO0TkWRPM", title: "Did a lot, filmed a little.",    tags: ["Vlog"],      desc: "Life moves fast. The camera didn't always keep up." },
];

const ALL_TAGS = ["All", ...Array.from(new Set(projects.flatMap(p => p.tags)))];

const gear = [
  { name: "Sony A7 V",           type: "Camera"  },
  { name: "DJI Osmo Pocket 3",   type: "Camera"  },
  { name: "Sigma 24-70 f/2.8",   type: "Lens"    },
  { name: "Sony 70-200 f/2.8",   type: "Lens"    },
  { name: "Adobe Premiere Pro",  type: "Editing" },
  { name: "DJI mini",            type: "Audio"   },
];

function VideoModal({ project, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/50 hover:text-white transition-colors text-[12px] tracking-[0.2em] uppercase flex items-center gap-2"
        >
          Close
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl" style={{ paddingBottom: "56.25%" }}>
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${project.id}?autoplay=1&rel=0&modestbranding=1`}
            title={project.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl text-white/90">{project.title}</h3>
            {project.desc && <p className="text-[13px] text-white/40 mt-1">{project.desc}</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            {project.tags.map(tag => (
              <span key={tag} className="px-2 py-1 rounded border border-white/10 text-white/30 text-[10px] tracking-[0.1em] uppercase">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* Grid card */
function GridCard({ project, index, dark, onClick }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${project.id}/hqdefault.jpg`;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group cursor-pointer transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl mb-4 aspect-video bg-stone-800">
        <img src={thumb} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
          <div className={`w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 ${hovered ? "scale-110 bg-white/30" : ""}`}>
            <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
        {/* Hover overlay with desc */}
        <div className={`absolute inset-x-0 bottom-0 p-4 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
          <p className="text-white/70 text-[12px] leading-relaxed">{project.desc}</p>
        </div>
      </div>
      <h3 className={`font-display text-lg mb-2 transition-colors duration-300 ${dark ? (hovered ? "text-[#E8D5B7]" : "text-white") : (hovered ? "text-[#6B4F2A]" : "text-[#1a1a1a]")}`}>
        {project.title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <span key={tag} className={`px-2 py-1 rounded border text-[10px] tracking-[0.1em] uppercase ${dark ? "border-white/10 text-white/30" : "border-black/10 text-[#5a4a3a]"}`}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

/* List row */
function ListRow({ project, index, dark, onClick }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${project.id}/hqdefault.jpg`;

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group cursor-pointer flex items-center gap-5 py-4 border-b transition-all duration-700 ${dark ? "border-white/8 hover:border-white/20" : "border-[#b0a090] hover:border-[#8a7060]"} ${inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <span className={`text-[11px] tabular-nums w-6 shrink-0 ${dark ? "text-white/20" : "text-[#9a8a7a]"}`}>{String(index + 1).padStart(2, "0")}</span>
      <div className="relative w-28 aspect-video rounded-lg overflow-hidden shrink-0 bg-stone-800">
        <img src={thumb} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={`absolute inset-0 bg-black/30 flex items-center justify-center transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}>
          <svg className="w-4 h-4 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={`font-display text-base truncate transition-colors duration-200 ${dark ? (hovered ? "text-[#E8D5B7]" : "text-white/85") : (hovered ? "text-[#6B4F2A]" : "text-[#1a1a1a]")}`}>
          {project.title}
        </h3>
        <p className={`text-[12px] mt-0.5 truncate ${dark ? "text-white/30" : "text-[#9a8a7a]"}`}>{project.desc}</p>
      </div>
      <div className="hidden sm:flex gap-2 shrink-0">
        {project.tags.map(tag => (
          <span key={tag} className={`px-2 py-1 rounded border text-[9px] tracking-[0.1em] uppercase ${dark ? "border-white/10 text-white/25" : "border-black/10 text-[#9a8a7a]"}`}>{tag}</span>
        ))}
      </div>
      <svg className={`w-4 h-4 shrink-0 transition-all duration-200 ${dark ? "text-white/15 group-hover:text-white/40" : "text-black/15 group-hover:text-black/40"} ${hovered ? "translate-x-1" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
}

/* Featured hero */
function FeaturedHero({ project, dark }) {
  const [playing, setPlaying] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${project.id}/maxresdefault.jpg`;
  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";

  return (
    <div className="mb-6">
      <div className="relative w-full rounded-2xl overflow-hidden shadow-xl" style={{ paddingBottom: "56.25%" }}>
        {playing ? (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={`https://www.youtube.com/embed/${project.id}?autoplay=1&rel=0&modestbranding=1`}
            title={project.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setPlaying(true)}
          >
            <img src={thumb} alt={project.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/25 transition-all duration-300">
                <svg className="w-7 h-7 text-white translate-x-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
            <div className="absolute bottom-4 left-4">
              <span className={`text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded backdrop-blur-sm bg-black/40 text-white/60`}>Latest</span>
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h2 className={`font-display text-2xl ${dark ? "text-white" : "text-[#1a1a1a]"}`}>{project.title}</h2>
          <p className={`text-[13px] mt-1 ${muted}`}>{project.desc}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {project.tags.map(tag => (
            <span key={tag} className={`px-2 py-1 rounded border text-[10px] tracking-[0.1em] uppercase ${dark ? "border-white/10 text-white/30" : "border-black/10 text-[#5a4a3a]"}`}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Videography() {
  const { dark } = useTheme();
  const [headerRef, headerInView] = useInView();
  const [gearRef, gearInView] = useInView();
  const [activeTag, setActiveTag]   = useState("All");
  const [view, setView]             = useState("grid");
  const [gearOpen, setGearOpen]     = useState(false);
  const [selected, setSelected]     = useState(null);

  const muted        = dark ? "text-white/30"  : "text-[#5a4a3a]";
  const body         = dark ? "text-white/45"  : "text-[#3a3a3a]";
  const heading      = dark ? "text-white"     : "text-[#1a1a1a]";
  const headingFaded = dark ? "text-white/30"  : "text-[#7a6a5a]";
  const border       = dark ? "border-white/8" : "border-[#b0a090]";

  const pillBase     = "px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase transition-all duration-200 border";
  const pillActive   = dark ? "bg-white text-[#080808] border-white" : "bg-[#1a1a1a] text-white border-[#1a1a1a]";
  const pillInactive = dark ? "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60" : "border-black/10 text-[#5a4a3a] hover:border-black/25 hover:text-[#1a1a1a]";

  const featured = projects[0];
  const rest      = projects.slice(1);
  const filtered  = activeTag === "All" ? rest : rest.filter(p => p.tags.includes(activeTag));

  return (
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-6xl mx-auto">

      {/* Header */}
      <div ref={headerRef} className="mb-16">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${muted}`}>Videography</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${heading}`}>
            Documenting<br /><span className={headingFaded}>Life.</span>
          </h1>
          <p className={`max-w-lg text-[15px] leading-relaxed ${body}`}>
            The main goal of my videography is to capture and document things happening in my life.
          </p>
        </div>
      </div>

      {/* Featured hero */}
      <FeaturedHero project={featured} dark={dark} />

      {/* Channel link */}
      <a
        href="https://www.youtube.com/@1tobyan"
        target="_blank"
        rel="noopener noreferrer"
        className={`mb-16 mt-2 inline-flex items-center gap-2 text-[12px] tracking-[0.15em] uppercase transition-all duration-300 ${dark ? "text-white/30 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        View full channel @1tobyan
      </a>

      {/* Controls: tag filter + view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          {ALL_TAGS.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)} className={`${pillBase} ${activeTag === tag ? pillActive : pillInactive}`}>{tag}</button>
          ))}
        </div>

        {/* View toggle */}
        <div className={`flex items-center rounded-lg border overflow-hidden ${border}`}>
          <button
            onClick={() => setView("grid")}
            className={`px-3 py-2 transition-colors duration-200 ${view === "grid" ? (dark ? "bg-white/10 text-white" : "bg-black/8 text-[#1a1a1a]") : (dark ? "text-white/30 hover:text-white/60" : "text-[#9a8a7a] hover:text-[#3a3a3a]")}`}
            aria-label="Grid view"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
              <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
            </svg>
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-3 py-2 transition-colors duration-200 ${view === "list" ? (dark ? "bg-white/10 text-white" : "bg-black/8 text-[#1a1a1a]") : (dark ? "text-white/30 hover:text-white/60" : "text-[#9a8a7a] hover:text-[#3a3a3a]")}`}
            aria-label="List view"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
              <rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/>
            </svg>
          </button>
        </div>
      </div>

      <p className={`text-[11px] tracking-[0.35em] uppercase mb-8 ${muted}`}>
        {activeTag === "All" ? "More Videos" : activeTag}
        {activeTag !== "All" && filtered.length > 0 && <span className="ml-3">— {filtered.length} video{filtered.length !== 1 ? "s" : ""}</span>}
      </p>

      {/* Grid or list */}
      {filtered.length === 0 ? (
        <p className={`text-[13px] py-12 text-center ${muted}`}>No videos in this category.</p>
      ) : view === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {filtered.map((p, i) => (
            <GridCard key={p.id} project={p} index={i} dark={dark} onClick={() => setSelected(p)} />
          ))}
        </div>
      ) : (
        <div className={`mb-24 border-t ${border}`}>
          {filtered.map((p, i) => (
            <ListRow key={p.id} project={p} index={i} dark={dark} onClick={() => setSelected(p)} />
          ))}
        </div>
      )}

      {/* Gear — collapsible */}
      <div ref={gearRef}>
        <button
          onClick={() => setGearOpen(o => !o)}
          className={`w-full flex items-center justify-between py-4 border-t transition-colors duration-200 group ${border} ${dark ? "hover:border-white/20" : "hover:border-[#8a7060]"}`}
        >
          <span className={`text-[11px] tracking-[0.35em] uppercase ${muted}`}>My Gear</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${muted} ${gearOpen ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div className={`overflow-hidden transition-all duration-500 ${gearOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-4 pb-8">
            {gear.map(({ name, type }, i) => (
              <div
                key={name}
                className={`p-5 rounded-xl border transition-all duration-700 ${dark ? "border-white/8 bg-white/[0.02]" : "border-[#b0a090] bg-[#ede8e0]"} ${gearOpen && gearInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <p className={`text-[10px] tracking-[0.25em] uppercase mb-2 ${muted}`}>{type}</p>
                <p className={`text-[14px] ${dark ? "text-white/70" : "text-black/65"}`}>{name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selected && <VideoModal project={selected} onClose={() => setSelected(null)} dark={dark} />}
    </main>
  );
}
