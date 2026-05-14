import { useState, useEffect, useRef } from "react";
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
  { label: "GitHub", handle: "@yourusername", href: "#" },
  { label: "LinkedIn", handle: "Your Name", href: "#" },
  { label: "Instagram", handle: "@yourusername", href: "#" },
  { label: "Twitter / X", handle: "@yourusername", href: "#" },
];

export default function Contact() {
  const { dark } = useTheme();
  const [form, setForm] = useState({ name: "", email: "", type: "dev", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [headerRef, headerInView] = useInView();
  const [formRef, formInView] = useInView();

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleSubmit = (e) => { e.preventDefault(); console.log("Form submitted:", form); setSubmitted(true); };

  const muted = dark ? "text-white/30" : "text-[#5a4a3a]";
  const body = dark ? "text-white/45" : "text-[#3a3a3a]";
  const heading = dark ? "text-white" : "text-[#1a1a1a]";
  const headingFaded = dark ? "text-white/30" : "text-[#7a6a5a]";
  const inputClass = `w-full border rounded-xl px-5 py-4 text-[14px] focus:outline-none transition-all duration-300 ${
    dark
      ? "bg-white/[0.03] border-white/10 text-white placeholder-white/25 focus:border-[#E8D5B7]/40 focus:bg-white/[0.05]"
      : "bg-[#ede8e0] border-[#b0a090] text-[#1a1a1a] placeholder-black/25 focus:border-[#6B4F2A]/40 focus:bg-[#e8e2da]"
  }`;

  return (
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-6xl mx-auto">
      <div ref={headerRef} className="mb-20">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${muted}`}>Contact</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${heading}`}>
            Let's create<br /><span className={headingFaded}>something great.</span>
          </h1>
          <p className={`max-w-md text-[15px] leading-relaxed ${body}`}>
            Whether you need a developer, a photographer, or both — I'd love to hear about your project.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-12 md:gap-20">
        {/* Form */}
        <div ref={formRef} className={`md:col-span-3 transition-all duration-700 ${formInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {submitted ? (
            <div className="h-full flex flex-col items-start justify-center py-16">
              <div className="w-12 h-12 rounded-full border border-[#E8D5B7]/40 flex items-center justify-center mb-6">
                <svg className="w-5 h-5 text-[#E8D5B7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`font-display text-3xl mb-3 ${heading}`}>Message sent.</h3>
              <p className={`text-[14px] ${body}`}>Thanks for reaching out — I'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[11px] tracking-[0.2em] uppercase ${muted}`}>Name</label>
                  <input name="name" type="text" required placeholder="Your name" value={form.name} onChange={handleChange} className={inputClass} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={`text-[11px] tracking-[0.2em] uppercase ${muted}`}>Email</label>
                  <input name="email" type="email" required placeholder="your@email.com" value={form.email} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[11px] tracking-[0.2em] uppercase ${muted}`}>I'm interested in</label>
                <div className="flex gap-3">
                  {[{ value: "dev", label: "Development" }, { value: "photo", label: "Photography" }, { value: "video", label: "Videography" }, { value: "both", label: "Multiple" }].map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                      className={`flex-1 py-3 rounded-xl text-[12px] tracking-[0.1em] uppercase transition-all duration-300 ${
                        form.type === opt.value
                          ? dark ? "bg-white/10 border border-[#E8D5B7]/40 text-[#E8D5B7]" : "bg-[#ede8e0] border border-[#6B4F2A]/40 text-[#6B4F2A]"
                          : dark ? "border border-white/10 text-white/35 hover:text-white/60" : "border border-black/10 text-black/35 hover:text-black/60"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-[11px] tracking-[0.2em] uppercase ${muted}`}>Message</label>
                <textarea name="message" required placeholder="Tell me about your project..." rows={5} value={form.message} onChange={handleChange} className={`${inputClass} resize-none`} />
              </div>

              <button
                type="submit"
                className={`mt-2 w-full py-4 rounded-xl text-[13px] tracking-[0.15em] uppercase font-medium transition-colors duration-300 ${
                  dark ? "bg-white text-[#080808] hover:bg-[#E8D5B7]" : "bg-[#1a1a1a] text-white hover:bg-[#3a3a3a]"
                }`}
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Sidebar */}
        <div className="md:col-span-2 flex flex-col gap-10">
          <div className={`transition-all duration-700 delay-200 ${formInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className={`text-[11px] tracking-[0.35em] uppercase mb-6 ${muted}`}>Direct</p>
            <a href="mailto:your@email.com" className={`text-[15px] transition-colors duration-300 block mb-2 ${dark ? "text-white/70 hover:text-[#E8D5B7]" : "text-black/60 hover:text-[#6B4F2A]"}`}>
              your@email.com
            </a>
            <p className={`text-[13px] ${muted}`}>Response within 24 hours</p>
          </div>

          <div className={`transition-all duration-700 delay-300 ${formInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className={`text-[11px] tracking-[0.35em] uppercase mb-6 ${muted}`}>Find Me</p>
            <ul className="space-y-4">
              {socials.map(({ label, handle, href }) => (
                <li key={label}>
                  <a href={href} className="flex items-center justify-between group" target="_blank" rel="noopener noreferrer">
                    <span className={`text-[13px] tracking-[0.1em] uppercase ${muted}`}>{label}</span>
                    <span className={`text-[13px] flex items-center gap-2 transition-colors duration-300 ${dark ? "text-white/55 group-hover:text-[#E8D5B7]" : "text-black/50 group-hover:text-[#6B4F2A]"}`}>
                      {handle}
                      <svg className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-px group-hover:-translate-y-px transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                      </svg>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className={`mt-auto pt-8 border-t transition-all duration-700 delay-400 ${formInView ? "opacity-100" : "opacity-0"} ${dark ? "border-white/8" : "border-[#b0a090]"}`}>
            <p className={`text-[12px] leading-relaxed ${muted}`}>
              Currently available for freelance projects and full-time opportunities.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}