import { useState, useEffect, useRef, useCallback } from "react";

const IA_SEARCH = "https://archive.org/advancedsearch.php";
const IA_META   = "https://archive.org/metadata";
const IA_DL     = "https://archive.org/download";
const PAGE_SZ   = 24;

const QUICK_TAGS = [
  "explosion", "footstep", "laser", "coin", "jump",
  "sword", "magic", "ambient", "thunder", "rain",
  "gunshot", "game over", "level up", "fire",
];

const SORT_OPTS = [
  { value: "downloads desc", label: "Most downloaded" },
  { value: "avg_rating desc", label: "Highest rated" },
  { value: "publicdate desc", label: "Newest" },
];

function formatDur(s) {
  if (!s || isNaN(s)) return "—";
  const m = Math.floor(s / 60), sec = Math.round(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/* Real-time frequency waveform driven by Web Audio AnalyserNode */
function LiveWaveBar({ analyser, color }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!analyser || !canvas) return;

    const bufLen = analyser.frequencyBinCount;
    const data   = new Uint8Array(bufLen);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);

      const dpr = devicePixelRatio || 1;
      const W = canvas.width  = canvas.offsetWidth  * dpr;
      const H = canvas.height = canvas.offsetHeight * dpr;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, W, H);

      const bw   = (W / bufLen) * 0.55;
      const gap  = W / bufLen;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 255;
        const h = Math.max(2 * dpr, v * H * 0.9);
        ctx.globalAlpha = 0.25 + v * 0.75;
        ctx.fillStyle   = color;
        ctx.fillRect(i * gap, (H - h) / 2, bw, h);
      }
      ctx.globalAlpha = 1;
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, color]);

  return (
    <div className="h-10 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

function PlayIcon() {
  return (
    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <rect x="5" y="5" width="14" height="14" rx="1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function SpinnerIcon() {
  return <span className="w-3.5 h-3.5 rounded-full border-2 border-t-transparent border-current animate-spin inline-block" />;
}

function SFXCard({ item, isPlaying, analyser, loadingAudio, onPlay, onDownload, dark }) {
  const border = dark ? "border-white/8"  : "border-[#b0a090]";
  const bg     = dark ? "bg-white/[0.02]" : "bg-[#faf8f5]";
  const muted  = dark ? "text-white/30"   : "text-[#9a8a7a]";
  const accent = dark ? "#E8D5B7"         : "#6B4F2A";
  const tags   = (Array.isArray(item.subject) ? item.subject : []).slice(0, 2);

  const playBg = isPlaying
    ? "bg-[#7c5cfc] text-white hover:bg-[#6a4de0]"
    : dark
      ? "bg-[#E8D5B7]/90 text-[#080808] hover:bg-[#E8D5B7]"
      : "bg-[#6B4F2A] text-white hover:bg-[#5a4020]";

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200 ${border} ${bg} ${isPlaying ? (dark ? "border-[#7c5cfc]/40" : "border-[#7c5cfc]/30") : ""}`}>
      <div className="h-[2px]" style={{ background: isPlaying ? "#7c5cfc" : accent }} />

      <div className="p-3 flex flex-col gap-2.5">
        <p className={`text-[12px] font-medium leading-snug line-clamp-2 ${dark ? "text-white/80" : "text-[#1a1a1a]"}`}>
          {item.title}
        </p>

        <div className="h-10">
          {isPlaying && analyser && <LiveWaveBar analyser={analyser} color="#7c5cfc" />}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPlay}
            disabled={loadingAudio}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shrink-0 hover:scale-105 active:scale-95 disabled:opacity-50 ${playBg}`}
          >
            {loadingAudio ? <SpinnerIcon /> : isPlaying ? <StopIcon /> : <PlayIcon />}
          </button>

          <div className="flex gap-1.5 flex-1 min-w-0">
            {tags.map(t => (
              <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded truncate ${dark ? "bg-white/5 text-white/25" : "bg-black/5 text-[#9a8a7a]"}`}>{t}</span>
            ))}
          </div>

          <button
            onClick={onDownload}
            disabled={loadingAudio}
            className={`flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1.5 rounded-lg border transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${dark ? "border-white/8 text-white/35 hover:border-white/20 hover:text-white/60" : "border-black/10 text-[#5a4a3a] hover:border-black/20 hover:text-[#1a1a1a]"}`}
          >
            <DownloadIcon /> MP3
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SFXLibrary({ dark }) {
  const [query, setQuery]           = useState("");
  const [results, setResults]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [sort, setSort]             = useState("downloads desc");
  const [playingId, setPlayingId]   = useState(null);
  const [loadingId, setLoadingId]   = useState(null);
  const [progress, setProgress]     = useState(0);
  const [npName, setNpName]         = useState(null);
  const [npTime, setNpTime]         = useState("0:00 / 0:00");
  const [activeChip, setActiveChip] = useState(null);

  const audioRef      = useRef(null);
  const rafRef        = useRef(null);
  const searchRef     = useRef(null);
  const debounceRef   = useRef(null);
  const urlCache      = useRef({});
  const audioCtxRef   = useRef(null);
  const analyserRef   = useRef(null);
  const srcCreated    = useRef(false);

  const muted      = dark ? "text-white/30" : "text-[#5a4a3a]";
  const border     = dark ? "border-white/8" : "border-[#b0a090]";
  const totalPages = Math.ceil(total / PAGE_SZ);

  /* Set up AudioContext + AnalyserNode once on first play */
  const ensureAnalyser = useCallback(() => {
    if (srcCreated.current || !audioRef.current) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx      = new AudioCtx();
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    srcCreated.current  = true;
  }, []);

  const stopAudio = useCallback(() => {
    const a = audioRef.current;
    if (a) { a.pause(); a.src = ""; }
    cancelAnimationFrame(rafRef.current);
    setPlayingId(null);
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

  const getAudioUrl = async (identifier) => {
    if (urlCache.current[identifier]) return urlCache.current[identifier];
    const r    = await fetch(`${IA_META}/${identifier}`);
    const data = await r.json();
    const files = data.files || [];
    const audio = files.find(f => /\.(mp3|ogg)$/i.test(f.name) && f.source === "original")
               || files.find(f => /\.(mp3|ogg|wav)$/i.test(f.name));
    if (!audio) return null;
    const url = `${IA_DL}/${identifier}/${audio.name}`;
    urlCache.current[identifier] = url;
    return url;
  };

  const togglePlay = useCallback(async (item) => {
    const a = audioRef.current;
    if (!a) return;
    if (playingId === item.identifier && !a.paused) { stopAudio(); return; }
    stopAudio();
    setLoadingId(item.identifier);
    try {
      const url = await getAudioUrl(item.identifier);
      if (!url) return;
      try {
        ensureAnalyser();
        if (audioCtxRef.current?.state === "suspended") {
          await audioCtxRef.current.resume();
        }
      } catch (ae) {
        console.warn("AudioContext setup failed, playing without analyser:", ae);
      }
      a.src = url;
      await a.play();
      setPlayingId(item.identifier);
      setNpName(item.title);
      rafRef.current = requestAnimationFrame(tick);
    } catch (e) {
      console.warn("SFX play failed:", e);
    } finally {
      setLoadingId(null);
    }
  }, [playingId, stopAudio, tick, ensureAnalyser]);

  const downloadSound = useCallback(async (item) => {
    setLoadingId(item.identifier);
    try {
      const url = await getAudioUrl(item.identifier);
      if (!url) return;
      const filename = item.title.replace(/[^a-z0-9_\-]/gi, "_") + ".mp3";
      try {
        const r = await fetch(url, { mode: "cors" });
        if (!r.ok) throw new Error();
        const blob = await r.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 8000);
      } catch {
        window.open(url, "_blank");
      }
    } finally {
      setLoadingId(null);
    }
  }, []);

  const doSearch = useCallback(async (q, pg = 1, srt = sort) => {
    setLoading(true);
    setError(null);
    const term = q.trim() || "sound effects";
    try {
      const fullQ  = `(${term}) AND mediatype:audio AND (subject:("sound effects") OR subject:(sfx) OR subject:("sound effect"))`;
      const sortEnc = encodeURIComponent(srt);
      const url =
        `${IA_SEARCH}?q=${encodeURIComponent(fullQ)}` +
        `&fl[]=identifier&fl[]=title&fl[]=subject&fl[]=downloads` +
        `&sort[]=${sortEnc}&rows=${PAGE_SZ}&page=${pg}&output=json`;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const data = await r.json();
      const items = (data.response?.docs || []).map(d => ({
        ...d,
        subject: typeof d.subject === "string"
          ? d.subject.split(";").map(s => s.trim())
          : (d.subject || []),
      }));
      setResults(items);
      setTotal(data.response?.numFound || 0);
      setPage(pg);
    } catch (e) {
      console.warn("SFX search failed:", e);
      setError("Could not load sounds — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => {
    doSearch("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (q) => {
    setQuery(q);
    setActiveChip(null);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q, 1, sort), 380);
  };

  const handleChip = (chip) => {
    if (activeChip === chip) {
      setActiveChip(null); setQuery(""); doSearch("", 1, sort);
    } else {
      setActiveChip(chip); setQuery(chip); doSearch(chip, 1, sort);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "/" && document.activeElement !== searchRef.current) { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === "Escape") stopAudio();
    };
    window.addEventListener("keydown", handler);
    return () => { window.removeEventListener("keydown", handler); cancelAnimationFrame(rafRef.current); };
  }, [stopAudio]);

  return (
    <div>
      <audio ref={audioRef} preload="none" crossOrigin="anonymous" onEnded={stopAudio} />

      <p className={`text-[14px] leading-relaxed mb-6 max-w-lg ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
        Browse royalty-free sounds from the Internet Archive. No account needed — click ▶ to preview, ⬇ to download.
      </p>

      {/* Search + sort */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${muted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder='Search "explosion", "footstep", "laser"…'
            className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-[13px] outline-none transition-colors duration-200 ${dark ? "bg-white/[0.03] border-white/8 text-white placeholder:text-white/20 focus:border-white/20" : "bg-[#faf8f5] border-[#b0a090] text-[#1a1a1a] placeholder:text-[#9a8a7a] focus:border-[#6B4F2A]/40"}`}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setActiveChip(null); doSearch("", 1, sort); }}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] ${muted}`}
            >✕</button>
          )}
        </div>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); doSearch(query, 1, e.target.value); }}
          className={`px-3 py-2.5 rounded-xl border text-[12px] outline-none ${dark ? "bg-white/[0.03] border-white/8 text-white/60" : "bg-[#faf8f5] border-[#b0a090] text-[#5a4a3a]"}`}
        >
          {SORT_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Quick chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        {QUICK_TAGS.map(chip => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            className={`px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase transition-all duration-200 border shrink-0 ${
              activeChip === chip
                ? (dark ? "bg-white text-[#080808] border-white" : "bg-[#1a1a1a] text-white border-[#1a1a1a]")
                : (dark ? "border-white/10 text-white/35 hover:border-white/25 hover:text-white/60" : "border-black/10 text-[#5a4a3a] hover:border-black/25")
            }`}
          >{chip}</button>
        ))}
      </div>

      {/* Stats */}
      {total > 0 && !loading && (
        <div className={`flex items-center justify-between mb-4 text-[11px] ${muted}`}>
          <span><strong className={dark ? "text-white/60" : "text-[#1a1a1a]"}>{total.toLocaleString()}</strong> sounds found</span>
          <span>Page <strong className={dark ? "text-white/60" : "text-[#1a1a1a]"}>{page}</strong> / {totalPages}</span>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className={`w-7 h-7 rounded-full border-2 border-t-transparent animate-spin ${dark ? "border-white/20" : "border-black/20"}`} />
        </div>
      ) : error ? (
        <div className={`py-16 text-center ${muted}`}>
          <p className="text-3xl mb-3">⚠️</p>
          <p className="text-[13px] mb-4">{error}</p>
          <button
            onClick={() => doSearch(query, page, sort)}
            className={`px-4 py-2 rounded-xl border text-[12px] transition-all ${dark ? "border-white/15 hover:border-white/30 text-white/50 hover:text-white" : "border-black/15 hover:border-black/30 text-[#5a4a3a]"}`}
          >Try again</button>
        </div>
      ) : results.length === 0 ? (
        <div className={`py-24 text-center ${muted}`}>
          <p className="text-3xl mb-3">🎵</p>
          <p className="text-[13px]">No sounds matched — try a different term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {results.map(item => (
            <SFXCard
              key={item.identifier}
              item={item}
              isPlaying={playingId === item.identifier}
              analyser={playingId === item.identifier ? analyserRef.current : null}
              loadingAudio={loadingId === item.identifier}
              onPlay={() => togglePlay(item)}
              onDownload={() => downloadSound(item)}
              dark={dark}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-4 mb-6">
          <button
            disabled={page <= 1}
            onClick={() => { doSearch(query, page - 1, sort); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`px-4 py-2 rounded-xl border text-[12px] transition-all duration-200 disabled:opacity-30 ${dark ? "border-white/8 text-white/50 hover:border-white/20 hover:text-white" : "border-[#b0a090] text-[#5a4a3a] hover:border-[#6B4F2A]"}`}
          >← Prev</button>
          <span className={`text-[12px] ${muted}`}>Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => { doSearch(query, page + 1, sort); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className={`px-4 py-2 rounded-xl border text-[12px] transition-all duration-200 disabled:opacity-30 ${dark ? "border-white/8 text-white/50 hover:border-white/20 hover:text-white" : "border-[#b0a090] text-[#5a4a3a] hover:border-[#6B4F2A]"}`}
          >Next →</button>
        </div>
      )}

      {/* Now playing */}
      {npName && (
        <div className={`sticky bottom-0 -mx-6 md:-mx-16 px-6 md:px-16 py-3 border-t flex items-center gap-4 ${dark ? "bg-[#0d0d0d]/95 border-white/8" : "bg-[#F5F2ED]/95 border-black/8"} backdrop-blur-sm`}>
          <div className="w-1.5 h-1.5 rounded-full bg-[#7c5cfc] animate-pulse shrink-0" />
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
