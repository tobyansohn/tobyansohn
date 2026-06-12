import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { motion } from "framer-motion";

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

  const muted = dark ? "text-white/55" : "text-[#3D2F1F]";
  const superMuted = dark ? "text-white/35" : "text-[#5A4A36]";
  const heading = dark ? "text-white" : "text-[#1F1810]";
  const headingFaded = dark ? "text-white/35" : "text-[#7A6B53]";
  const accent = dark ? "text-[#E8B257]" : "text-[#2D4A2B]";
  const rule = dark ? "bg-white/12" : "bg-black/12";
  const wrap = "max-w-5xl mx-auto px-6 sm:px-8";
  const kicker = "text-[11px] tracking-[0.24em] uppercase font-medium";

  return (
    <main className={`pt-32 pb-32 ${wrap}`}>
      <div className="flex items-baseline gap-3 mb-4">
        <span className={`${kicker} ${accent}`}>Contact</span>
        <span className={`${kicker} ${superMuted}`}>05</span>
      </div>
      <div className={`h-px mb-16 ${rule}`} />
      <div ref={headerRef} className="mb-20">
        <div className={`transition-[opacity,transform] duration-600 ease-snappy ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className={`font-bold tracking-tight leading-[1.05] mb-8 ${heading}`} style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}>
            Let&rsquo;s create<br /><span className={`font-display italic ${accent}`}>something great.</span>
          </h1>
          <p className={`max-w-md text-[16px] leading-relaxed ${muted}`}>
            Whether you need a developer, a photographer, or both — I&rsquo;d love to hear from you.
          </p>
        </div>
      </div>

      <div ref={bodyRef} className="flex flex-col gap-16">
        {/* Email */}
        <div className={`transition-[opacity,transform] duration-600 ease-snappy ${bodyInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <p className={`${kicker} mb-5 ${superMuted}`}>Email</p>
          <div className="flex items-center gap-5 flex-wrap">
            <a
              href="mailto:tobyansohn@gmail.com"
              className={`font-light tracking-tight text-3xl md:text-4xl transition-colors duration-300 ${dark ? "text-white/90 hover:text-[#E8B257]" : "text-[#1F1810] hover:text-[#2D4A2B]"}`}
            >
              tobyansohn@gmail.com
            </a>
            <button
              onClick={copyEmail}
              aria-label="Copy email address"
              className={`flex items-center gap-1.5 pb-1 border-b text-[10px] tracking-[0.2em] uppercase font-medium transition-[color,border-color,opacity,transform] duration-200 ease-snappy ${
                copied
                  ? dark ? "border-[#E8B257]/50 text-[#E8B257]" : "border-[#2D4A2B]/50 text-[#2D4A2B]"
                  : dark ? "border-transparent text-white/40 hover:border-white/40 hover:text-white/70" : "border-transparent text-black/40 hover:border-black/40 hover:text-black/70"
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
          <p className={`${kicker} mb-6 ${superMuted}`}>Find Me</p>
          <ul className="space-y-5">
            {socials.map(({ label, handle, href }, i) => (
              <motion.li
                key={label}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08, ease: [0.23, 1, 0.32, 1] }}
              >
                <motion.a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <span className={`${kicker} ${superMuted}`}>{label}</span>
                  <span className={`text-[14px] flex items-center gap-2 transition-colors duration-300 ${dark ? "text-white/65 group-hover:text-[#E8B257]" : "text-[#3D2F1F] group-hover:text-[#2D4A2B]"}`}>
                    {handle}
                    <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-px group-hover:-translate-y-px transition-[color,border-color,opacity,transform] duration-200 ease-snappy" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </span>
                </motion.a>
                <div className={`mt-5 h-px ${dark ? "bg-white/10" : "bg-black/10"}`} />
              </motion.li>
            ))}
          </ul>
        </div>

      </div>
    </main>
  );
}
