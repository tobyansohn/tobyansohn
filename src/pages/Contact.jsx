import { useCallback, useEffect, useRef, useState } from "react";
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

const socials = [
  { label: "GitHub", handle: "@tobyansohn", href: "https://github.com/tobyansohn" },
  { label: "LinkedIn", handle: "Tobyan Sohn", href: "https://linkedin.com/in/tobyansohn" },
  { label: "Instagram", handle: "@tobsfotos", href: "https://instagram.com/tobsfotos" },
  { label: "Youtube", handle: "@1tobyan", href: "https://www.youtube.com/@1tobyan" },
];

export default function Contact() {
  const { dark } = useTheme();
  const [headerRef, headerInView] = useInView();
  const [bodyRef, bodyInView] = useInView();
  const [copied, setCopied] = useState(false);

  const copyEmail = useCallback(() => {
    navigator.clipboard.writeText("tobyansohn@gmail.com").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const body = dark ? "text-white/45" : "text-[#3a3a3a]";
  const heading = dark ? "text-white" : "text-[#1a1a1a]";
  const headingFaded = dark ? "text-white/30" : "text-[#7a6a5a]";

  return (
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-4xl mx-auto">
      <div ref={headerRef} className="mb-20">
        <div className={`transition-[opacity,transform] duration-600 ease-snappy ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${muted}`}>Contact</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${heading}`}>
            Let's create<br /><span className={headingFaded}>something great.</span>
          </h1>
          <p className={`max-w-md text-[15px] leading-relaxed ${body}`}>
            Whether you need a developer, a photographer, or both — I'd love to hear from you.
          </p>
        </div>
      </div>

      <div ref={bodyRef} className="flex flex-col gap-16">
        {/* Email */}
        <div className={`transition-[opacity,transform] duration-600 ease-snappy ${bodyInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className={`text-[11px] tracking-[0.35em] uppercase mb-5 ${muted}`}>Email</p>
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="mailto:tobyansohn@gmail.com"
              className={`font-display text-3xl md:text-4xl transition-colors duration-300 ${dark ? "text-white/80 hover:text-[#E8D5B7]" : "text-[#1a1a1a] hover:text-[#6B4F2A]"}`}
            >
              tobyansohn@gmail.com
            </a>
            <button
              onClick={copyEmail}
              aria-label="Copy email address"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] tracking-[0.15em] uppercase transition-[color,border-color,opacity,transform] duration-200 ease-snappy ${
                copied
                  ? dark ? "border-[#E8D5B7]/40 text-[#E8D5B7]" : "border-[#6B4F2A]/40 text-[#6B4F2A]"
                  : dark ? "border-white/15 text-white/40 hover:border-white/30 hover:text-white/70" : "border-black/15 text-black/40 hover:border-black/30 hover:text-black/70"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        {/* Socials */}
        <div className={`transition-[opacity,transform] duration-600 ease-snappy delay-150 ${bodyInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className={`text-[11px] tracking-[0.35em] uppercase mb-6 ${muted}`}>Find Me</p>
          <ul className="space-y-5">
            {socials.map(({ label, handle, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group"
                >
                  <span className={`text-[13px] tracking-[0.1em] uppercase ${muted}`}>{label}</span>
                  <span className={`text-[15px] flex items-center gap-2 transition-colors duration-300 ${dark ? "text-white/60 group-hover:text-[#E8D5B7]" : "text-black/55 group-hover:text-[#6B4F2A]"}`}>
                    {handle}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-px group-hover:-translate-y-px transition-[color,border-color,opacity,transform] duration-200 ease-snappy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </span>
                </a>
                <div className={`mt-5 h-px ${dark ? "bg-white/8" : "bg-black/8"}`} />
              </li>
            ))}
          </ul>
        </div>

      </div>
    </main>
  );
}
