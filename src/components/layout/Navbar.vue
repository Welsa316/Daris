<template>
  <header
    class="sticky top-0 z-40 bg-cream/90 backdrop-blur-md border-b border-primary/5 transition-shadow duration-300"
    :class="{ 'shadow-soft': scrolled }"
  >
    <nav
      class="section-container flex items-center justify-between h-16"
      aria-label="Main navigation"
    >
      <RouterLink to="/" class="flex items-center gap-3 group">
        <img
          src="/images/daris-logo.png"
          alt="Daris logo"
          class="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
          width="36"
          height="36"
        />
        <span class="sr-only">Daris – Quran, Arabic & Fiqh guidance</span>
      </RouterLink>

      <button
        class="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-slate-700 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
        type="button"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-controls="primary-navigation"
        @click="isOpen = !isOpen"
      >
        <span class="sr-only">Toggle navigation</span>
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

      <div
        id="primary-navigation"
        class="hidden md:flex md:items-center md:gap-8 text-sm font-medium"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="relative text-slate-700 hover:text-primary transition-colors duration-200 after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-gold after:transition-all after:duration-300 hover:after:w-full"
          active-class="text-primary after:!w-full"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          to="/contact"
          class="ml-2 inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-cream shadow-soft hover:bg-primary-800 hover:shadow-soft-md active:scale-[0.97] transition-all duration-200"
        >
          Contact
        </RouterLink>
      </div>
    </nav>

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
        class="md:hidden border-t border-primary/5 bg-cream/98 backdrop-blur-md"
      >
        <div class="section-container py-4 space-y-1 text-sm font-medium">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="block px-3 py-2.5 rounded-lg text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors duration-200"
            active-class="bg-primary/5 text-primary"
            @click="isOpen = false"
          >
            {{ item.label }}
          </RouterLink>
          <RouterLink
            to="/contact"
            class="mt-2 flex items-center justify-center w-full rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-cream shadow-soft hover:bg-primary-800 transition-colors duration-200"
            @click="isOpen = false"
          >
            Contact
          </RouterLink>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { RouterLink } from 'vue-router';

const isOpen = ref(false);
const scrolled = ref(false);

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/contact', label: 'Contact' }
];

const handleScroll = () => {
  scrolled.value = window.scrollY > 10;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>
