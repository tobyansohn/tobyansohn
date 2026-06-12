import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ProjectModal({ project, onClose, dark }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  const border = dark ? "border-white/10" : "border-[#C8B996]";
  const muted = dark ? "text-white/30" : "text-[#7A6B53]";
  const body = dark ? "text-white/55" : "text-[#3D2F1F]";
  const heading = dark ? "text-white" : "text-[#2A2014]";

  const statusColor = project.status === "Live"
    ? "text-emerald-400"
    : "text-amber-400";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto border ${dark ? "bg-[#111]" : "bg-[#E6DBC0]"} ${border}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-5 border-b flex items-start justify-between gap-4 ${dark ? "bg-[#111]" : "bg-[#E6DBC0]"} ${border}`}>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className={`text-[10px] tracking-[0.24em] uppercase font-medium ${muted}`}>{project.year}</span>
              <span className={`text-[10px] tracking-[0.18em] uppercase font-medium ${statusColor}`}>{project.status}</span>
            </div>
            <h2 className={`font-light tracking-tight text-2xl md:text-3xl ${heading}`}>{project.title}</h2>
          </div>
          <button
            onClick={onClose}
            className={`shrink-0 mt-1 w-8 h-8 flex items-center justify-center transition-colors ${dark ? "text-white/35 hover:text-white hover:bg-white/10" : "text-black/30 hover:text-black hover:bg-black/8"}`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-8">
          <p className={`text-[15px] leading-relaxed ${body}`}>{project.description}</p>

          {/* Highlights */}
          {project.highlights?.length > 0 && (
            <div>
              <p className={`text-[11px] tracking-[0.24em] uppercase font-medium mb-4 ${muted}`}>Highlights</p>
              <ul className="flex flex-col gap-3">
                {project.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3">
                    <span className={`mt-[7px] w-1 h-1 rounded-full flex-shrink-0 ${dark ? "bg-[#E8B257]/50" : "bg-[#2D4A2B]/50"}`} />
                    <span className={`text-[14px] leading-relaxed ${body}`}>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          <div>
            <p className={`text-[11px] tracking-[0.24em] uppercase font-medium mb-3 ${muted}`}>Stack</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {project.tags.map((tag) => (
                <span key={tag} className={`text-[10px] tracking-[0.16em] uppercase font-medium ${dark ? "text-white/40" : "text-[#7A6B53]"}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target={project.liveUrl.startsWith("http") ? "_blank" : "_self"}
                rel="noopener noreferrer"
                className={`group flex items-center gap-1.5 pb-1 border-b text-[11px] tracking-[0.2em] uppercase font-medium transition-[color,border-color] duration-300 ${dark ? "border-[#E8B257]/60 text-[#E8B257] hover:border-[#E8B257]" : "border-[#2D4A2B]/50 text-[#2D4A2B] hover:border-[#2D4A2B]"}`}
              >
                View Live
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            )}
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 pb-1 border-b border-transparent text-[11px] tracking-[0.2em] uppercase font-medium transition-colors duration-300 ${dark ? "text-white/35 hover:text-white/70" : "text-[#7A6B53] hover:text-[#2A2014]"}`}
            >
              GitHub
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
