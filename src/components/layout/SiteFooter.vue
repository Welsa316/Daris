<template>
  <footer class="border-t border-emerald-900/5 bg-cream/95 mt-12">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 grid gap-8 md:grid-cols-4 text-sm">
      <div class="md:col-span-2 space-y-3">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            دارس
          </span>
          <p class="font-semibold text-slate-900">Daris</p>
        </div>
        <p class="text-slate-600 max-w-md">
          Calm, structured Quran, Arabic, and Fiqh guidance for students around the world.
        </p>
      </div>

      <div>
        <h3 class="font-semibold text-slate-900 mb-3">Quick links</h3>
        <ul class="space-y-2">
          <li><RouterLink class="hover:text-primary" to="/">Home</RouterLink></li>
          <li><RouterLink class="hover:text-primary" to="/about">About</RouterLink></li>
          <li><RouterLink class="hover:text-primary" to="/programs">Programs</RouterLink></li>
          <li><RouterLink class="hover:text-primary" to="/contact">Contact</RouterLink></li>
        </ul>
      </div>

      <div>
        <h3 class="font-semibold text-slate-900 mb-3">Contact</h3>
        <p class="text-slate-600 mb-2">
          WhatsApp and email support available. English support is provided through our team.
        </p>
        <a
          :href="whatsAppHref"
          class="block text-primary hover:text-emerald-900"
        >
          WhatsApp
        </a>
        <a
          :href="`mailto:${contactEmail}`"
          class="block text-primary hover:text-emerald-900"
        >
          Email
        </a>
      </div>
    </div>
    <div class="border-t border-emerald-900/5 py-4 text-xs text-center text-slate-500">
      <p>
        © {{ new Date().getFullYear() }} Daris. All rights reserved.
      </p>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { contactConfig } from '../../config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>

