import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext.jsx";

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

const projects = [
  { title: "Project Alpha", description: "A full-stack SaaS platform with real-time collaboration, built with React, Node.js, and PostgreSQL.", tags: ["React", "Node.js", "PostgreSQL", "WebSocket"], year: "2024", link: "#" },
  { title: "Project Beta", description: "Mobile-first e-commerce application featuring AI-powered product recommendations and seamless checkout.", tags: ["React Native", "GraphQL", "Stripe", "AWS"], year: "2024", link: "#" },
  { title: "Project Gamma", description: "Developer tooling CLI that automates boilerplate generation and CI/CD pipeline configuration.", tags: ["TypeScript", "Node.js", "Docker", "GitHub Actions"], year: "2023", link: "#" },
  { title: "Project Delta", description: "Open-source data visualization library with 30+ customizable chart types and accessibility support.", tags: ["D3.js", "React", "TypeScript", "Storybook"], year: "2023", link: "#" },
];

const skills = [
  { category: "Frontend", items: ["React", "TypeScript", "Next.js", "Tailwind CSS", "Vite"] },
  { category: "Backend", items: ["Node.js", "Express", "PostgreSQL", "MongoDB", "REST / GraphQL"] },
  { category: "Tools", items: ["Git", "Docker", "AWS", "Vercel", "Figma"] },
];

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
    <main className="pt-28 pb-32 px-6 md:px-16 max-w-6xl mx-auto">
      <div ref={headerRef} className="mb-24">
        <div className={`transition-all duration-700 ${headerInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className={`text-[11px] tracking-[0.35em] uppercase block mb-6 ${dark ? "text-white/30" : "text-[#5a4a3a]"}`}>Software Development</span>
          <h1 className={`font-display text-[clamp(3rem,7vw,6rem)] leading-[0.92] mb-8 ${dark ? "text-white" : "text-[#1a1a1a]"}`}>
            Building things<br />
            <span className={dark ? "text-white/30" : "text-[#7a6a5a]"}>that matter.</span>
          </h1>
          <p className={`max-w-lg text-[15px] leading-relaxed ${dark ? "text-white/45" : "text-[#3a3a3a]"}`}>
            I write clean, scalable code and obsess over user experience. From REST APIs to interactive UIs — full-stack, front-to-back.
          </p>
        </div>
      </div>

      <div ref={skillsRef} className="mb-24 grid md:grid-cols-3 gap-6">
        {skills.map(({ category, items }, i) => (
          <div key={category} className={`p-8 rounded-2xl border transition-all duration-700 ${dark ? "border-white/8 bg-white/[0.02]" : "border-[#b0a090] bg-[#ede8e0]"} ${skillsInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`} style={{ transitionDelay: `${i * 100}ms` }}>
            <p className={`text-[11px] tracking-[0.3em] uppercase mb-5 ${dark ? "text-white/30" : "text-[#5a4a3a]"}`}>{category}</p>
            <ul className="space-y-2">
              {items.map(item => (
                <li key={item} className={`flex items-center gap-3 text-[14px] ${dark ? "text-white/60" : "text-black/55"}`}>
                  <span className="w-1 h-1 rounded-full bg-[#E8D5B7]/50 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[11px] tracking-[0.35em] uppercase ${dark ? "text-white/30" : "text-[#5a4a3a]"}`}>Selected Projects</span>
          <span className={`text-[11px] tracking-[0.2em] uppercase ${dark ? "text-white/20" : "text-black/20"}`}>{projects.length} total</span>
        </div>
        {projects.map((project, i) => <ProjectCard key={project.title} project={project} index={i} dark={dark} />)}
      </div>
    </main>
  );
}