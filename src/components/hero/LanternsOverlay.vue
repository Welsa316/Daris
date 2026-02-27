<template>
  <!-- Ramadan fanoos lanterns — top-left corner of hero.
       Classic Egyptian fanoos shape: hexagonal body with flat sides,
       dome cap, crescent on top, gothic arch windows, pointed finial.
       Static (no sway). Ornamental background jewelry. -->
  <div
    class="absolute inset-0 z-[2] pointer-events-none overflow-hidden hidden md:block"
    aria-hidden="true"
  >
    <!-- Fanoos A — higher, smaller -->
    <div class="absolute top-0 ltr:left-[5%] rtl:right-[5%] lg:ltr:left-[7%] lg:rtl:right-[7%]">
      <svg
        width="52"
        height="168"
        viewBox="0 0 52 168"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="opacity-[0.38] drop-shadow-[0_4px_16px_rgba(200,169,81,0.2)]"
      >
        <defs>
          <linearGradient id="fgA" x1="26" y1="52" x2="26" y2="140" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#C8A951" stop-opacity="0.3"/>
            <stop offset="1" stop-color="#C8A951" stop-opacity="0.06"/>
          </linearGradient>
        </defs>
        <!-- Chain -->
        <line x1="26" y1="0" x2="26" y2="28" stroke="#C8A951" stroke-width="0.8" stroke-dasharray="2 3"/>
        <!-- Ring at top -->
        <circle cx="26" cy="4" r="3" fill="none" stroke="#C8A951" stroke-width="0.7" stroke-opacity="0.5"/>
        <!-- Dome cap -->
        <path
          d="M18 52 Q18 38, 26 32 Q34 38, 34 52"
          fill="#C8A951" fill-opacity="0.15"
          stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.5"
        />
        <!-- Crescent on dome -->
        <path
          d="M25 37 Q27 35, 28 37 Q27 36, 25 37"
          fill="#C8A951" fill-opacity="0.5"
          stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.5"
        />
        <!-- Small star next to crescent -->
        <polygon points="30,36 30.5,37.2 31.8,37.2 30.8,38 31.2,39.2 30,38.4 28.8,39.2 29.2,38 28.2,37.2 29.5,37.2" fill="#C8A951" fill-opacity="0.4"/>
        <!-- Cap band — flat horizontal bar -->
        <rect x="15" y="52" width="22" height="4" rx="0.5" fill="#C8A951" fill-opacity="0.22" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.4"/>
        <!-- Body — hexagonal front face (flat-sided, not bell-curved) -->
        <path
          d="M15 56 L11 62 L11 120 L15 128 L37 128 L41 120 L41 62 L37 56 Z"
          fill="url(#fgA)"
          stroke="#C8A951"
          stroke-width="0.6"
          stroke-opacity="0.45"
        />
        <!-- Side facets to imply hexagonal 3D form -->
        <path d="M15 56 L18 58 L18 126 L15 128" fill="none" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.2"/>
        <path d="M37 56 L34 58 L34 126 L37 128" fill="none" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.2"/>
        <!-- Gothic arch window — front face, upper -->
        <path
          d="M20 72 L20 96 Q20 100, 26 68 Q32 100, 32 96 L32 72 Q32 64, 26 60 Q20 64, 20 72 Z"
          fill="none"
          stroke="#C8A951"
          stroke-width="0.5"
          stroke-opacity="0.35"
        />
        <!-- Simplified arch — cleaner pointed arch -->
        <path
          d="M21 100 L21 78 Q21 66, 26 62 Q31 66, 31 78 L31 100"
          fill="none"
          stroke="#C8A951"
          stroke-width="0.45"
          stroke-opacity="0.35"
        />
        <!-- Horizontal bands -->
        <line x1="13" y1="72" x2="39" y2="72" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.2"/>
        <line x1="12" y1="100" x2="40" y2="100" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.2"/>
        <!-- Lower panel — small diamond -->
        <polygon points="26,104 30,112 26,120 22,112" fill="none" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.25"/>
        <!-- Base band -->
        <rect x="14" y="128" width="24" height="4" rx="0.5" fill="#C8A951" fill-opacity="0.18" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.35"/>
        <!-- Bottom finial — tapered point -->
        <path d="M22 132 L26 148 L30 132" fill="none" stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.35"/>
        <circle cx="26" cy="150" r="1.8" fill="#C8A951" fill-opacity="0.25"/>
      </svg>
    </div>

    <!-- Fanoos B — lower, slightly larger -->
    <div class="absolute top-0 ltr:left-[13%] rtl:right-[13%] lg:ltr:left-[15%] lg:rtl:right-[15%]">
      <svg
        width="62"
        height="210"
        viewBox="0 0 62 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="opacity-[0.30] drop-shadow-[0_6px_20px_rgba(200,169,81,0.16)]"
      >
        <defs>
          <linearGradient id="fgB" x1="31" y1="62" x2="31" y2="168" gradientUnits="userSpaceOnUse">
            <stop offset="0" stop-color="#C8A951" stop-opacity="0.25"/>
            <stop offset="1" stop-color="#C8A951" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <!-- Chain -->
        <line x1="31" y1="0" x2="31" y2="36" stroke="#C8A951" stroke-width="0.8" stroke-dasharray="2 3"/>
        <!-- Ring -->
        <circle cx="31" cy="5" r="4" fill="none" stroke="#C8A951" stroke-width="0.7" stroke-opacity="0.45"/>
        <!-- Dome cap — taller -->
        <path
          d="M21 62 Q21 44, 31 36 Q41 44, 41 62"
          fill="#C8A951" fill-opacity="0.12"
          stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.45"
        />
        <!-- Crescent on dome -->
        <path
          d="M29.5 44 Q32 41, 33.5 44 Q32 42.5, 29.5 44"
          fill="#C8A951" fill-opacity="0.45"
          stroke="#C8A951" stroke-width="0.4" stroke-opacity="0.45"
        />
        <!-- Star -->
        <polygon points="36,43 36.6,44.5 38.2,44.5 37,45.5 37.4,47 36,46 34.6,47 35,45.5 33.8,44.5 35.4,44.5" fill="#C8A951" fill-opacity="0.35"/>
        <!-- Cap band -->
        <rect x="17" y="62" width="28" height="5" rx="0.5" fill="#C8A951" fill-opacity="0.2" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.38"/>
        <!-- Body — hexagonal front face -->
        <path
          d="M17 67 L12 74 L12 148 L17 156 L45 156 L50 148 L50 74 L45 67 Z"
          fill="url(#fgB)"
          stroke="#C8A951"
          stroke-width="0.6"
          stroke-opacity="0.4"
        />
        <!-- Side facets -->
        <path d="M17 67 L21 70 L21 153 L17 156" fill="none" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.18"/>
        <path d="M45 67 L41 70 L41 153 L45 156" fill="none" stroke="#C8A951" stroke-width="0.3" stroke-opacity="0.18"/>
        <!-- Gothic arch window — taller -->
        <path
          d="M24 124 L24 92 Q24 78, 31 72 Q38 78, 38 92 L38 124"
          fill="none"
          stroke="#C8A951"
          stroke-width="0.5"
          stroke-opacity="0.32"
        />
        <!-- Inner arch -->
        <path
          d="M27 120 L27 96 Q27 84, 31 80 Q35 84, 35 96 L35 120"
          fill="none"
          stroke="#C8A951"
          stroke-width="0.35"
          stroke-opacity="0.2"
        />
        <!-- Horizontal bands -->
        <line x1="14" y1="86" x2="48" y2="86" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.18"/>
        <line x1="13" y1="124" x2="49" y2="124" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.18"/>
        <!-- Lower panel — diamond -->
        <polygon points="31,128 36,140 31,150 26,140" fill="none" stroke="#C8A951" stroke-width="0.35" stroke-opacity="0.22"/>
        <!-- Base band -->
        <rect x="16" y="156" width="30" height="5" rx="0.5" fill="#C8A951" fill-opacity="0.16" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.3"/>
        <!-- Bottom finial -->
        <path d="M26 161 L31 180 L36 161" fill="none" stroke="#C8A951" stroke-width="0.6" stroke-opacity="0.3"/>
        <circle cx="31" cy="182" r="2" fill="#C8A951" fill-opacity="0.2"/>
        <line x1="31" y1="184" x2="31" y2="190" stroke="#C8A951" stroke-width="0.5" stroke-opacity="0.15"/>
      </svg>
    </div>
  </div>
</template>
