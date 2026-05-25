import { useTheme } from "../context/ThemeContext.jsx";

export default function GrainOverlay() {
  const { dark } = useTheme();
  return (
    <>
      <svg width="0" height="0" aria-hidden="true" className="absolute">
        <defs>
          <filter id="grain-filter" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" result="noise" />
            <feColorMatrix type="saturate" values="0" in="noise" result="grey" />
            <feBlend in="SourceGraphic" in2="grey" mode="overlay" />
          </filter>
        </defs>
      </svg>
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none select-none"
        style={{
          zIndex: 9995,
          filter: "url(#grain-filter)",
          opacity: dark ? 0.045 : 0.03,
        }}
      />
    </>
  );
}
