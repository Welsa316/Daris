# CLAUDE.md — Project Memory

## Code Quality Rules

**Always run these skills when writing or modifying code:**

1. **`/simplify`** — Run after making code changes to review for reuse, quality, and efficiency. Fix any issues found.
2. **`/audit`** — Run after making code changes to audit for correctness, security, and best practices.
3. **`/clarify`** — Run after making code changes to review UX copy for clarity and consistency.
4. **Code Refinery & Review** — Call code refinery and review skills to check your work after writing code. This ensures code is clean, follows best practices, and avoids duplication.

These are mandatory steps, not optional. Never skip them when writing code.

## Frontend Design Rules

**Always use these skills for ANY frontend/design work:**

1. **`/ui-ux-pro-max`** — Use for all UI/UX design decisions, styling, layout, typography, and visual enhancements.
2. **`/frontend-design`** — Use for building distinctive, production-grade frontend interfaces that avoid generic AI aesthetics.

These skills must be invoked automatically whenever creating or modifying frontend code — do not wait for the user to ask. They work together: ui-ux-pro-max for design intelligence, frontend-design for implementation quality.

## Project Overview

- **Framework:** Vue 3 (Composition API) + Vite + Tailwind CSS
- **i18n:** vue-i18n with Arabic (RTL) and English (LTR) support
- **Fonts:** Cinzel Decorative (ornate/display), Playfair Display (headlines), Noto Sans Arabic (Arabic fallback), Inter (body)
- **Color System:** Primary green (#1F4D3A), Gold (#C8A951), Cream (#F5F1E8)
- **Design Language:** Luxury Islamic editorial — layered gold details, sacred geometry, reverent depth

## Arabic Typography Notes

- Always use `!leading-[...]` (important modifier) to override Tailwind's `text-Nxl` default line-height for Arabic text
- Arabic descenders and dots (ya ي, etc.) need extra `pb-6` to `pb-10` depending on font size
- `font-ornate` includes Noto Sans Arabic as fallback for Arabic glyphs
- Gradient text (`background-clip: text`) should end at 80% so gold covers Arabic descenders
