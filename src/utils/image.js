export function optimizeImage(src, width = 800, quality = 82) {
  if (import.meta.env.DEV) return src;
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
