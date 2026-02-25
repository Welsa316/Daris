## Daris – Marketing Website

Static marketing and lead-generation website for **Daris (دارس)**, an educational service offering Quran, Arabic, and Fiqh teaching. Built with **Vite + Vue 3 + Vue Router + TailwindCSS**.

### Run the project

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npm run dev
   ```

3. Open the URL printed in your terminal (by default `http://localhost:5173`).

### Key configuration points

- **WhatsApp number and default message**
  - File: `src/config/contactConfig.js`
  - Properties:
    - `whatsappNumber`: set to your full number in international format without `+` (for example `201234567890`).
    - `whatsappMessage`: default pre-filled message for new enquiries.

- **Contact email**
  - File: `src/config/contactConfig.js`
  - Property:
    - `contactEmail`: used for mailto links and as the default recipient for the contact form when no form service endpoint is configured.

- **Contact form behaviour**
  - File: `src/config/contactConfig.js`
  - Property:
    - `formEndpoint`:
      - **Empty string (`''`)** (default): the `ContactForm` component will build a `mailto:` link on submit and open the user’s email client with a pre-filled message.
      - **Non-empty string (e.g. Formspree URL)**: the `ContactForm` will POST the form fields (`name`, `email`, `message`) to that endpoint using a dynamically created HTML form.

  - To use Formspree (example):
    1. Create a new form on Formspree and copy the endpoint URL (e.g. `https://formspree.io/f/your-id`).
    2. Set `formEndpoint` in `contactConfig.js` to that URL.
    3. Optionally configure success / error emails on the Formspree side as needed.

### Swapping images

- **Main Daris logo**
  - File path used in components: `src/assets/daris-logo.png`
  - To change:
    - Replace `src/assets/daris-logo.png` with your own logo file using the same name and extension, or
    - Update the `img` `src` attributes in:
      - `src/components/layout/Navbar.vue`
      - `src/components/home/HeroSection.vue`

- **Sheikh photo placeholder**
  - Current placeholder: `src/assets/sheikh-placeholder.svg`
  - Used in:
    - `src/views/HomeView.vue`
    - `src/views/AboutView.vue`
  - To replace:
    - Save your preferred photo as (for example) `sheikh-photo.jpg` in `src/assets/`.
    - Update the `img` `src` values in the above views to `@/assets/sheikh-photo.jpg` or `/src/assets/sheikh-photo.jpg`.

### Deployment

This is a static site built with Vite. The `build` script outputs a `dist` folder that you can deploy to any static hosting provider.

#### Netlify

1. Run a production build locally (optional but useful to check):

   ```bash
   npm run build
   ```

2. In Netlify:
   - New Site → Import from Git.
   - Build command: `npm run build`
   - Publish directory: `dist`

3. Netlify will install dependencies, build, and deploy automatically on each push.

#### Vercel

1. Run a production build locally to confirm:

   ```bash
   npm run build
   ```

2. In Vercel:
   - New Project → Import your Git repository.
   - Framework preset: **Vite** (or “Other” and configure manually).
   - Build command: `npm run build`
   - Output directory: `dist`

3. Vercel will handle subsequent deployments on each push.

### Pages and routes

- `/` – Home (hero, trust strip, program previews, about preview, how it works, FAQ, CTA)
- `/about` – About the Sheikh and Daris
- `/programs` – Detailed descriptions for Quran, Arabic, and Fiqh programs
- `/contact` – Contact form, WhatsApp and email details, timezone and response-time notes

### Notes

- This site is intended purely for **marketing and lead generation**:
  - No course portal.
  - No payment processing.
  - No user accounts or backend.
- English support is explicitly provided **through the team**, without naming individual team members.

