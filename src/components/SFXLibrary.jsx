import { useState, useEffect, useRef, useMemo, useCallback } from "react";

const CSV_URL    = "https://raw.githubusercontent.com/FThompson/BBCSoundDownloader/master/BBCSoundEffects.csv";
const ASSET_BASE = "https://bbcsfx.acropolis.org.uk/assets/";
const PAGE_SZ    = 24;

const CAT_META = {
  Aircraft: "#60a5fa", Animals: "#34d399", Atmosphere: "#a78bfa", Battle: "#f87171",
  Bells: "#fbbf24", Birds: "#6ee7b7", Boats: "#38bdf8", Cars: "#f97316",
  Clocks: "#e879f9", Crowds: "#fb923c", Domestic: "#a3e635", Doors: "#c084fc",
  Electricity: "#facc15", Engines: "#94a3b8", Explosions: "#ef4444", Fire: "#fb923c",
  Footsteps: "#84cc16", Guns: "#f43f5e", Horror: "#7c3aed", Household: "#10b981",
  Industry: "#6b7280", Magic: "#818cf8", Medical: "#22d3ee", Military: "#a3e635",
  Music: "#f472b6", Nature: "#4ade80", Office: "#60a5fa", Rain: "#38bdf8",
  Science: "#67e8f9", Sea: "#22d3ee", Space: "#818cf8", Sports: "#86efac",
  Thunder: "#fde047", Trains: "#fb923c", Transport: "#94a3b8", Water: "#38bdf8",
  Weather: "#7dd3fc", Wind: "#bae6fd",
};
const DEFAULT_COLOR = "#E8D5B7";

function getCatColor(cat) {
  const top = (cat || "").split(":")[0].trim();
  return CAT_META[top] || DEFAULT_COLOR;
}

function formatDur(s) {
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function parseCSV(text) {
  const lines = text.split("\n");
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVRow(lines[i]);
    if (!row || row.length < 4) continue;
    const [location, description, secs, category, , cdName] = row;
    if (!location || !description) continue;
    results.push({
      location: location.trim(),
      description: description.trim(),
      secs: parseFloat(secs) || 0,
      category: category ? category.trim() : "Other",
      cdName: (cdName || "").trim(),
      topCat: (category || "").split(":")[0].trim() || "Other",
    });
  }
  return results;
}

function parseCSVRow(line) {
  const result = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === "," && !inQ) {
      result.push(cur); cur = "";
    } else cur += c;
  }
  result.push(cur);
  return result;
}

function WaveformCanvas({ sound, color, playing, progress, onClick }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width  = canvas.offsetWidth  * (devicePixelRatio || 1);
    const H = canvas.height = canvas.offsetHeight * (devicePixelRatio || 1);
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    const bars = 55;
    const bw   = (W / bars) * 0.55;
    const seed = sound.location.split("").reduce((a,c,i) => a + c.charCodeAt(0) * (i+1), 0);
    for (let i = 0; i < bars; i++) {
      const t   = i / bars;
      const env = Math.sin(t * Math.PI) * 0.8 + 0.2;
      const n   = Math.abs(Math.sin(seed * 0.01 + i * 1.9)) * 0.5 + 0.5;
      const h   = Math.max(3, env * n * H * 0.88);
      const x   = i * (W / bars);
      const y   = (H - h) / 2;
      ctx.globalAlpha = 0.6 + env * 0.4;
      ctx.fillRect(x, y, bw, h);
    }
    ctx.globalAlpha = 1;
  }, [sound, color]);

  return (
    <div className="relative h-10 rounded-md overflow-hidden cursor-pointer group/wave" onClick={onClick}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute inset-0 bg-black/20 pointer-events-none" style={{ width: `${progress * 100}%`, transition: "none" }} />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/wave:opacity-100 transition-opacity duration-150 pointer-events-none">
        <span className="text-white/70 text-sm">{playing ? "⏹" : "▶"}</span>
      </div>
    </div>
  );
}

