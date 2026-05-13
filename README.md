# Portfolio — Your Name

A cinematic, multi-page portfolio site for software development, photography, and videography.

## Stack

- **React 18** with React Router v6
- **Tailwind CSS** v3
- **Vite** v5
- **Fonts**: Cormorant Garamond (display) + DM Sans (body) via Google Fonts

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Customization Checklist

### Global
- [ ] Replace `"Your Name"` in `Home.jsx` with your actual name
- [ ] Replace `"[Your City]"` in `Home.jsx` with your location
- [ ] Update stats (years, projects, photos) in `Home.jsx`
- [ ] Update `your@email.com` in `Contact.jsx`
- [ ] Update social handles and links in `Contact.jsx`

### Developer Page (`src/pages/Developer.jsx`)
- [ ] Replace placeholder projects with your real projects
- [ ] Update links from `#` to actual project URLs
- [ ] Adjust tech stack in the skills grid

### Photography Page (`src/pages/Photography.jsx`)
- [ ] Replace gradient placeholders with your actual `<img>` tags
- [ ] Add your real photo titles, locations, and categories

### Videography Page (`src/pages/Videography.jsx`)
- [ ] Replace gradient thumbnails with real video thumbnails or embeds
- [ ] Update showreel link/embed
- [ ] Update gear list with your actual equipment

### Contact
- [ ] Wire up form to a handler: [Formspree](https://formspree.io), [EmailJS](https://emailjs.com), or your own API

## File Structure

```
src/
├── App.jsx                 # Router + layout shell
├── main.jsx                # Entry point
├── index.css               # Global styles + font imports
├── components/
│   ├── Navbar.jsx          # Sticky nav with mobile menu
│   ├── CustomCursor.jsx    # Smooth cursor (desktop only)
│   └── PageTransition.jsx  # Fade/slide between routes
└── pages/
    ├── Home.jsx            # Hero + about + section cards
    ├── Developer.jsx       # Skills grid + project list
    ├── Photography.jsx     # Masonry gallery + lightbox
    ├── Videography.jsx     # Video cards + gear list
    └── Contact.jsx         # Contact form + socials
```

## Design System

| Token | Value |
|---|---|
| Primary accent | `#E8D5B7` (warm cream) |
| Background | `#080808` |
| Display font | Cormorant Garamond |
| Body font | DM Sans |

## Adding Real Photos

In `Photography.jsx`, replace the gradient `<div>` inside `PhotoCard` with:
```jsx
<img
  src="/photos/your-image.jpg"
  alt={photo.title}
  className="w-full h-full object-cover"
/>
```

Place images in `public/photos/` and they'll be served by Vite automatically.
