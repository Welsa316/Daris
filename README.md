# Daris – Marketing Website

Static marketing and lead-generation website for **Daris (دارس)**, an educational service offering Quran, Arabic, and Fiqh teaching. Built with **Vite + Vue 3 + Vue Router + TailwindCSS**.

> **Note:** This is a marketing site only — no backend, no payments, no user accounts.

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## Production build

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

---

## Project structure

```
├── public/
│   └── images/
│       ├── daris-logo.png            # Brand logo
│       └── sheikh-placeholder.svg    # Placeholder photo
├── src/
│   ├── assets/                       # Source assets (also available)
│   ├── config/
│   │   └── contactConfig.js          # ← WhatsApp, email, form config
│   ├── router/
│   │   └── index.js                  # Vue Router setup
│   ├── components/
│   │   ├── common/
│   │   │   ├── CTAButton.vue         # Reusable CTA button
│   │   │   ├── FAQAccordion.vue      # Expandable FAQ
│   │   │   ├── GeometricDivider.vue  # Islamic geometric accent
│   │   │   ├── SectionHeader.vue     # Section title + description
│   │   │   ├── TestimonialCard.vue   # Student testimonial (hidden by default)
│   │   │   └── WhatsAppFloat.vue     # Sticky floating WhatsApp button
│   │   ├── contact/
│   │   │   └── ContactForm.vue       # Contact form (mailto or Formspree)
│   │   ├── home/
│   │   │   ├── HeroSection.vue       # Homepage hero
│   │   │   └── TrustStrip.vue        # Trust indicators strip
│   │   ├── layout/
│   │   │   ├── AppLayout.vue         # Root layout wrapper
│   │   │   ├── Navbar.vue            # Sticky responsive navigation
│   │   │   └── SiteFooter.vue        # Site footer
│   │   └── programs/
│   │       └── ProgramCard.vue       # Program preview card
│   └── views/
│       ├── HomeView.vue              # / — Home page
│       ├── AboutView.vue             # /about — About the Sheikh
│       ├── ProgramsView.vue          # /programs — Program details
│       └── ContactView.vue           # /contact — Contact page
├── index.html
├── tailwind.config.cjs
├── tailwind.css
├── postcss.config.cjs
├── vite.config.mts
└── package.json
```

---

## Configuration

All configurable values are in a single file:

### `src/config/contactConfig.js`

```js
export const contactConfig = {
  // Replace with your WhatsApp number in international format (no +)
  whatsappNumber: '200000000000',

  // Pre-filled WhatsApp message
  whatsappMessage: 'Assalamu alaikum, I would like to learn more about Daris programs.',

  // Contact email address
  contactEmail: 'contact@daris-example.com',

  // Form endpoint — leave empty for mailto, or set to Formspree/similar URL
  formEndpoint: ''
};
```

### WhatsApp number

Set `whatsappNumber` to the full international number without `+` or spaces.
Example: Egypt number `+20 123 456 7890` → `'201234567890'`

### Email

Set `contactEmail` to your preferred email address.

### Contact form behaviour

| `formEndpoint` value | Behaviour |
|---|---|
| `''` (empty, default) | Clicking "Send message" opens the user's email client with a pre-filled `mailto:` link |
| `'https://formspree.io/f/your-id'` | Form data is POSTed directly to Formspree (or any compatible endpoint) |

**To set up Formspree:**

1. Create a free form at [formspree.io](https://formspree.io)
2. Copy your endpoint URL (e.g. `https://formspree.io/f/xyzabcde`)
3. Paste it as the `formEndpoint` value in `contactConfig.js`

---

## Swapping images

### Logo

- **Location:** `public/images/daris-logo.png`
- Replace this file with your own logo (keep the same filename, or update the references)
- Also exists at `src/assets/daris-logo.png` as a backup

### Sheikh photo

- **Current placeholder:** `public/images/sheikh-placeholder.svg`
- **Used in:** `HomeView.vue`, `AboutView.vue`
- **To replace:**
  1. Save your photo (e.g. `sheikh-photo.jpg`) to `public/images/`
  2. Search for `/images/sheikh-placeholder.svg` in the source files
  3. Replace with `/images/sheikh-photo.jpg`

---

## Pages and routes

| Route | Page | Key sections |
|---|---|---|
| `/` | Home | Hero, trust strip, program previews, about preview, how it works, FAQ, CTA banner |
| `/about` | About | Sheikh profile, credentials, teaching philosophy, languages |
| `/programs` | Programs | Detailed Quran / Arabic / Fiqh sections, pricing sidebar, logistics |
| `/contact` | Contact | Contact form, WhatsApp & email links, timezone & response info |

---

## Deployment

### Netlify

1. Connect your Git repository
2. **Build command:** `npm run build`
3. **Publish directory:** `dist`
4. Add a `public/_redirects` file for SPA routing:
   ```
   /* /index.html 200
   ```

### Vercel

1. Import your Git repository
2. **Framework preset:** Vite (or "Other")
3. **Build command:** `npm run build`
4. **Output directory:** `dist`
5. Add a `vercel.json` for SPA routing:
   ```json
   { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
   ```

### Generic static hosting

Run `npm run build` and upload the `dist/` folder to any static host (GitHub Pages, Cloudflare Pages, S3, etc.). Ensure all routes serve `index.html` for client-side routing.

---

## Design system

| Token | Value | Usage |
|---|---|---|
| Primary (deep green) | `#1F4D3A` | Headings, buttons, accents |
| Gold | `#C8A951` | Eyebrows, tags, subtle highlights |
| Cream | `#F5F1E8` | Page background |
| Font | Inter (Google Fonts) | All text |

### Key design features

- **Sticky navigation** with scroll shadow
- **Floating WhatsApp button** with pulse animation
- **Islamic geometric dividers** between sections
- **Card hover effects** (lift + shadow transition)
- **Hero entrance animations** (fade-in-up staggered)
- **FAQ accordion** with smooth expand/collapse
- **Responsive hamburger menu** with slide transition
- **Mobile-first** responsive layout throughout

---

## Notes

- This site is for **marketing and lead generation** only — no course portal, payments, or backend
- English support is provided **through the team** without naming individual team members
- Prices are not displayed — all references say "Contact for pricing"
- The `TestimonialCard` component is included but hidden (`visible: false`) — set to `true` and fill in content when testimonials are available
- All content is real copy (not lorem ipsum) and can be edited directly in the Vue files