function SFXCard({ sound, isPlaying, progress, onPlay, onDownload, dark }) {
  const color  = getCatColor(sound.topCat);
  const border = dark ? "border-white/8" : "border-[#b0a090]";
  const bg     = dark ? "bg-white/[0.02] hover:bg-white/[0.04]" : "bg-[#faf8f5] hover:bg-[#f0ece6]";
  const muted  = dark ? "text-white/30" : "text-[#9a8a7a]";

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${border} ${bg}`}>
      <div className="h-[3px]" style={{ background: color }} />
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-[12px] font-medium leading-snug line-clamp-2 ${dark ? "text-white/80" : "text-[#1a1a1a]"}`}>
            {sound.description}
          </p>
          <span className="text-[10px] px-1.5 py-0.5 rounded shrink-0 font-medium" style={{ background: hexToRgba(color, 0.15), color }}>
            {sound.topCat}
          </span>
        </div>

        {sound.cdName && (
          <p className={`text-[10px] truncate ${muted}`}>{sound.cdName}</p>
        )}

        <WaveformCanvas
          sound={sound}
          color={color}
          playing={isPlaying}
          progress={progress}
          onClick={onPlay}
        />

        <div className="flex items-center gap-2">
          <button
            onClick={onPlay}
            className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] transition-all duration-150 shrink-0"
            style={{ background: isPlaying ? "#7c5cfc" : color, color: "#fff" }}
          >
            {isPlaying ? "⏹" : "▶"}
          </button>
          <span className={`text-[10px] tabular-nums px-1.5 py-0.5 rounded border ${dark ? "border-white/8 text-white/30" : "border-black/8 text-[#9a8a7a]"}`}>
            {formatDur(sound.secs)}
          </span>
          <button
            onClick={onDownload}
            className="ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all duration-150"
            style={{ background: "#22c55e22", color: "#4ade80" }}
          >
            ⬇ WAV
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SFXLibrary({ dark }) {
  const [allSounds, setAllSounds]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [loadPct, setLoadPct]       = useState(0);
  const [search, setSearch]         = useState("");
  const [activeCat, setActiveCat]   = useState("All");
  const [sort, setSort]             = useState("relevance");
  const [page, setPage]             = useState(1);
  const [playingIdx, setPlayingIdx] = useState(null);
  const [progress, setProgress]     = useState(0);
  const [npName, setNpName]         = useState(null);
  const [npTime, setNpTime]         = useState("0:00 / 0:00");

  const audioRef = useRef(null);
  const rafRef   = useRef(null);
  const searchRef = useRef(null);

  const muted  = dark ? "text-white/30" : "text-[#5a4a3a]";
  const border = dark ? "border-white/8" : "border-[#b0a090]";

  // Load CSV
  useEffect(() => {
    async function load() {
      try {
        const cached = sessionStorage.getItem("bbc_sfx_csv");
        let csv;
        if (cached) {
          csv = cached;
          setLoadPct(100);
        } else {
          const res = await fetch(CSV_URL);
          const reader = res.body.getReader();
          const total  = parseInt(res.headers.get("Content-Length") || "0", 10);
          let received = 0;
          const chunks = [];
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            received += value.length;
            if (total) setLoadPct(Math.round((received / total) * 100));
          }
          const merged = new Uint8Array(chunks.reduce((a,c) => a + c.length, 0));
          let off = 0;
          for (const c of chunks) { merged.set(c, off); off += c.length; }
          csv = new TextDecoder().decode(merged);
          try { sessionStorage.setItem("bbc_sfx_csv", csv); } catch(_) {}
        }
        setAllSounds(parseCSV(csv));
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const categories = useMemo(() => (
    ["All", ...[...new Set(allSounds.map(s => s.topCat))].sort()]
  ), [allSounds]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    let list = allSounds.filter(s => {
      const catOk = activeCat === "All" || s.topCat === activeCat;
      const qOk   = !q || s.description.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.cdName.toLowerCase().includes(q);
      return catOk && qOk;
    });
    if (sort === "dur_asc")  list = [...list].sort((a,b) => a.secs - b.secs);
    if (sort === "dur_desc") list = [...list].sort((a,b) => b.secs - a.secs);
    if (sort === "alpha")    list = [...list].sort((a,b) => a.description.localeCompare(b.description));
    return list;
  }, [allSounds, search, activeCat, sort]);

  const totalPages = Math.ceil(filtered.length / PAGE_SZ);
  const pageItems  = filtered.slice((page-1)*PAGE_SZ, page*PAGE_SZ);

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }
    cancelAnimationFrame(rafRef.current);
    setPlayingIdx(null);
    setProgress(0);
    setNpName(null);
    setNpTime("0:00 / 0:00");
  }, []);

  const tick = useCallback(() => {
    const a = audioRef.current;
    if (!a || a.paused) return;
    if (a.duration) {
      setProgress(a.currentTime / a.duration);
      setNpTime(`${formatDur(a.currentTime)} / ${formatDur(a.duration)}`);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const togglePlay = useCallback((absIdx, sound) => {
    const a = audioRef.current;
    if (playingIdx === absIdx && !a?.paused) { stopAudio(); return; }
    stopAudio();
    const url = ASSET_BASE + sound.location;
    a.src = url;
    a.play().then(() => {
      setPlayingIdx(absIdx);
      setNpName(sound.description);
      rafRef.current = requestAnimationFrame(tick);
    }).catch(() => {});
  }, [playingIdx, stopAudio, tick]);

  const downloadWav = useCallback(async (sound) => {
    const url = ASSET_BASE + sound.location;
    try {
      const r = await fetch(url, { mode: "cors" });
      if (!r.ok) throw new Error();
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = sound.location;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 8000);
    } catch {
      window.open(url, "_blank");
    }
  }, []);

  // keyboard shortcut
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") stopAudio();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [stopAudio]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className={`w-8 h-8 rounded-full border-2 border-t-transparent animate-spin ${dark ? "border-white/20" : "border-black/20"}`} />
        <p className={`text-[12px] tracking-[0.2em] uppercase ${muted}`}>
          Loading BBC catalog{loadPct > 0 ? ` — ${loadPct}%` : "..."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" onEnded={stopAudio} />

      {/* Search + sort */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${muted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder='Search "explosion", "footstep", "thunder"…'
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-[13px] outline-none transition-colors duration-200 ${dark ? "bg-white/[0.03] border-white/8 text-white placeholder:text-white/20 focus:border-white/20" : "bg-[#faf8f5] border-[#b0a090] text-[#1a1a1a] placeholder:text-[#9a8a7a] focus:border-[#6B4F2A]/40"}`}
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] ${muted}`}>✕</button>
          )}
        </div>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          className={`px-3 py-2.5 rounded-xl border text-[12px] outline-none ${dark ? "bg-white/[0.03] border-white/8 text-white/60" : "bg-[#faf8f5] border-[#b0a090] text-[#5a4a3a]"}`}
        >
          <option value="relevance">Relevance</option>
          <option value="dur_asc">Shortest first</option>
          <option value="dur_desc">Longest first</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCat(cat); setPage(1); }}
            className={`px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase transition-all duration-200 border shrink-0 ${
              activeCat === cat
                ? (dark ? "bg-white text-[#080808] border-white" : "bg-[#1a1a1a] text-white border-[#1a1a1a]")
                : (dark ? "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60" : "border-black/10 text-[#5a4a3a] hover:border-black/25")
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className={`flex items-center justify-between mb-4 text-[11px] ${muted}`}>
        <span><strong className={dark ? "text-white/60" : "text-[#1a1a1a]"}>{filtered.length.toLocaleString()}</strong> sounds{search ? ` for "${search}"` : ""}</span>
        <span><strong className={dark ? "text-white/60" : "text-[#1a1a1a]"}>{allSounds.length.toLocaleString()}</strong> total</span>
      </div>

      {/* Grid */}
      {pageItems.length === 0 ? (
        <div className={`py-24 text-center ${muted}`}>
          <p className="text-3xl mb-3">🔇</p>
          <p className="text-[13px]">No sounds matched your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {pageItems.map((sound, i) => {
            const absIdx = (page-1)*PAGE_SZ + i;
            return (
              <SFXCard
                key={sound.location}
                sound={sound}
                isPlaying={playingIdx === absIdx}
                progress={playingIdx === absIdx ? progress : 0}
                onPlay={() => togglePlay(absIdx, sound)}
                onDownload={() => downloadWav(sound)}
                dark={dark}
              />
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            disabled={page <= 1}
            onClick={() => { setPage(p => p-1); window.scrollTo({top:0,behavior:"smooth"}); }}
            className={`px-4 py-2 rounded-xl border text-[12px] transition-all duration-200 disabled:opacity-30 ${dark ? "border-white/8 text-white/50 hover:border-white/20 hover:text-white" : "border-[#b0a090] text-[#5a4a3a] hover:border-[#6B4F2A]"}`}
          >
            ← Prev
          </button>
          <span className={`text-[12px] ${muted}`}>Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => { setPage(p => p+1); window.scrollTo({top:0,behavior:"smooth"}); }}
            className={`px-4 py-2 rounded-xl border text-[12px] transition-all duration-200 disabled:opacity-30 ${dark ? "border-white/8 text-white/50 hover:border-white/20 hover:text-white" : "border-[#b0a090] text-[#5a4a3a] hover:border-[#6B4F2A]"}`}
          >
            Next →
          </button>
        </div>
      )}

      {/* Now playing bar */}
      {npName && (
        <div className={`sticky bottom-0 -mx-6 md:-mx-16 px-6 md:px-16 py-3 border-t flex items-center gap-4 ${dark ? "bg-[#0d0d0d]/95 border-white/8" : "bg-[#F5F2ED]/95 border-black/8"} backdrop-blur-sm`}>
          <svg className="w-4 h-4 shrink-0 text-[#E8D5B7]" fill="currentColor" viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0118 0v6"/><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3z"/><path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z"/></svg>
          <p className={`text-[12px] flex-1 truncate ${dark ? "text-white/70" : "text-[#3a3a3a]"}`}>{npName}</p>
          <span className={`text-[11px] tabular-nums shrink-0 ${muted}`}>{npTime}</span>
          <button onClick={stopAudio} className={`text-[10px] tracking-[0.1em] uppercase px-3 py-1.5 rounded-lg border transition-colors duration-200 ${dark ? "border-white/10 text-white/30 hover:border-red-400/40 hover:text-red-400" : "border-black/10 text-[#9a8a7a] hover:border-red-400/40 hover:text-red-400"}`}>
            Stop
          </button>
        </div>
      )}
    </div>
  );
}
