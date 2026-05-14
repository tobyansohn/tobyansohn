import { useEffect, useRef, useState } from "react";
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
  { id: "EZSCrRH-s98", title: "The Beginning", tags: ["Personal", "Intro"] },
  { id: "kMMSE32bWWI", title: "CRWR 2026: REDEFINED", tags: ["Event", "Highlight"] },
  { id: "9TvsSfOUyfQ", title: "What did I even do this month?", tags: ["Monthly", "Vlog"] },
  { id: "JjLO0TkWRPM", title: "Did a lot, filmed a little.", tags: ["Vlog", "Personal"] },
];

const gear = [
  { name: "Sony A7 IV", type: "Camera" },
  { name: "DJI Mavic 3 Pro", type: "Drone" },
  { name: "Sigma 24-70 f/2.8", type: "Lens" },
  { name: "DaVinci Resolve", type: "Color Grade" },
  { name: "Adobe Premiere Pro", type: "Editing" },
  { name: "Rode Wireless GO II", type: "Audio" },
];

function VideoCard({ project, index, dark }) {
  const [ref, inView] = useInView();
  const [hovered, setHovered] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${project.id}/hqdefault.jpg`;
  const url = `https://youtu.be/${project.id}`;

  return (
    <a
      ref={ref}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative overflow-hidden rounded-2xl mb-5 h-52 bg-stone-800">
        <img
          src={thumb}
          alt={project.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-400 flex items-center justify-center">
          <div className={`w-14 h-14 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 flex items-center justify-center transition-all duration-300 ${hovered ? "scale-110 bg-white/25" : ""}`}>
            <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>
      <h3 className={`font-display text-xl mb-3 transition-colors duration-300 ${dark ? (hovered ? "text-[#E8D5B7]" : "text-white") : (hovered ? "text-[#6B4F2A]" : "text-[#1a1a1a]")}`}>{project.title}</h3>
      <div className="flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <span key={tag} className={`px-2 py-1 rounded border text-[10px] tracking-[0.1em] uppercase ${dark ? "border-white/10 text-white/30" : "border-black/10 text-[#5a4a3a]"}`}>{tag}</span>
        ))}
      </div>
    </a>
  );
}

export default function Videography() {
  const { dark } = useTheme();
  const [headerRef, headerInView] = useInView();
  const [gearRef, gearInView] = useInView();

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const body = dark ? "text-white/45" : "text-[#3a3a3a]";
  const heading = dark ? "text-white" : "text-[#1a1a1a]";
  const headingFaded = dark ? "text-white/30" : "text-[#7a6a5a]";

  return (
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-6xl mx-auto">
      <div ref={headerRef} className="mb-24">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${muted}`}>Videography</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${heading}`}>
            Motion that<br /><span className={headingFaded}>moves you.</span>
          </h1>
          <p className={`max-w-lg text-[15px] leading-relaxed ${body}`}>
            I tell stories through motion, color, and sound. Every frame is intentional; every cut serves the narrative.
          </p>
        </div>
      </div>

      {/* Channel CTA */}
      <a
        href="https://www.youtube.com/@1tobyan"
        target="_blank"
        rel="noopener noreferrer"
        className={`mb-20 relative overflow-hidden rounded-3xl h-64 md:h-80 border flex items-center justify-center cursor-pointer group ${dark ? "bg-gradient-to-r from-slate-900 via-zinc-900 to-stone-900 border-white/8" : "bg-gradient-to-r from-stone-200 via-zinc-200 to-slate-200 border-[#b0a090]"}`}
      >
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(232,213,183,0.08)_0%,transparent_70%)]" />
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full border flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all duration-400 ${dark ? "bg-white/8 border-white/15 group-hover:bg-white/12" : "bg-black/8 border-black/15 group-hover:bg-black/12"}`}>
            <svg className={`w-8 h-8 translate-x-1 ${dark ? "text-white" : "text-black"}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className={`font-display text-2xl mb-2 ${heading}`}>Watch on YouTube</p>
          <p className={`text-[13px] tracking-[0.1em] ${muted}`}>@1tobyan</p>
        </div>
      </a>

      <p className={`text-[11px] tracking-[0.35em] uppercase mb-10 ${muted}`}>Recent Projects</p>
      <div className="grid md:grid-cols-2 gap-10 mb-24">
        {projects.map((p, i) => <VideoCard key={p.title} project={p} index={i} dark={dark} />)}
      </div>

      {/* Gear */}
      <div ref={gearRef}>
        <p className={`text-[11px] tracking-[0.35em] uppercase mb-8 ${muted}`}>My Gear</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {gear.map(({ name, type }, i) => (
            <div key={name} className={`p-5 rounded-xl border transition-all duration-700 ${dark ? "border-white/8 bg-white/[0.02]" : "border-[#b0a090] bg-[#ede8e0]"} ${gearInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${i * 70}ms` }}>
              <p className={`text-[10px] tracking-[0.25em] uppercase mb-2 ${muted}`}>{type}</p>
              <p className={`text-[14px] ${dark ? "text-white/70" : "text-black/65"}`}>{name}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}