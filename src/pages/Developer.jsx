import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "../context/ThemeContext.jsx";
import SFXLibrary from "../components/SFXLibrary.jsx";

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

    const color = dark ? "232,213,183" : "100,80,55";

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
  const color = dark ? "#E8D5B7" : "#6B4F2A";
  const glow = dark ? "rgba(232,213,183,0.25)" : "rgba(107,79,42,0.2)";
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
    <div className={`rounded-2xl overflow-hidden border ${dark ? "border-white/8" : "border-[#b0a090]"}`} style={{ height: 320 }}>
      <MapContainer
        center={[25, -50]}
        zoom={2}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", background: dark ? "#0d0d0d" : "#ede8e0" }}
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
        <Marker position={[homePin.lat, homePin.lng]} icon={makeHomeIcon(dark)}>
          <Tooltip direction="top" offset={[0, -8]} className="travel-tooltip">{homePin.name}</Tooltip>
        </Marker>
      </MapContainer>
    </div>
  );
}

const projects = [];

const skills = [];

function ProjectCard({ project, index, dark }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`group border-b py-10 transition-all duration-700 ${dark ? "border-white/8" : "border-[#b0a090]"} ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${index * 80}ms` }}>
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12">
        <span className={`text-[11px] tracking-[0.3em] uppercase shrink-0 pt-1 md:w-16 ${dark ? "text-white/25" : "text-[#7a6a5a]"}`}>{project.year}</span>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3 className={`font-display text-2xl transition-colors duration-300 ${dark ? "text-white group-hover:text-[#E8D5B7]" : "text-[#1a1a1a] group-hover:text-[#6B4F2A]"}`}>{project.title}</h3>
            <a href={project.link} className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${dark ? "border-white/15 group-hover:border-white/40 group-hover:bg-white/5" : "border-black/15 group-hover:border-black/40 group-hover:bg-black/5"}`} aria-label="View project">
              <svg className={`w-3 h-3 transition-all duration-300 ${dark ? "text-white/50 group-hover:text-white" : "text-[#4a4a4a] group-hover:text-black"} group-hover:translate-x-px group-hover:-translate-y-px`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>
          <p className={`text-[14px] leading-relaxed mb-5 max-w-xl ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <span key={tag} className={`px-3 py-1 rounded-full border text-[11px] tracking-[0.1em] uppercase ${dark ? "border-white/10 text-white/35" : "border-black/10 text-black/35"}`}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
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
      <div className={`relative rounded-t-2xl sm:rounded-2xl border p-5 sm:p-6 flex flex-col sm:flex-row gap-5 sm:gap-6 w-full sm:max-w-md ${dark ? "bg-[#111] border-white/10" : "bg-[#F0EDE8] border-[#b0a090]"}`} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${dark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/10"}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <img
          src={card.imageLarge || card.image}
          alt={card.name}
          className="w-36 h-auto object-contain rounded-xl mx-auto sm:mx-0 shrink-0"
        />

        <div className="flex flex-col justify-center gap-3">
          <div>
            <p className={`font-display text-xl leading-tight ${dark ? "text-white" : "text-[#1a1a1a]"}`}>{card.name}</p>
            <p className={`text-[11px] tracking-[0.1em] uppercase mt-1 ${dark ? "text-white/35" : "text-[#5a4a3a]"}`}>{card.set}</p>
            {card.rarity && <p className={`text-[10px] tracking-[0.08em] mt-0.5 ${dark ? "text-white/25" : "text-[#9a8a7a]"}`}>{card.rarity}</p>}
          </div>

          <div className={`h-px ${dark ? "bg-white/8" : "bg-black/8"}`} />

          <div className="flex items-end justify-between gap-4">
            <div>
              <p className={`text-[10px] tracking-[0.2em] uppercase mb-1 ${dark ? "text-white/30" : "text-[#5a4a3a]"}`}>Market Price</p>
              <p className={`font-display text-2xl ${dark ? "text-white" : "text-[#1a1a1a]"}`}>${card.market.toFixed(2)}</p>
              {card.prevMarket && (
                <p className={`text-[11px] ${dark ? "text-white/30" : "text-[#9a8a7a]"}`}>prev. ${card.prevMarket.toFixed(2)}</p>
              )}
            </div>
            {card.change !== null && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[13px] font-medium ${card.change >= 0 ? "bg-emerald-400/10 text-emerald-400" : "bg-red-400/10 text-red-400"}`}>
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
            className={`text-[11px] tracking-[0.1em] uppercase flex items-center gap-1.5 transition-colors ${dark ? "text-white/30 hover:text-[#E8D5B7]" : "text-[#5a4a3a] hover:text-[#6B4F2A]"}`}
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
  const border = dark ? "border-white/8" : "border-[#b0a090]";
  const muted  = dark ? "text-white/30" : "text-[#5a4a3a]";

  const badgeColor = {
    quick: "text-emerald-400 bg-emerald-400/10",
    medium: "text-amber-400 bg-amber-400/10",
    long: "text-red-400 bg-red-400/10",
    light: "text-sky-400 bg-sky-400/10",
    heavy: dark ? "text-[#E8D5B7] bg-[#E8D5B7]/10" : "text-[#6B4F2A] bg-[#6B4F2A]/10",
  };

  return (
    <>
      <div
        onClick={() => meal && setOpen(true)}
        className={`rounded-2xl border overflow-hidden transition-all duration-200 ${border} ${dark ? "bg-white/[0.02] hover:bg-white/[0.05]" : "bg-[#faf8f5] hover:bg-[#f3efe9]"} ${meal ? "cursor-pointer hover:scale-[1.01]" : ""}`}
      >
        {meal ? (
          <>
            <div className="relative aspect-video overflow-hidden">
              <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <span className={`absolute top-3 left-3 text-[9px] tracking-[0.2em] uppercase px-2 py-1 rounded-md ${dark ? "bg-black/50 text-white/60" : "bg-black/40 text-white/80"} backdrop-blur-sm`}>
                {course}
              </span>
              <span className={`absolute bottom-3 right-3 text-[9px] tracking-[0.1em] uppercase px-2 py-1 rounded-md bg-black/50 text-white/70 backdrop-blur-sm`}>
                View Recipe →
              </span>
            </div>
            <div className="p-4">
              <p className={`font-display text-base leading-tight mb-1 ${dark ? "text-white/90" : "text-[#1a1a1a]"}`}>{meal.strMeal}</p>
              <p className={`text-[10px] tracking-[0.1em] uppercase mb-3 ${muted}`}>{meal.strArea} · {meal.strCategory}</p>
              <div className="flex flex-wrap gap-1.5">
                {meal.cookTimeEstimate !== 'unknown' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md ${badgeColor[meal.cookTimeEstimate] || muted}`}>
                    {meal.cookTimeEstimate}
                  </span>
                )}
                {meal.weightEstimate !== 'unknown' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-md ${badgeColor[meal.weightEstimate] || muted}`}>
                    {meal.weightEstimate}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-md ${dark ? "bg-white/5 text-white/30" : "bg-black/5 text-[#5a4a3a]"}`}>
                  {meal.ingredients?.length} ingredients
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="aspect-video flex items-center justify-center">
            <p className={`text-[11px] tracking-[0.2em] uppercase ${muted}`}>{course}</p>
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
            className={`relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border ${dark ? "bg-[#111] border-white/10" : "bg-[#faf8f5] border-[#c0b0a0]"}`}
            style={{ scrollbarWidth: 'thin' }}
          >
            {/* Header */}
            <div className={`sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-4 border-b ${dark ? "bg-[#111] border-white/8" : "bg-[#faf8f5] border-[#d0c8bc]"}`}>
              <div>
                <p className={`text-[9px] tracking-[0.2em] uppercase mb-1 ${muted}`}>{course}</p>
                <h2 className={`font-display text-xl leading-tight ${dark ? "text-white" : "text-[#1a1a1a]"}`}>{meal.strMeal}</h2>
                <p className={`text-[10px] tracking-[0.1em] uppercase mt-1 ${muted}`}>{meal.strArea} · {meal.strCategory}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className={`shrink-0 mt-1 text-lg leading-none px-2 py-1 rounded-lg transition-colors ${dark ? "text-white/40 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/8"}`}
              >✕</button>
            </div>

            {/* Image */}
            <img src={meal.strMealThumb} alt={meal.strMeal} className="w-full h-48 object-cover" />

            {/* Body */}
            <div className="p-6 grid md:grid-cols-2 gap-8">
              {/* Ingredients */}
              <div>
                <p className={`text-[9px] tracking-[0.2em] uppercase mb-4 ${dark ? "text-[#E8D5B7]/60" : "text-[#6B4F2A]/70"}`}>Ingredients</p>
                <ul className="flex flex-col gap-2">
                  {meal.ingredients?.map(({ measure, name }, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className={`shrink-0 w-20 text-[11px] font-medium ${dark ? "text-white/80" : "text-[#1a1a1a]"}`}>{measure}</span>
                      <span className={dark ? "text-white/50" : "text-[#5a4a3a]"}>{name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Method */}
              <div>
                <p className={`text-[9px] tracking-[0.2em] uppercase mb-4 ${dark ? "text-[#E8D5B7]/60" : "text-[#6B4F2A]/70"}`}>Method</p>
                <ol className="flex flex-col gap-4">
                  {parseMealSteps(meal.strInstructions).map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed">
                      <span className={`shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-[10px] font-bold ${dark ? "bg-[#E8D5B7]/15 text-[#E8D5B7]" : "bg-[#6B4F2A]/10 text-[#6B4F2A]"}`}>{i + 1}</span>
                      <span className={dark ? "text-white/60" : "text-[#3a3a3a]"}>{step}</span>
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
                  className={`inline-flex items-center gap-2 text-[10px] tracking-[0.1em] uppercase px-4 py-2 rounded-lg border transition-colors ${dark ? "border-white/10 text-white/40 hover:text-[#E8D5B7] hover:border-[#E8D5B7]/30" : "border-black/10 text-[#9a8a7a] hover:text-[#6B4F2A] hover:border-[#6B4F2A]/30"}`}
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
  const muted  = dark ? "text-white/30" : "text-[#5a4a3a]";
  const border = dark ? "border-white/8" : "border-[#b0a090]";

  useEffect(() => {
    if (window.MealGenerator) { setReady(true); return; }
    const script = document.createElement('script');
    script.src = '/meal-generator.js';
    script.onload = () => setReady(true);
    document.head.appendChild(script);
  }, []);

  const pillBase     = "px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase transition-all duration-200 border";
  const pillActive   = dark ? "bg-white text-[#080808] border-white" : "bg-[#1a1a1a] text-white border-[#1a1a1a]";
  const pillInactive = dark ? "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60" : "border-black/10 text-[#5a4a3a] hover:border-black/25 hover:text-[#1a1a1a]";

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
      <p className={`max-w-lg text-[14px] leading-relaxed mb-8 ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
        Generates a randomized 3-course meal plan — starter, main, dessert — powered by TheMealDB. Pick your filters or leave them on any for a surprise.
      </p>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[9px] tracking-[0.25em] uppercase w-16 shrink-0 ${muted}`}>Cuisine</span>
          {CUISINES.map(c => (
            <button key={c} onClick={() => setCuisine(c)} className={`${pillBase} ${cuisine === c ? pillActive : pillInactive}`}>
              {c === 'any' ? 'Any' : c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[9px] tracking-[0.25em] uppercase w-16 shrink-0 ${muted}`}>Weight</span>
          {WEIGHTS.map(w => (
            <button key={w} onClick={() => setWeight(w)} className={`${pillBase} ${weight === w ? pillActive : pillInactive}`}>
              {w === 'any' ? 'Any' : w}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-[9px] tracking-[0.25em] uppercase w-16 shrink-0 ${muted}`}>Cook Time</span>
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
        className={`mb-8 px-6 py-3 rounded-full text-[12px] tracking-[0.15em] uppercase font-medium transition-all duration-300 disabled:opacity-50 ${dark ? "bg-white text-[#080808] hover:bg-[#E8D5B7]" : "bg-[#1a1a1a] text-white hover:bg-[#3a3a3a]"}`}
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

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const border = dark ? "border-white/8" : "border-[#b0a090]";

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className={`text-[11px] tracking-[0.15em] uppercase ${hasTrending ? "text-emerald-400/70" : dark ? "text-white/20" : "text-[#9a8a7a]"}`}>
            {hasTrending ? "↑ Top Movers" : "Top by Value"}
          </p>
        </div>
        {lastUpdated && (
          <p className={`text-[10px] tracking-[0.1em] self-start mt-0.5 ${muted}`}>
            Updated on {new Date(lastUpdated).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </p>
        )}
      </div>

      <p className={`max-w-lg text-[14px] leading-relaxed mb-8 ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
        Tracks Special Illustration Rare and Illustration Rare cards every 12 hours via the Pokémon TCG API, storing snapshots in Redis to surface which cards are climbing fastest in market value.
      </p>

      {loading ? (
        <div className={`rounded-2xl border ${border} p-12 flex items-center justify-center`}>
          <div className="flex flex-col items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 border-t-transparent animate-spin ${dark ? "border-white/20" : "border-black/20"}`} />
            <p className={`text-[11px] tracking-[0.2em] uppercase ${muted}`}>Fetching cards...</p>
          </div>
        </div>
      ) : cards.length === 0 ? (
        <div className={`rounded-2xl border ${border} p-12 flex items-center justify-center`}>
          <p className={`text-[12px] tracking-[0.2em] uppercase ${muted}`}>No data yet — check back soon.</p>
        </div>
      ) : (
        <div className={`rounded-2xl border ${border} overflow-hidden ${dark ? "bg-white/[0.015]" : "bg-[#faf8f5]"}`}>
          {/* Column headers */}
          <div className={`grid grid-cols-[1.5rem_2.5rem_1fr_4rem] sm:grid-cols-[2rem_3rem_1fr_5rem_4.5rem] items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 border-b ${border}`}>
            <span className={`text-[9px] tracking-[0.2em] uppercase ${muted}`}>#</span>
            <span />
            <span className={`text-[9px] tracking-[0.2em] uppercase ${muted}`}>Card</span>
            <span className={`text-[9px] tracking-[0.2em] uppercase text-right ${muted}`}>Price</span>
            <span className={`hidden sm:block text-[9px] tracking-[0.2em] uppercase text-right ${muted}`}>Change</span>
          </div>

          {cards.map((card, i) => (
            <div
              key={card.id}
              onClick={() => setSelected(card)}
              className={`grid grid-cols-[1.5rem_2.5rem_1fr_4rem] sm:grid-cols-[2rem_3rem_1fr_5rem_4.5rem] items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 border-b last:border-b-0 transition-all duration-200 cursor-pointer group ${border} ${dark ? "hover:bg-white/[0.04]" : "hover:bg-[#f0ece6]"}`}
            >
              {/* Rank */}
              <span className={`text-[11px] tabular-nums text-right font-medium ${i < 3 ? (dark ? "text-[#E8D5B7]/60" : "text-[#6B4F2A]/60") : muted}`}>
                {i + 1}
              </span>

              {/* Card art */}
              <div className="relative">
                <img
                  src={card.image}
                  alt={card.name}
                  className="w-9 h-12 object-contain rounded-md drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Name + set */}
              <div className="min-w-0">
                <p className={`text-[13px] font-medium truncate leading-tight ${dark ? "text-white/85 group-hover:text-white" : "text-[#1a1a1a]"} transition-colors duration-200`}>
                  {card.name}
                </p>
                <p className={`text-[10px] tracking-[0.06em] truncate mt-0.5 ${muted}`}>{card.set}</p>
              </div>

              {/* Price */}
              <div className="text-right">
                <p className={`text-[13px] font-medium tabular-nums ${dark ? "text-white/80" : "text-[#1a1a1a]"}`}>
                  ${card.market.toFixed(2)}
                </p>
                {card.prevMarket && (
                  <p className={`text-[10px] tabular-nums ${muted}`}>${card.prevMarket.toFixed(2)}</p>
                )}
              </div>

              {/* Change badge — hidden on mobile */}
              <div className="hidden sm:flex justify-end">
                {card.change !== null ? (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium tabular-nums ${
                    card.change >= 0
                      ? "bg-emerald-400/10 text-emerald-400"
                      : "bg-red-400/10 text-red-400"
                  }`}>
                    <svg className="w-2.5 h-2.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d={card.change >= 0 ? "M12 4l8 16H4z" : "M12 20L4 4h16z"} />
                    </svg>
                    {Math.abs(card.change).toFixed(1)}%
                  </span>
                ) : (
                  <span className={`text-[11px] ${muted}`}>—</span>
                )}
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
  { id: 'travel',  label: 'Travel Tracker' },
  { id: 'meals',   label: 'Meal Generator' },
  { id: 'pokemon', label: 'Pokémon Cards'  },
  { id: 'sfx',     label: 'SFX Library'   },
];

export default function Developer() {
  const { dark } = useTheme();
  const [activeTab, setActiveTab] = useState('travel');
  const [headerRef, headerInView] = useInView();

  const muted  = dark ? "text-white/30" : "text-[#5a4a3a]";
  const border = dark ? "border-white/8" : "border-[#b0a090]";

  return (
    <main className="relative pt-28 pb-32 px-6 md:px-16 max-w-6xl mx-auto" style={{ zIndex: 2 }}>
      <WaterCanvas dark={dark} />

      {/* Header */}
      <div ref={headerRef} className="mb-16">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${muted}`}>Software Development</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>
            Building things<br />
            <span className={dark ? "text-white/30" : "text-[#7a6a5a]"}>for fun.</span>
          </h1>
          <p className={`max-w-lg text-[15px] leading-relaxed mb-6 ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
            I build things with a little help from my AI friends. Half the time I'm not sure who wrote what — and honestly, that's the fun part.
          </p>
          <div className="flex gap-4">
            <a
              href="https://github.com/tobyansohn"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase transition-all duration-300 ${dark ? "text-white/35 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/tobyansohn"
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center gap-2 text-[12px] tracking-[0.1em] uppercase transition-all duration-300 ${dark ? "text-white/35 hover:text-white/70" : "text-[#5a4a3a] hover:text-[#1a1a1a]"}`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              LinkedIn
            </a>
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
              className={`shrink-0 px-4 py-3 text-[11px] tracking-[0.2em] uppercase whitespace-nowrap transition-all duration-200 border-b-2 -mb-px ${
                activeTab === tab.id
                  ? (dark ? "border-white text-white" : "border-[#1a1a1a] text-[#1a1a1a]")
                  : `border-transparent ${dark ? "text-white/35 hover:text-white/60" : "text-[#9a8a7a] hover:text-[#3a3a3a]"}`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panels */}
      {activeTab === 'travel' && (
        <div>
          <p className={`text-[11px] tracking-[0.35em] uppercase mb-3 ${muted}`}>Travel Tracker — 2026</p>
          <p className={`max-w-lg text-[14px] leading-relaxed mb-8 ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
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