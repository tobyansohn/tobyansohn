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
  { title: "Brand Film – Acme Co.", description: "A 3-minute brand documentary capturing the company's founding story and vision for the future.", tags: ["Brand", "Documentary", "4K"], duration: "3:24", gradient: "from-amber-900 via-orange-900 to-red-950" },
  { title: "Event Highlight – TechConf '24", description: "Fast-paced highlight reel from a two-day developer conference with 800+ attendees.", tags: ["Event", "Fast-cut", "Drone"], duration: "2:10", gradient: "from-indigo-900 via-blue-950 to-slate-900" },
  { title: "Music Video – Artist Name", description: "Cinematic music video with narrative arc, shot over two days in multiple locations.", tags: ["Music Video", "Narrative", "Color Grade"], duration: "4:07", gradient: "from-rose-900 via-pink-950 to-slate-950" },
  { title: "Product Launch – XYZ Device", description: "Sleek product reveal video combining macro photography, motion graphics, and voiceover.", tags: ["Product", "Motion Graphics", "Studio"], duration: "1:45", gradient: "from-slate-800 via-zinc-800 to-slate-900" },
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

  return (
    <div
      ref={ref}
      className={`group cursor-pointer transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{ transitionDelay: `${index * 100}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`relative overflow-hidden rounded-2xl mb-5 h-52 bg-gradient-to-br ${project.gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all duration-400 ${hovered ? "scale-110 bg-white/20" : ""}`}>
            <svg className="w-5 h-5 text-white translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/50 text-white/80 text-[11px] font-mono backdrop-blur-sm">
          {project.duration}
        </div>
      </div>
      <h3 className={`font-display text-xl mb-2 transition-colors duration-300 ${dark ? (hovered ? "text-[#E8D5B7]" : "text-white") : (hovered ? "text-[#6B4F2A]" : "text-[#1a1a1a]")}`}>{project.title}</h3>
      <p className={`text-[13px] leading-relaxed mb-4 ${dark ? "text-white/40" : "text-[#4a4a4a]"}`}>{project.description}</p>
      <div className="flex flex-wrap gap-2">
        {project.tags.map(tag => (
          <span key={tag} className={`px-2 py-1 rounded border text-[10px] tracking-[0.1em] uppercase ${dark ? "border-white/10 text-white/30" : "border-black/10 text-[#5a4a3a]"}`}>{tag}</span>
        ))}
      </div>
    </div>
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
            From brand films to music videos — I tell stories through motion, color, and sound. Every frame is intentional; every cut serves the narrative.
          </p>
        </div>
      </div>

      {/* Showreel CTA */}
      <div className={`mb-20 relative overflow-hidden rounded-3xl h-64 md:h-80 border flex items-center justify-center cursor-pointer group ${dark ? "bg-gradient-to-r from-slate-900 via-zinc-900 to-stone-900 border-white/8" : "bg-gradient-to-r from-stone-200 via-zinc-200 to-slate-200 border-[#b0a090]"}`}>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(232,213,183,0.08)_0%,transparent_70%)]" />
        <div className="text-center">
          <div className={`w-20 h-20 rounded-full border flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-all duration-400 ${dark ? "bg-white/8 border-white/15 group-hover:bg-white/12" : "bg-black/8 border-black/15 group-hover:bg-black/12"}`}>
            <svg className={`w-8 h-8 translate-x-1 ${dark ? "text-white" : "text-black"}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          <p className={`font-display text-2xl mb-2 ${heading}`}>Watch My Showreel</p>
          <p className={`text-[13px] tracking-[0.1em] ${muted}`}>2024 · 3 min</p>
        </div>
      </div>

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