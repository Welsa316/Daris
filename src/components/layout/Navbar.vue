<template>
  <header class="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-emerald-900/5">
    <nav class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16" aria-label="Main navigation">
      <RouterLink to="/" class="flex items-center gap-3">
        <img
          src="/src/assets/daris-logo.png"
          alt="Daris logo"
          class="h-9 w-auto"
        />
        <span class="sr-only">Daris – Quran, Arabic, Fiqh guidance</span>
      </RouterLink>

      <button
        class="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-800 hover:bg-emerald-900/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-cream"
        type="button"
        :aria-expanded="isOpen ? 'true' : 'false'"
        aria-controls="primary-navigation"
        @click="isOpen = !isOpen"
      >
        <span class="sr-only">Toggle navigation</span>
        <span v-if="!isOpen" aria-hidden="true">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </span>
        <span v-else aria-hidden="true">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
      </button>

      <div
        id="primary-navigation"
        class="hidden md:flex md:items-center md:gap-8 text-sm font-medium"
      >
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="text-slate-800 hover:text-primary transition-colors"
          active-class="text-primary"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          to="/contact"
          class="ml-4 inline-flex items-center rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-cream shadow-soft-lg hover:bg-emerald-900 transition-colors"
        >
          Contact
        </RouterLink>
      </div>
    </nav>

    <div
      v-if="isOpen"
      class="md:hidden border-t border-emerald-900/5 bg-cream/95 backdrop-blur"
    >
      <div class="max-w-6xl mx-auto px-4 py-3 space-y-1 text-sm font-medium">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block px-2 py-2 rounded-md text-slate-800 hover:bg-emerald-900/5 hover:text-primary"
          active-class="bg-emerald-900/5 text-primary"
          @click="isOpen = false"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          to="/contact"
          class="mt-1 inline-flex items-center justify-center w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-cream shadow-soft-lg hover:bg-emerald-900 transition-colors"
          @click="isOpen = false"
        >
          Contact
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';

const isOpen = ref(false);

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/contact', label: 'Contact' }
];
</script>

