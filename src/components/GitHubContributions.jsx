import { useEffect, useState } from "react";

const LEVELS_DARK = [
  "bg-white/[0.06]",
  "bg-[#E8B257]/25",
  "bg-[#E8B257]/50",
  "bg-[#E8B257]/75",
  "bg-[#E8B257]",
];
const LEVELS_LIGHT = [
  "bg-[#2D4A2B]/[0.07]",
  "bg-[#2D4A2B]/25",
  "bg-[#2D4A2B]/50",
  "bg-[#2D4A2B]/75",
  "bg-[#2D4A2B]",
];

export default function GitHubContributions({ dark }) {
  const [weeks, setWeeks] = useState([]);
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://github-contributions-api.jogruber.de/v4/tobyansohn?y=last")
      .then((r) => r.json())
      .then((data) => {
        const contributions = data.contributions ?? [];
        const year = new Date().getFullYear();
        setTotal(data.total?.[year] ?? null);

        // slice last 26 weeks worth of days, aligned to full weeks
        const days = contributions.slice(-26 * 7);
        const chunked = [];
        for (let i = 0; i < days.length; i += 7) chunked.push(days.slice(i, i + 7));
        setWeeks(chunked);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const levels = dark ? LEVELS_DARK : LEVELS_LIGHT;
  const muted = dark ? "text-white/35" : "text-[#9A8A70]";

  if (loading) {
    return (
      <div className="flex items-center gap-2 mt-6">
        <div className={`w-4 h-4 rounded-full border-2 border-t-transparent animate-spin ${dark ? "border-white/20" : "border-black/15"}`} />
        <span className={`text-[11px] tracking-[0.2em] uppercase font-medium ${muted}`}>Loading activity…</span>
      </div>
    );
  }

  if (weeks.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] tracking-[0.2em] uppercase font-medium ${muted}`}>
          {total !== null ? `${total} contributions this year` : "GitHub activity"}
        </span>
        <a
          href="https://github.com/tobyansohn"
          target="_blank"
          rel="noopener noreferrer"
          className={`text-[10px] tracking-[0.16em] uppercase font-medium transition-colors duration-300 ${dark ? "text-white/35 hover:text-[#E8B257]" : "text-[#9A8A70] hover:text-[#2D4A2B]"}`}
        >
          View on GitHub →
        </a>
      </div>
      <div className="flex gap-[3px] overflow-x-auto no-scrollbar">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                className={`w-[10px] h-[10px] flex-shrink-0 ${levels[day.level ?? 0]}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
