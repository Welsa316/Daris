<template>
  <header
    class="fixed top-0 inset-x-0 z-40 transition-all duration-500"
    :class="scrolled ? 'bg-white/95 backdrop-blur-md shadow-card' : 'bg-transparent'"
  >
    <nav
      class="section-container flex items-center justify-between h-20"
      aria-label="Main navigation"
    >
      <!-- Logo — fades in on scroll -->
      <RouterLink
        to="/"
        class="flex items-center gap-3 group transition-all duration-500"
        :class="scrolled ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'"
      >
        <div class="h-16 md:h-20 flex items-center overflow-visible">
          <img
            src="/images/daris-icon.png"
            alt="Daris logo"
            class="h-10 sm:h-12 w-auto origin-left transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <span class="sr-only">{{ $t('nav.srBrand') }}</span>
      </RouterLink>

      <!-- Spacer when logo is hidden — keeps nav items positioned correctly -->
      <div v-if="!scrolled" class="w-12" aria-hidden="true"></div>

      <!-- Mobile hamburger -->
      <button
        class="md:hidden inline-flex items-center justify-center rounded-lg p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        :class="scrolled
          ? 'text-slate-700 hover:bg-primary/5 focus-visible:ring-primary focus-visible:ring-offset-white'
          : 'text-cream/80 hover:bg-white/10 focus-visible:ring-gold focus-visible:ring-offset-primary-950'"
        type="button"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-controls="primary-navigation"
        @click="isOpen = !isOpen"
      >
        <span class="sr-only">{{ $t('nav.toggleNav') }}</span>
        <svg
          class="h-6 w-6 transition-transform duration-200"
          :class="{ 'rotate-90': isOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            v-if="!isOpen"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.75"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            v-else
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.75"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      <!-- Desktop nav -->
      <div
        id="primary-navigation"
        class="hidden md:flex md:items-center md:gap-8 text-sm font-medium"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative transition-colors duration-300 after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          :class="scrolled
            ? 'text-primary/70 hover:text-primary'
            : 'text-cream/70 hover:text-cream'"
          :active-class="scrolled ? 'text-primary after:!w-full' : 'text-cream after:!w-full'"
        >
          {{ $t(item.labelKey) }}
        </RouterLink>

        <LanguageSwitcher :dark="!scrolled" />

        <RouterLink
          to="/contact"
          class="inline-flex items-center rounded-full px-6 py-2.5 text-sm font-semibold active:scale-[0.97] transition-all duration-300 ltr:ml-2 rtl:mr-2"
          :class="scrolled
            ? 'bg-primary text-cream shadow-soft hover:bg-primary-800 hover:shadow-soft-md'
            : 'bg-gold text-primary-950 shadow-lg hover:bg-gold-300 hover:shadow-xl'"
        >
          {{ $t('nav.contact') }}
        </RouterLink>
      </div>
    </nav>

    <!-- Mobile dropdown -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        class="md:hidden border-t backdrop-blur-md"
        :class="scrolled ? 'border-primary/5 bg-white/98' : 'border-white/10 bg-primary-950/95'"
      >
        <div class="section-container py-4 space-y-1 text-sm font-medium">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="block px-3 py-2.5 rounded-lg transition-colors duration-200"
            :class="scrolled
              ? 'text-slate-700 hover:bg-primary/5 hover:text-primary'
              : 'text-cream/80 hover:bg-white/10 hover:text-cream'"
            :active-class="scrolled ? 'bg-primary/5 text-primary' : 'bg-white/10 text-cream'"
            @click="isOpen = false"
          >
            {{ $t(item.labelKey) }}
          </RouterLink>
          <div class="px-3 py-2.5">
            <LanguageSwitcher :dark="!scrolled" />
          </div>
          <RouterLink
            to="/contact"
            class="mt-2 flex items-center justify-center w-full rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200"
            :class="scrolled
              ? 'bg-primary text-cream shadow-soft hover:bg-primary-800'
              : 'bg-gold text-primary-950 hover:bg-gold-300'"
            @click="isOpen = false"
          >
            {{ $t('nav.contact') }}
          </RouterLink>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';
import LanguageSwitcher from '@/components/common/LanguageSwitcher.vue';

const isOpen = ref(false);
const scrolled = ref(false);

const navItems = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/about', labelKey: 'nav.about' },
  { to: '/programs', labelKey: 'nav.programs' },
];

const handleScroll = () => {
  scrolled.value = window.scrollY > 60;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
