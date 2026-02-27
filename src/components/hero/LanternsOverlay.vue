<template>
  <!-- Ramadan fanoos lanterns — top-left corner of hero.
       Two traditional fanoos shapes at different heights/sizes.
       Bell/onion silhouette with geometric glass cutouts.
       Brighter than before, soft glow, gentle sway animation.
       Purely decorative, pointer-events-none, behind hero text. -->
  <div
    class="absolute inset-0 z-[2] pointer-events-none overflow-hidden hidden md:block"
    aria-hidden="true"
  >
    <!-- Fanoos A — higher, smaller -->
    <div class="absolute top-0 ltr:left-[5%] rtl:right-[5%] lg:ltr:left-[7%] lg:rtl:right-[7%] lantern-sway-a">
      <svg
        width="48"
        height="170"
        viewBox="0 0 48 170"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="opacity-[0.32] drop-shadow-[0_6px_20px_rgba(200,169,81,0.2)]"
      >
        <defs>
          <linearGradient id="fanGlA" x1="24" y1="40" x2="24" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#C8A951" stop-opacity="0.35"/>
            <stop offset="0.5" stop-color="#C8A951" stop-opacity="0.15"/>
            <stop offset="1" stop-color="#C8A951" stop-opacity="0.05"/>
          </linearGradient>
          <radialGradient id="fanInnerA" cx="24" cy="80" r="20" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#F5F1E8" stop-opacity="0.08"/>
            <stop offset="1" stop-color="#F5F1E8" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Chain -->
        <line x1="24" y1="0" x2="24" y2="32" stroke="#C8A951" stroke-width="0.8" stroke-dasharray="2 3"/>
        <!-- Ring -->
        <circle cx="24" cy="5" r="3.5" fill="none" stroke="#C8A951" stroke-width="0.7" stroke-opacity="0.5"/>
        <!-- Top dome / onion cap -->
        <path
          d="M20 32 Q20 26, 24 24 Q28 26, 28 32"
          fill="#C8A951" fill-opacity="0.2"
          stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.5"
        />
        <!-- Flat cap band -->
        <rect x="17" y="32" width="14" height="4" rx="1" fill="#C8A951" fill-opacity="0.25" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.4"/>
        <!-- Body — classic fanoos bell shape: wide at top-mid, tapers to base -->
        <path
          d="M17 36 C13 50, 10 65, 12 85 C13 100, 16 110, 19 118 L29 118 C32 110, 35 100, 36 85 C38 65, 35 50, 31 36 Z"
          fill="url(#fanGlA)"
          stroke="#C8A951"
          stroke-width="0.6"
          stroke-opacity="0.45"
        />
        <!-- Inner glow -->
        <ellipse cx="24" cy="78" rx="10" ry="22" fill="url(#fanInnerA)"/>
        <!-- Glass panel divider lines — vertical -->
        <line x1="24" y1="40" x2="24" y2="115" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.3"/>
        <line x1="17" y1="55" x2="17" y2="105" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.15"/>
        <line x1="31" y1="55" x2="31" y2="105" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.15"/>
        <!-- Glass panel divider lines — horizontal bands -->
        <line x1="14" y1="58" x2="34" y2="58" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.2"/>
        <line x1="12" y1="78" x2="36" y2="78" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.2"/>
        <line x1="14" y1="98" x2="34" y2="98" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.2"/>
        <!-- Star cutout — top panel -->
        <polygon points="24,46 26,52 32,52 27,56 29,62 24,58 19,62 21,56 16,52 22,52" fill="none" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.3"/>
        <!-- Diamond cutout — middle panel -->
        <polygon points="24,64 29,78 24,92 19,78" fill="none" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.25"/>
        <!-- Small diamond — bottom panel -->
        <polygon points="24,100 27,108 24,115 21,108" fill="none" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.2"/>
        <!-- Base band -->
        <rect x="18" y="118" width="12" height="3" rx="0.5" fill="#C8A951" fill-opacity="0.2" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.35"/>
        <!-- Bottom finial — pointed drop -->
        <path d="M22 121 L24 132 L26 121" fill="none" stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.35"/>
        <circle cx="24" cy="134" r="1.5" fill="#C8A951" fill-opacity="0.25"/>
      </svg>
    </div>

    <!-- Fanoos B — lower, larger -->
    <div class="absolute top-0 ltr:left-[13%] rtl:right-[13%] lg:ltr:left-[15%] lg:rtl:right-[15%] lantern-sway-b">
      <svg
        width="58"
        height="210"
        viewBox="0 0 58 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="opacity-[0.26] drop-shadow-[0_8px_24px_rgba(200,169,81,0.18)]"
      >
        <defs>
          <linearGradient id="fanGlB" x1="29" y1="52" x2="29" y2="170" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#C8A951" stop-opacity="0.3"/>
            <stop offset="0.5" stop-color="#C8A951" stop-opacity="0.12"/>
            <stop offset="1" stop-color="#C8A951" stop-opacity="0.04"/>
          </linearGradient>
          <radialGradient id="fanInnerB" cx="29" cy="100" r="24" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#F5F1E8" stop-opacity="0.07"/>
            <stop offset="1" stop-color="#F5F1E8" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <!-- Chain -->
        <line x1="29" y1="0" x2="29" y2="42" stroke="#C8A951" stroke-width="0.8" stroke-dasharray="2 3"/>
        <!-- Ring -->
        <circle cx="29" cy="5" r="4" fill="none" stroke="#C8A951" stroke-width="0.7" stroke-opacity="0.45"/>
        <!-- Crescent accent on ring -->
        <path d="M27 3 Q29 1, 31 3 Q29 2.5, 27 3" fill="#C8A951" fill-opacity="0.3"/>
        <!-- Top dome — taller onion shape -->
        <path
          d="M24 42 Q22 34, 29 30 Q36 34, 34 42"
          fill="#C8A951" fill-opacity="0.18"
          stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.45"
        />
        <!-- Cap band -->
        <rect x="20" y="42" width="18" height="5" rx="1" fill="#C8A951" fill-opacity="0.22" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.4"/>
        <!-- Body — wider bell fanoos -->
        <path
          d="M20 47 C15 62, 11 82, 13 105 C14 125, 18 140, 22 150 L36 150 C40 140, 44 125, 45 105 C47 82, 43 62, 38 47 Z"
          fill="url(#fanGlB)"
          stroke="#C8A951"
          stroke-width="0.6"
          stroke-opacity="0.4"
        />
        <!-- Inner glow -->
        <ellipse cx="29" cy="100" rx="13" ry="28" fill="url(#fanInnerB)"/>
        <!-- Glass panel dividers — vertical -->
        <line x1="29" y1="52" x2="29" y2="147" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.25"/>
        <line x1="20" y1="65" x2="20" y2="135" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.12"/>
        <line x1="38" y1="65" x2="38" y2="135" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.12"/>
        <!-- Glass panel dividers — horizontal -->
        <line x1="15" y1="70" x2="43" y2="70" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.18"/>
        <line x1="13" y1="95" x2="45" y2="95" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.18"/>
        <line x1="15" y1="120" x2="43" y2="120" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.18"/>
        <!-- Star cutout — top panel -->
        <polygon points="29,56 31.5,63 38,63 33,67 35,74 29,70 23,74 25,67 20,63 26.5,63" fill="none" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.28"/>
        <!-- Large diamond — middle panel -->
        <polygon points="29,78 35,97 29,116 23,97" fill="none" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.22"/>
        <!-- Inner diamond -->
        <polygon points="29,86 32,97 29,108 26,97" fill="none" stroke="#C8A951" stroke-width="0.25" stroke-opacity="0.15"/>
        <!-- Small diamond — bottom panel -->
        <polygon points="29,123 33,134 29,144 25,134" fill="none" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.18"/>
        <!-- Base band -->
        <rect x="21" y="150" width="16" height="4" rx="0.5" fill="#C8A951" fill-opacity="0.18" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.3"/>
        <!-- Bottom finial -->
        <path d="M26 154 L29 168 L32 154" fill="none" stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.3"/>
        <circle cx="29" cy="170" r="2" fill="#C8A951" fill-opacity="0.22"/>
        <line x1="29" y1="172" x2="29" y2="177" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.15"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* Fanoos sway — gentle pendulum, transform-origin at chain top */
.lantern-sway-a {
  transform-origin: top center;
  animation: lantern-sway 9s ease-in-out infinite alternate;
}

.lantern-sway-b {
  transform-origin: top center;
  animation: lantern-sway 11s ease-in-out infinite alternate-reverse;
  animation-delay: -3s;
}

@keyframes lantern-sway {
  0%   { transform: rotate(-2deg); }
  100% { transform: rotate(2deg); }
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  .lantern-sway-a,
  .lantern-sway-b {
    animation: none;
  }
}
</style>
