<template>
  <!-- Ornamental hanging lanterns — top-left corner of hero.
       Two geometric lanterns at different heights / sizes.
       Low opacity, soft glow, gentle sway animation.
       Purely decorative, pointer-events-none, behind hero text. -->
  <div
    class="absolute inset-0 z-[2] pointer-events-none overflow-hidden hidden md:block"
    aria-hidden="true"
  >
    <!-- Lantern A — higher, smaller -->
    <div class="absolute top-0 ltr:left-[6%] rtl:right-[6%] lg:ltr:left-[8%] lg:rtl:right-[8%] lantern-sway-a">
      <svg
        width="36"
        height="140"
        viewBox="0 0 36 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="opacity-[0.22] drop-shadow-[0_4px_12px_rgba(200,169,81,0.15)]"
      >
        <defs>
          <linearGradient id="lanternGlowA" x1="18" y1="50" x2="18" y2="120" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#C8A951" stop-opacity="0.3"/>
            <stop offset="1" stop-color="#C8A951" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <!-- Chain -->
        <line x1="18" y1="0" x2="18" y2="48" stroke="#C8A951" stroke-width="0.75" stroke-dasharray="2 3"/>
        <!-- Top cap -->
        <path d="M12 48 L24 48 L26 53 L10 53 Z" fill="#C8A951" fill-opacity="0.35"/>
        <!-- Body — octagonal lantern shape -->
        <path
          d="M10 53 L8 62 L8 95 L10 105 L26 105 L28 95 L28 62 L26 53 Z"
          fill="url(#lanternGlowA)"
          stroke="#C8A951"
          stroke-width="0.6"
          stroke-opacity="0.5"
        />
        <!-- Geometric cutouts (mashrabiya-inspired) -->
        <line x1="18" y1="58" x2="18" y2="100" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.3"/>
        <line x1="11" y1="72" x2="25" y2="72" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.25"/>
        <line x1="11" y1="85" x2="25" y2="85" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.25"/>
        <!-- Diamond cutout centre -->
        <polygon points="18,65 22,72 18,79 14,72" fill="none" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.35"/>
        <polygon points="18,80 22,87 18,94 14,87" fill="none" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.3"/>
        <!-- Bottom finial -->
        <path d="M14 105 L18 115 L22 105" fill="none" stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.4"/>
        <circle cx="18" cy="117" r="1.5" fill="#C8A951" fill-opacity="0.3"/>
      </svg>
    </div>

    <!-- Lantern B — lower, slightly larger -->
    <div class="absolute top-0 ltr:left-[12%] rtl:right-[12%] lg:ltr:left-[14%] lg:rtl:right-[14%] lantern-sway-b">
      <svg
        width="44"
        height="172"
        viewBox="0 0 44 172"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="opacity-[0.18] drop-shadow-[0_6px_18px_rgba(200,169,81,0.12)]"
      >
        <defs>
          <linearGradient id="lanternGlowB" x1="22" y1="60" x2="22" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#C8A951" stop-opacity="0.25"/>
            <stop offset="1" stop-color="#C8A951" stop-opacity="0.04"/>
          </linearGradient>
        </defs>
        <!-- Chain -->
        <line x1="22" y1="0" x2="22" y2="58" stroke="#C8A951" stroke-width="0.75" stroke-dasharray="2 3"/>
        <!-- Hook ring -->
        <circle cx="22" cy="4" r="3" fill="none" stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.35"/>
        <!-- Top cap — wider -->
        <path d="M14 58 L30 58 L33 64 L11 64 Z" fill="#C8A951" fill-opacity="0.3"/>
        <!-- Body — taller octagonal form -->
        <path
          d="M11 64 L9 76 L9 120 L11 132 L33 132 L35 120 L35 76 L33 64 Z"
          fill="url(#lanternGlowB)"
          stroke="#C8A951"
          stroke-width="0.6"
          stroke-opacity="0.45"
        />
        <!-- Geometric cutouts -->
        <line x1="22" y1="70" x2="22" y2="126" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.25"/>
        <line x1="13" y1="84" x2="31" y2="84" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.2"/>
        <line x1="13" y1="98" x2="31" y2="98" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.2"/>
        <line x1="13" y1="112" x2="31" y2="112" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.2"/>
        <!-- Diamond cutouts — three stacked -->
        <polygon points="22,72 27,82 22,92 17,82" fill="none" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.3"/>
        <polygon points="22,92 27,102 22,112 17,102" fill="none" stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.25"/>
        <polygon points="22,112 27,120 22,128 17,120" fill="none" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.2"/>
        <!-- Bottom finial -->
        <path d="M16 132 L22 146 L28 132" fill="none" stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.35"/>
        <circle cx="22" cy="148" r="2" fill="#C8A951" fill-opacity="0.25"/>
        <line x1="22" y1="150" x2="22" y2="156" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.2"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* Lantern sway — gentle pendulum, transform-origin at chain top */
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
