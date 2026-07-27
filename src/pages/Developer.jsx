import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css"; // co-located so it ships with the Developer chunk only
import { useTheme } from "../context/ThemeContext.jsx";
import SFXLibrary from "../components/SFXLibrary.jsx";
import GitHubContributions from "../components/GitHubContributions.jsx";
import ProjectModal from "../components/ProjectModal.jsx";

function WaterCanvas({ dark }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;
    const ripples = [];
    let lastX = 0, lastY = 0;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const spawnRipple = (x, y) => {
      // spawn 3 concentric rings with staggered delays, like real water
      [0, 120, 260].forEach((delay, i) => {
        setTimeout(() => {
          ripples.push({
            x, y,
            r: 1,
            maxR: 28 + i * 14 + Math.random() * 8,
            speed: 0.55 - i * 0.06,
            peak: 0.12 - i * 0.025,
          });
        }, delay);
      });
    };

    const onMove = (e) => {
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      if (Math.sqrt(dx * dx + dy * dy) < 18) return;
      lastX = e.clientX; lastY = e.clientY;
      spawnRipple(e.clientX, e.clientY);
    };

    const color = dark ? "232,178,87" : "45,74,43";

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.r += rip.speed;
        const progress = rip.r / rip.maxR;
        // bell-curve opacity — fades in then out for natural look
        const opacity = rip.peak * Math.sin(progress * Math.PI);
        if (progress >= 1) { ripples.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${color},${opacity})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      animId = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove);
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animId);
    };
  }, [dark]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

const travelSpots = [
  { name: "Cabo, Mexico", lat: 22.8905, lng: -109.9167 },
  { name: "New York",     lat: 40.7128, lng: -74.0060  },
];

const homePin = { name: "Austin, TX — Home", lat: 30.2672, lng: -97.7431 };

function makeTravelIcon(dark) {
  const color = dark ? "#E8B257" : "#2D4A2B";
  const glow = dark ? "rgba(232,178,87,0.25)" : "rgba(45,74,43,0.2)";
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;background:${color};border:2px solid ${color};border-radius:50%;box-shadow:0 0 0 4px ${glow};cursor:pointer;"></div>`,
    iconSize: [12, 12], iconAnchor: [6, 6],
  });
}

function makeHomeIcon(dark) {
  const color = dark ? "#8B9DC3" : "#3A5FA0";
  const glow = dark ? "rgba(139,157,195,0.2)" : "rgba(58,95,160,0.2)";
  return L.divIcon({
    className: "",
    html: `<div style="width:12px;height:12px;background:${color};border:2px solid ${color};border-radius:50%;box-shadow:0 0 0 4px ${glow};"></div>`,
    iconSize: [12, 12], iconAnchor: [6, 6],
  });
}

function TravelMap({ dark }) {
  const navigate = useNavigate();
  return (
    <div className={`overflow-hidden border ${dark ? "border-white/12" : "border-[#C8B996]"}`} style={{ height: 320 }}>
      <MapContainer
        center={[25, -50]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: dark ? "#16221C" : "#E0D5BA" }}
        zoomControl={true}
        attributionControl={false}
      >
        <TileLayer url={dark
          ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        } />
        {travelSpots.map(spot => (
          <Marker
            key={spot.name}
            position={[spot.lat, spot.lng]}
            icon={makeTravelIcon(dark)}
            eventHandlers={{ click: () => navigate(`/photography?category=Travels&sub=${encodeURIComponent(spot.name)}`) }}
          >
            <Tooltip direction="top" offset={[0, -8]} className="travel-tooltip">{spot.name}</Tooltip>
          </Marker>
        ))}
        <Marker
          position={[homePin.lat, homePin.lng]}
          icon={makeHomeIcon(dark)}
          eventHandlers={{ click: () => navigate(`/photography?category=Travels&sub=${encodeURIComponent("Austin, TX")}`) }}
        >
          <Tooltip direction="top" offset={[0, -8]} className="travel-tooltip">{homePin.name}</Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}

