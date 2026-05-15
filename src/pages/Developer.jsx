import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import { useTheme } from "../context/ThemeContext.jsx";

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

function makeTravelIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;background:#E8D5B7;border:2px solid #E8D5B7;border-radius:50%;box-shadow:0 0 0 4px rgba(232,213,183,0.2);cursor:pointer;"></div>`,
    iconSize: [10, 10], iconAnchor: [5, 5],
  });
}

function makeHomeIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:10px;height:10px;background:#8B9DC3;border:2px solid #8B9DC3;border-radius:50%;box-shadow:0 0 0 4px rgba(139,157,195,0.2);"></div>`,
    iconSize: [10, 10], iconAnchor: [5, 5],
  });
}

function TravelMap({ dark }) {
  const navigate = useNavigate();
  return (
    <div className={`rounded-2xl overflow-hidden border ${dark ? "border-white/8" : "border-[#b0a090]"}`} style={{ height: 320 }}>
      <MapContainer
        center={[25, -50]}
        zoom={2}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: dark ? "#0d0d0d" : "#ede8e0" }}
        zoomControl={false}
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
            icon={makeTravelIcon()}
            eventHandlers={{ click: () => navigate(`/photography?category=Travels&sub=${encodeURIComponent(spot.name)}`) }}
          >
            <Tooltip direction="top" offset={[0, -8]} className="travel-tooltip">{spot.name}</Tooltip>
          </Marker>
        ))}
        <Marker position={[homePin.lat, homePin.lng]} icon={makeHomeIcon()}>
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

export default function Developer() {
  const { dark } = useTheme();
  const [headerRef, headerInView] = useInView();
  const [skillsRef, skillsInView] = useInView();

  return (
    <main className="relative pt-28 pb-32 px-6 md:px-16 max-w-6xl mx-auto" style={{ zIndex: 2 }}>
      <WaterCanvas dark={dark} />
      <div ref={headerRef} className="mb-24">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${dark ? "text-white/30" : "text-[#5a4a3a]"}`}>Software Development</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>
            Building things<br />
            <span className={dark ? "text-white/30" : "text-[#7a6a5a]"}>that matter.</span>
          </h1>
          <p className={`max-w-lg text-[15px] leading-relaxed ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
            I build things with a little help from my AI friends. Half the time I'm not sure who wrote what — and honestly, that's the fun part.
          </p>
        </div>
      </div>

      {/* Travel Tracker */}
      <div className="mt-24">
        <p className={`text-[11px] tracking-[0.35em] uppercase mb-4 ${dark ? "text-white/30" : "text-[#5a4a3a]"}`}>Travel Tracker — 2026</p>
        <p className={`max-w-lg text-[14px] leading-relaxed mb-8 ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
          A personal map tracking every place I've visited and called home. Warm pins mark travel destinations — click any to browse photos from that trip. The blue pin marks Austin, TX, my home base.
        </p>
        <TravelMap dark={dark} />
      </div>
    </main>
  );
}