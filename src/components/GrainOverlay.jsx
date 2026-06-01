import { useTheme } from "../context/ThemeContext.jsx";

// Static grayscale-noise tile rendered ONCE via SVG inside a data URI, then
// tiled by the compositor as a plain background-image. This avoids the
// per-frame `filter: url(#feTurbulence)` repaint that previously ran on every
// scroll/resize — by far the biggest INP hit on the page.
const NOISE_TILE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export default function GrainOverlay() {
  const { dark } = useTheme();
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none select-none"
      style={{
        zIndex: 9995,
        backgroundImage: NOISE_TILE,
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        mixBlendMode: "overlay",
        opacity: dark ? 0.18 : 0.12,
      }}
    />
  );
}