const projects = [
  {
    title: "Franchise Lab",
    year: "2026",
    status: "In Progress",
    description: "A football take on the build-a-player draft game — construct the perfect baller from NFL history across 9 attribute rounds, drafting players pooled from team-eras spanning the 1960s Packers to the 2020s Chiefs.",
    highlights: [
      "9 rounds, one per attribute (Speed, Arm Talent, Coverage, Football IQ…), each drawing players from 3 randomly chosen team-eras",
      "Three modes: Classic (ratings shown), Blind (pick from memory), and a daily seeded draft shared by everyone that day",
      "Per-round Respin Teams and Respin Stat to reroll the team-eras or swap the round's attribute",
      "~290 individually-rated players across 24 team-eras, hand-authored as static data — no backend",
    ],
    tags: ["React", "Vite", "Tailwind CSS", "Game Design"],
    link: "https://github.com/tobyansohn",
    liveUrl: null,
  },
  {
    title: "Agent Command Center",
    year: "2025",
    status: "Live",
    description: "RPG-themed desktop command center where Claude agents live as pixel-art characters in a fantasy world. Talk to Claude (the Oracle), who collaborates with specialist agents behind the scenes — each with a Pokémon identity, room, and role.",
    highlights: [
      "Six Claude agents with distinct personalities, sprites, and tool-use capabilities",
      "Oracle orchestrates parallel specialist consultations with mid-task clarifications",
      "Hermes (Metagross) auto-logs significant interactions to an Obsidian-compatible Library",
      "8-directional pixel-art walk cycles across a procedurally roaming world map",
    ],
    tags: ["Electron", "Claude API", "Tool Use", "Pixel Art"],
    link: "https://github.com/tobyansohn/Agent-Command-Center",
    liveUrl: null,
  },
  {
    title: "Socials Dashboard",
    year: "2025",
    status: "In Progress",
    description: "Full-stack social media analytics dashboard with per-user linked accounts, charts, a creative hub, and multi-platform reporting across Instagram, TikTok, YouTube, and more.",
    highlights: [
      "Per-user OAuth-linked accounts for Instagram, TikTok, YouTube, and more",
      "Recharts-powered analytics with historical trend data",
      "Creative hub for managing and organizing content assets",
      "Aggregated multi-platform reporting in a single view",
    ],
    tags: ["React", "TypeScript", "Node.js", "Tailwind"],
    link: "https://github.com/tobyansohn",
    liveUrl: null,
  },
  {
    title: "Pokémon TCG Tracker",
    year: "2025",
    status: "Live",
    description: "Tracks Special Illustration Rare and Illustration Rare cards every 12 hours via the Pokémon TCG API, storing price snapshots in Redis to surface which cards are climbing fastest in market value.",
    highlights: [
      "12-hour automated price snapshots stored in Redis",
      "Tracks SIR and IR rarity cards via the Pokémon TCG API",
      "Surfaces fastest-rising cards ranked by price change",
      "Vercel cron jobs for fully automated data collection",
    ],
    tags: ["Pokémon TCG API", "Redis", "Vercel", "Node.js"],
    link: "https://github.com/tobyansohn",
    liveUrl: "/developer",
  },
  {
    title: "TobyanSohn.com",
    year: "2024",
    status: "Live",
    description: "This portfolio — a personal creative platform showcasing photography, videography, and development work. Custom cursor, water ripple canvas, page transitions, and a full dark/light mode.",
    highlights: [
      "Custom water-ripple canvas effect that follows the cursor",
      "Animated page transitions via React Router",
      "Full dark/light mode with smooth color transitions",
      "Embedded Pokémon TCG Tracker, Meal Generator, and SFX Library",
    ],
    tags: ["React", "Vite", "Tailwind CSS", "Vercel"],
    link: "https://github.com/tobyansohn",
    liveUrl: "https://tobyansohn.com",
  },
];

const skills = [
  "React", "TypeScript", "Node.js", "Python",
  "Tailwind CSS", "Vite", "Vercel", "Redis",
  "Claude API", "Git", "SQL", "REST APIs",
];

