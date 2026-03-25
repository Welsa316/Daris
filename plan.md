# Homepage Redesign Plan

## Change 1: Hero Section — Full Redesign
**Files:** `ImmersiveHero.vue`, `en.json`, `ar.json`

### Layout Change
- Replace the current **split-screen grid** (text left, mushaf image right) with a **full-width background image** layout
- Use `/images/HeroBanner.jpeg` (children studying in mosque) as `object-cover` filling the entire hero section
- Dark gradient overlay for text readability (heavier on the text side, lighter elsewhere)
- Text centered or left-aligned on top of the image
- Keep LanternsOverlay, gold spine, ground line, and entrance animations
- Remove the separate right image column entirely

### Text Changes
- **Keep**: `hero.eyebrow` (DARIS) and `hero.motto` (العلمُ منهجًا وتدرُّجًا)
- **Replace** `titleHighlight` + `titleRest` + `subtitle` with a single paragraph:
  - AR: `"منصة علمية تقدم منهجا تربويا متدرجا في تدريس القرآن الكريم، واللغة العربية، والعلوم الشرعية، وفق المنهجية المعتمدة في الأزهر الشريف، وتستهدف الرجال والنساء والأطفال، باللغتين: العربية، والإنجليزية."`
  - EN: `"An educational platform offering a structured, progressive curriculum in Quran, Arabic language, and Islamic studies, following the methodology of Al-Azhar Al-Sharif, for men, women, and children, in Arabic and English."`
- Use a single i18n key `hero.description` for this new paragraph (replacing titleHighlight/titleRest/subtitle)

### Aspect Ratio Strategy
- `object-cover` + `object-center` so the children & light rays stay centered
- Portrait source will crop sides on wide desktop — the dark overlay and gradient edges will make this seamless

---

## Change 2: Quran Section — Body Text Update
**Files:** `en.json`, `ar.json`

- Update `home.splitQuranBody`:
  - AR: `"تصحيح التلاوة، وتَعَلُّمْ أحكام التجويد، ومعرفة تفسير الآيات"`
  - EN: `"Recitation correction, learning tajwid rules, and understanding tafsir of the verses."`
- Title ("Build a lasting relationship with the Quran") stays unchanged

---

## Change 3: Arabic Card — SVG Background + Quote Prominence
**Files:** `ImmersiveArabic.vue`

### Background Change
- Remove the `arabic-calligraphy.png` image
- Replace with warm parchment gradient background + large decorative SVG text of "بِلِسَانٍ عَرَبِيٍّ مُبِينٍ"
- Verse rendered as giant, low-opacity decorative Arabic text (like a watermark) using CSS
- Warm gold/parchment color scheme maintained

### Quote Prominence
- Make the Tha'alibi quote (`splitArabicQuote`) the **primary/largest text** on the card
- Move it above the body text
- Style it larger (text-2xl or text-3xl) instead of the current small italic blockquote
- The body description (`splitArabicBody`) moves below the quote in a smaller/lighter style

---

## Change 4: Fiqh Card — Fix Aspect Ratio
**Files:** `ImmersiveFiqh.vue`

- The text panel currently overlays too much of the scholars painting on some screens
- Reduce the panel height by making it more compact
- Possible approaches:
  - Reduce padding (`py-8 md:py-12` → `py-6 md:py-8`)
  - Make the gradient overlay lighter so the painting shows through more
  - Use `items-end` instead of `items-start` on the section to push the panel to the bottom, allowing the painting to breathe at top
  - Reduce the `from-black/80` top gradient to let more image show

---

## Change 5: Countries Section
**Files:** `AuthorityStats.vue` or new section, `en.json`, `ar.json`

- Add a new section after the stats card listing the countries
- Countries: مصر، بولندا، أوزبكستان، باكستان، السعودية، قطر، هولندا، إنجلترا، أمريكا
- EN: Egypt, Poland, Uzbekistan, Pakistan, Saudi Arabia, Qatar, Netherlands, England, USA
- Subtle, clean design — perhaps a small banner or inline list with a label like "Our students come from" / "طلابنا من"
- Matches the cream background of the stats section

---

## Change 6: i18n Updates Summary
Both `en.json` and `ar.json`:
- `hero.description` (new key replacing titleHighlight/titleRest/subtitle)
- `home.splitQuranBody` (updated)
- `home.countriesLabel` + `home.countriesList` (new keys)
- Keep old keys for backward compatibility or remove if unused