function ProjectCard({ project, index, dark }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <motion.div
        onClick={() => setOpen(true)}
        className={`group border-b py-10 cursor-pointer ${dark ? "border-white/12" : "border-black/12"}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
        whileHover={{ x: 6, transition: { type: "spring", stiffness: 340, damping: 30 } }}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
          <span className={`text-[11px] font-medium tracking-[0.24em] uppercase shrink-0 pt-2 md:w-16 ${dark ? "text-white/35" : "text-[#7A6B53]"}`}>{project.year}</span>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className={`font-light tracking-tight text-2xl md:text-3xl transition-colors duration-300 ${dark ? "text-white group-hover:text-[#E8B257]" : "text-[#2A2014] group-hover:text-[#2D4A2B]"}`}>{project.title}</h3>
                <span className={`text-[10px] tracking-[0.18em] uppercase font-medium ${project.status === "Live" ? "text-emerald-400" : "text-amber-400"}`}>{project.status}</span>
              </div>
              <svg className={`shrink-0 w-4 h-4 mt-1 opacity-0 group-hover:opacity-100 transition-[color,opacity,transform] duration-200 ease-snappy group-hover:translate-x-px group-hover:-translate-y-px ${dark ? "text-white/60" : "text-[#4A3D2D]"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </div>
            <p className={`text-[15px] leading-relaxed mb-5 max-w-xl ${dark ? "text-white/55" : "text-[#3D2F1F]"}`}>{project.description}</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {project.tags.map(tag => (
                <span key={tag} className={`text-[10px] tracking-[0.16em] uppercase font-medium ${dark ? "text-white/35" : "text-[#7A6B53]"}`}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
      {open && <ProjectModal project={project} onClose={() => setOpen(false)} dark={dark} />}
    </>
  );
}

function CardModal({ card, onClose, dark }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm" onClick={onClose}>
      <div className={`relative border p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6 w-full sm:max-w-md ${dark ? "bg-[#111] border-white/10" : "bg-[#E6DBC0] border-[#C8B996]"}`} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className={`absolute top-4 right-4 w-8 h-8 flex items-center justify-center transition-colors ${dark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/10"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <img
          src={card.imageLarge || card.image}
          alt={card.name}
          className="w-36 h-auto object-contain mx-auto sm:mx-0 shrink-0"
        />

        <div className="flex flex-col justify-center gap-3">
          <div>
            <p className={`font-light tracking-tight text-xl leading-tight ${dark ? "text-white" : "text-[#2A2014]"}`}>{card.name}</p>
            <p className={`text-[10px] tracking-[0.18em] uppercase font-medium mt-1.5 ${dark ? "text-white/35" : "text-[#5A4A36]"}`}>{card.set}</p>
            {card.rarity && <p className={`text-[11px] mt-0.5 ${dark ? "text-white/30" : "text-[#9A8A70]"}`}>{card.rarity}</p>}
          </div>

          <div className={`h-px ${dark ? "bg-white/12" : "bg-black/12"}`} />

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className={`text-[10px] tracking-[0.2em] uppercase font-medium mb-1.5 ${dark ? "text-white/35" : "text-[#5A4A36]"}`}>Market Price</p>
              <p className={`font-light tracking-tight text-3xl tabular-nums ${dark ? "text-white" : "text-[#2A2014]"}`}>${card.market.toFixed(2)}</p>
              {card.prevMarket && (
                <p className={`text-[11px] tabular-nums ${dark ? "text-white/30" : "text-[#9A8A70]"}`}>prev. ${card.prevMarket.toFixed(2)}</p>
              )}
            </div>
            {card.change !== null && (
              <div className={`flex items-center gap-1 text-[13px] font-medium tabular-nums ${card.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d={card.change >= 0 ? "M12 4l8 16H4z" : "M12 20L4 4h16z"} />
                </svg>
                {Math.abs(card.change).toFixed(1)}%
              </div>
            )}
          </div>

          <a
            href={`https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(card.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] tracking-[0.18em] uppercase font-medium flex items-center gap-1.5 transition-colors ${dark ? "text-white/35 hover:text-[#E8B257]" : "text-[#5A4A36] hover:text-[#2D4A2B]"}`}
          >
            View on TCGPlayer
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </a>
        </div>
      </div>
    </div>,
    document.body
  );
}

const CUISINES = ['any','American','British','Chinese','French','Indian','Italian','Japanese','Mexican','Thai'];
const WEIGHTS  = ['any','light','medium','heavy'];
const TIMES    = ['any','quick','medium','long'];

function parseMealSteps(text) {
  if (!text) return [];
  let parts = text.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  parts = parts.filter(p => !/^(step\s*)?\d+[\.\):]?\s*$/i.test(p));
  parts = parts.map(p => p.replace(/^(step\s*)?\d+[\.\):\-]\s*/i, '').trim()).filter(Boolean);
  if (parts.length <= 2) {
    const sentences = text.replace(/\r?\n/g, ' ').split(/(?<=[.!?])\s+(?=[A-Z])/);
    const chunks = []; let cur = '';
    for (const s of sentences) {
      cur += (cur ? ' ' : '') + s;
      if (cur.length > 120) { chunks.push(cur.trim()); cur = ''; }
    }
    if (cur.trim()) chunks.push(cur.trim());
    return chunks.filter(Boolean);
  }
  return parts;
}

function MealCard({ course, meal, dark }) {
  const [open, setOpen] = useState(false);
  const border = dark ? "border-white/12" : "border-[#C8B996]";
  const muted  = dark ? "text-white/35" : "text-[#5A4A36]";

  const badgeColor = {
    quick: "text-emerald-400 bg-emerald-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    long: "text-red-400 bg-red-400/10",
    light: "text-sky-400 bg-sky-400/10",
    heavy: dark ? "text-[#E8B257] bg-[#E8B257]/10" : "text-[#2D4A2B] bg-[#2D4A2B]/10",
  };

  return (
    <>
      <div
        onClick={() => meal && setOpen(true)}
        className={`border overflow-hidden transition-colors duration-150 ${border} ${dark ? "bg-white/[0.02] hover:bg-white/[0.05]" : "bg-[#F5EEDC] hover:bg-[#EBE0C7]"} ${meal ? "cursor-pointer hover:scale-[1.01]" : ""}`}
      >
        {meal ? (
          <>
            <div className="relative aspect-video overflow-hidden">
              <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={`absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase font-medium px-2 py-1 ${dark ? "bg-black/50 text-white/70" : "bg-black/40 text-white/80"} backdrop-blur-sm`}>
                {course}
              </span>
              <span className={`absolute bottom-3 right-3 text-[9px] tracking-[0.12em] uppercase font-medium px-2 py-1 bg-black/50 text-white/70 backdrop-blur-sm`}>
                View Recipe →
              </span>
            </div>
            <div className="p-4">
              <p className={`font-light tracking-tight text-lg leading-tight mb-1.5 ${dark ? "text-white/90" : "text-[#2A2014]"}`}>{meal.strMeal}</p>
              <p className={`text-[10px] tracking-[0.12em] uppercase font-medium mb-3 ${muted}`}>{meal.strArea} · {meal.strCategory}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {meal.cookTimeEstimate !== 'unknown' && (
                  <span className={`text-[10px] tracking-[0.1em] uppercase font-medium ${(badgeColor[meal.cookTimeEstimate] || "").split(" ")[0] || muted}`}>
                    {meal.cookTimeEstimate}
                  </span>
                )}
                {meal.weightEstimate !== 'unknown' && (
                  <span className={`text-[10px] tracking-[0.1em] uppercase font-medium ${(badgeColor[meal.weightEstimate] || "").split(" ")[0] || muted}`}>
                    {meal.weightEstimate}
                  </span>
                )}
                <span className={`text-[10px] tracking-[0.1em] uppercase font-medium ${muted}`}>
                  {meal.ingredients?.length} ingredients
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="aspect-video flex items-center justify-center">
            <p className={`text-[11px] tracking-[0.2em] uppercase font-medium ${muted}`}>{course}</p>
          </div>
        )}
      </div>

      {open && meal && createPortal(
        <div
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className={`relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto border ${dark ? "bg-[#111] border-white/10" : "bg-[#F5EEDC] border-[#C8B996]"}`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-4 border-b ${dark ? "bg-[#111] border-white/12" : "bg-[#F5EEDC] border-[#D8CCAE]"}`}>
              <div>
                <p className={`text-[9px] tracking-[0.2em] uppercase font-medium mb-1.5 ${muted}`}>{course}</p>
                <h2 className={`font-light tracking-tight text-2xl leading-tight ${dark ? "text-white" : "text-[#2A2014]"}`}>{meal.strMeal}</h2>
                <p className={`text-[10px] tracking-[0.12em] uppercase font-medium mt-1.5 ${muted}`}>{meal.strArea} · {meal.strCategory}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className={`shrink-0 mt-1 text-lg leading-none px-2 py-1 transition-colors ${dark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/8"}`}
              >✕</button>
            </div>

            {/* Image */}
            <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-48 object-cover" />

            {/* Body */}
            <div className="p-6 grid md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <p className={`text-[11px] tracking-[0.24em] uppercase font-medium mb-4 ${dark ? "text-[#E8B257]/70" : "text-[#2D4A2B]/80"}`}>Ingredients</p>
                <ul className="flex flex-col gap-2">
                  {meal.ingredients?.map(({ measure, name }, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className={`shrink-0 w-20 text-[11px] font-medium ${dark ? "text-white/80" : "text-[#2A2014]"}`}>{measure}</span>
                      <span className={dark ? "text-white/50" : "text-[#5A4A36]"}>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Method */}
              <div>
                <p className={`text-[11px] tracking-[0.24em] uppercase font-medium mb-4 ${dark ? "text-[#E8B257]/70" : "text-[#2D4A2B]/80"}`}>Method</p>
                <ol className="flex flex-col gap-4">
                  {parseMealSteps(meal.strInstructions).map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                      <span className={`shrink-0 w-5 h-5 mt-0.5 flex items-center justify-center text-[10px] font-medium tabular-nums ${dark ? "bg-[#E8B257]/15 text-[#E8B257]" : "bg-[#2D4A2B]/10 text-[#2D4A2B]"}`}>{i + 1}</span>
                      <span className={dark ? "text-white/60" : "text-[#3D2F1F]"}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer */}
            {meal.strYoutube && (
              <div className={`px-6 pb-6 pt-0`}>
                <a
                  href={meal.strYoutube} target="_blank" rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className={`inline-flex items-center gap-2 text-[10px] tracking-[0.18em] uppercase font-medium pb-1 border-b transition-colors ${dark ? "border-white/20 text-white/45 hover:text-[#E8B257] hover:border-[#E8B257]/50" : "border-black/20 text-[#9A8A70] hover:text-[#2D4A2B] hover:border-[#2D4A2B]/50"}`}
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  Watch on YouTube
                </a>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function MealGeneratorWidget({ dark }) {
  const [meals, setMeals]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [ready, setReady]       = useState(!!window.MealGenerator);
  const [cuisine, setCuisine]   = useState('any');
  const [weight, setWeight]     = useState('any');
  const [cookTime, setCookTime] = useState('any');
  const muted  = dark ? "text-white/35" : "text-[#5A4A36]";
  const border = dark ? "border-white/12" : "border-[#C8B996]";

  useEffect(() => {
    if (window.MealGenerator) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = '/meal-generator.js';
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  const pillBase     = "pb-1 text-[10px] tracking-[0.16em] uppercase font-medium transition-[color,border-color] duration-150 border-b";
  const pillActive   = dark ? "border-[#E8B257] text-[#E8B257]" : "border-[#2D4A2B] text-[#2D4A2B]";
  const pillInactive = dark ? "border-transparent text-white/35 hover:text-white/60" : "border-transparent text-[#5A4A36] hover:text-[#2A2014]";

  const generate = async () => {
    if (!window.MealGenerator) return;
    setLoading(true);
    try {
      const result = await window.MealGenerator.generate({ cuisine, weight, cookTime, pairing: 'match' });
      setMeals(result);
    } catch {
      // silent fail — meals stays null
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className={`max-w-lg text-[15px] leading-relaxed mb-8 ${dark ? "text-white/55" : "text-[#3D2F1F]"}`}>
        Generates a randomized 3-course meal plan — starter, main, dessert — powered by TheMealDB. Pick your filters or leave them on any for a surprise.
      </p>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className={`text-[9px] tracking-[0.24em] uppercase font-medium w-16 shrink-0 ${muted}`}>Cuisine</span>
          {CUISINES.map(c => (
            <button key={c} onClick={() => setCuisine(c)} className={`${pillBase} ${cuisine === c ? pillActive : pillInactive}`}>
              {c === 'any' ? 'Any' : c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className={`text-[9px] tracking-[0.24em] uppercase font-medium w-16 shrink-0 ${muted}`}>Weight</span>
          {WEIGHTS.map(w => (
            <button key={w} onClick={() => setWeight(w)} className={`${pillBase} ${weight === w ? pillActive : pillInactive}`}>
              {w === 'any' ? 'Any' : w}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className={`text-[9px] tracking-[0.24em] uppercase font-medium w-16 shrink-0 ${muted}`}>Cook Time</span>
          {TIMES.map(t => (
            <button key={t} onClick={() => setCookTime(t)} className={`${pillBase} ${cookTime === t ? pillActive : pillInactive}`}>
              {t === 'any' ? 'Any' : t}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className={`btn-press group mb-8 inline-flex items-center gap-1.5 pb-1 border-b text-[11px] tracking-[0.2em] uppercase font-medium transition-[color,border-color] duration-200 disabled:opacity-50 ${dark ? "border-[#E8B257]/60 text-[#E8B257] hover:border-[#E8B257]" : "border-[#2D4A2B]/50 text-[#2D4A2B] hover:border-[#2D4A2B]"}`}
      >
        {loading ? "Generating..." : meals ? "Regenerate" : "Generate Meal Plan"}
      </button>

      {meals && (
        <div className="grid md:grid-cols-3 gap-4">
          <MealCard course="Starter" meal={meals.starter} dark={dark} />
          <MealCard course="Main"    meal={meals.main}    dark={dark} />
          <MealCard course="Dessert" meal={meals.dessert} dark={dark} />
        </div>
      )}
    </div>
  );
}

function PokemonTracker({ dark }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasTrending, setHasTrending] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetch("/api/trending-cards")
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards || []);
        setHasTrending(data.hasTrending || false);
        setLastUpdated(data.lastUpdated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const muted = dark ? "text-white/35" : "text-[#5A4A36]";
  const border = dark ? "border-white/12" : "border-[#C8B996]";

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-[11px] tracking-[0.18em] uppercase font-medium ${hasTrending ? "text-emerald-400/80" : dark ? "text-white/30" : "text-[#9A8A70]"}`}>
            {hasTrending ? "↑ Top Movers" : "Top by Value"}
          </p>
        </div>
        {lastUpdated && (
          <p className={`text-[10px] tracking-[0.1em] uppercase font-medium self-start mt-0.5 ${muted}`}>
            Updated on {new Date(lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      <p className={`max-w-lg text-[15px] leading-relaxed mb-8 ${dark ? "text-white/55" : "text-[#3D2F1F]"}`}>
        Tracks Special Illustration Rare and Illustration Rare cards every 12 hours via the Pokémon TCG API, storing snapshots in Redis to surface which cards are climbing fastest in market value.
      </p>

      {loading ? (
        <div className={`border ${border} p-12 flex items-center justify-center`}>
          <div className="flex flex-col items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${dark ? "border-white/20" : "border-black/20"}`} />
            <p className={`text-[11px] tracking-[0.2em] uppercase font-medium ${muted}`}>Fetching cards...</p>
          </div>
        </div>
      ) : cards.length === 0 ? (
        <div className={`border ${border} p-12 flex items-center justify-center`}>
          <p className={`text-[12px] tracking-[0.2em] uppercase font-medium ${muted}`}>No data yet — check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {cards.map((card, i) => (
            <div
              key={card.id}
              onClick={() => setSelected(card)}
              className="group relative cursor-pointer"
            >
              {/* Card image */}
              <div className="relative aspect-[5/7] overflow-hidden mb-3 transition-[transform,box-shadow] duration-250 ease-snappy [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03] [@media(hover:hover)_and_(pointer:fine)]:group-hover:shadow-2xl"
                style={{ boxShadow: dark ? "0 4px 20px rgba(0,0,0,0.5)" : "0 4px 20px rgba(0,0,0,0.15)" }}
              >
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Rank badge */}
                <div className={`absolute top-2 left-2 w-6 h-6 flex items-center justify-center text-[10px] font-semibold tabular-nums backdrop-blur-sm ${
                  i === 0 ? "bg-[#E8B257] text-[#0E1812]" :
                  i === 1 ? "bg-white/20 text-white border border-white/30" :
                  i === 2 ? "bg-white/15 text-white border border-white/20" :
                  "bg-black/40 text-white/60 border border-white/10"
                }`}>
                  {i + 1}
                </div>

                {/* Change badge */}
                {card.change !== null && (
                  <div className={`absolute top-2 right-2 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums backdrop-blur-sm ${
                    card.change >= 0 ? "bg-emerald-400/20 text-emerald-300" : "bg-red-400/20 text-red-300"
                  }`}>
                    <svg className="w-2 h-2 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d={card.change >= 0 ? "M12 4l8 16H4z" : "M12 20L4 4h16z"} />
                    </svg>
                    {Math.abs(card.change).toFixed(1)}%
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              </div>

              {/* Card info */}
              <div className="px-0.5">
                <p className={`text-[13px] font-medium leading-tight truncate mb-0.5 transition-colors duration-200 ${dark ? "text-white/80 group-hover:text-white" : "text-[#2A2014]"}`}>
                  {card.name}
                </p>
                <p className={`text-[10px] tracking-[0.06em] uppercase font-medium truncate mb-1.5 ${muted}`}>{card.set}</p>
                <div className="flex items-center justify-between">
                  <p className={`text-[14px] font-medium tabular-nums ${dark ? "text-[#E8B257]" : "text-[#2D4A2B]"}`}>
                    ${card.market.toFixed(2)}
                  </p>
                  {card.prevMarket && (
                    <p className={`text-[10px] tabular-nums ${muted}`}>${card.prevMarket.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && <CardModal card={selected} onClose={() => setSelected(null)} dark={dark} />}
    </div>
  );
}

const TABS = [
  { id: 'projects', label: 'Projects'       },
  { id: 'travel',   label: 'Travel Tracker' },
  { id: 'meals',    label: 'Meal Generator' },
  { id: 'pokemon',  label: 'Pokémon Cards'  },
  { id: 'sfx',      label: 'SFX Library'   },
];

export default function Developer() {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState('projects');
  const [headerRef, headerInView] = useInView();

  const muted  = dark ? "text-white/55" : "text-[#3D2F1F]";
  const superMuted = dark ? "text-white/35" : "text-[#5A4A36]";
  const border = dark ? "border-white/12" : "border-[#C8B996]";
  const accent = dark ? "text-[#E8B257]" : "text-[#2D4A2B]";
  const headingFaded = dark ? "text-white/35" : "text-[#7A6B53]";
  const rule = dark ? "bg-white/12" : "bg-black/12";
  const wrap = "max-w-5xl mx-auto px-6 sm:px-8";
  const kicker = "text-[11px] tracking-[0.24em] uppercase font-medium";

  return (
    <main className={`relative pt-32 pb-32 ${wrap}`} style={{ zIndex: 2 }}>
      <WaterCanvas dark={dark} />

      {/* Section index */}
      <div className="flex items-baseline gap-3 mb-4">
        <span className={`${kicker} ${accent}`}>Development</span>
        <span className={`${kicker} ${superMuted}`}>02</span>
      </div>
      <div className={`h-px mb-16 ${rule}`} />

      {/* Header */}
      <div ref={headerRef} className="mb-16">
        <div className={`transition-[opacity,transform] duration-700 ease-snappy ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className={`font-bold tracking-tight leading-[1.05] mb-8 ${dark ? "text-white" : "text-[#1F1810]"}`} style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}>
            Building things<br />
            <span className={`font-display italic ${accent}`}>for fun.</span>
          </h1>
          <p className={`max-w-md text-[16px] leading-relaxed mb-6 ${dark ? "text-white/55" : "text-[#3D2F1F]"}`}>
            I build things with a little help from my AI friends. Half the time I&rsquo;m not sure who wrote what — and honestly, that&rsquo;s the fun part.
          </p>
          <div className="flex gap-6">
            <a
              href="https://github.com/tobyansohn"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 text-[12px] font-medium tracking-[0.12em] uppercase transition-colors duration-200 cursor-pointer ${dark ? "text-white/40 hover:text-white/75" : "text-[#5A4A36] hover:text-[#2A2014]"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/tobyansohn"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 text-[12px] font-medium tracking-[0.12em] uppercase transition-colors duration-200 cursor-pointer ${dark ? "text-white/40 hover:text-white/75" : "text-[#5A4A36] hover:text-[#2A2014]"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              LinkedIn
            </a>
          </div>

          {/* Skills */}
          <div className={`mt-8 flex flex-wrap gap-2 transition-[opacity,transform] duration-700 ease-snappy ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "250ms" }}>
            {skills.map(skill => (
              <span key={skill} className={`pb-1 border-b text-[11px] font-medium tracking-[0.16em] uppercase ${dark ? "border-white/15 text-white/45" : "border-black/15 text-[#5A4A36]"}`}>
                {skill}
              </span>
            ))}
          </div>

          {/* GitHub contributions */}
          <div className={`transition-[opacity,transform] duration-700 ease-snappy ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: "350ms" }}>
            <GitHubContributions dark={dark} />
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className={`overflow-x-auto no-scrollbar border-b mb-12 ${border}`}>
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-3 text-[11px] font-medium tracking-[0.2em] uppercase whitespace-nowrap transition-colors duration-150 border-b -mb-px ${
                activeTab === tab.id
                  ? (dark ? "border-[#E8B257] text-white" : "border-[#2D4A2B] text-[#2A2014]")
                  : `border-transparent ${dark ? "text-white/35 hover:text-white/60" : "text-[#9A8A70] hover:text-[#3D2F1F]"}`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      {activeTab === 'projects' && (
        <div>
          <p className={`max-w-md text-[15px] leading-relaxed mb-4 ${dark ? "text-white/55" : "text-[#3D2F1F]"}`}>
            A mix of things I've built — mostly for fun, partly out of necessity. Powered by a lot of coffee and AI.
          </p>
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} dark={dark} />
          ))}
        </div>
      )}
      {activeTab === 'travel' && (
        <div>
          <p className={`${kicker} mb-3 ${superMuted}`}>Travel Tracker — 2026</p>
          <p className={`max-w-md text-[15px] leading-relaxed mb-8 ${dark ? "text-white/55" : "text-[#3D2F1F]"}`}>
            A personal map tracking every place I've visited. Warm pins mark travel destinations — click any to browse photos from that trip. The blue pin marks Austin, TX, my home.
          </p>
          <TravelMap dark={dark} />
        </div>
      )}
      {activeTab === 'meals'   && <MealGeneratorWidget dark={dark} />}
      {activeTab === 'pokemon' && <PokemonTracker dark={dark} />}
      {activeTab === 'sfx'     && <SFXLibrary dark={dark} />}
    </main>
  );
}