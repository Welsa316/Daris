<template>
  <footer class="border-t border-primary/5 bg-cream-200/50 mt-16">
    <div class="section-container py-10 md:py-14">
      <div class="grid gap-10 md:grid-cols-4">
        <!-- Brand -->
        <div class="md:col-span-2 space-y-4">
          <div class="flex items-center gap-3">
            <img
              src="/src/assets/daris-logo.png"
              alt="Daris logo"
              class="h-10 w-auto"
              width="483"
              height="517"
            />
            <div>
              <p class="font-semibold text-slate-900 text-base">Daris</p>
              <p class="text-xs text-slate-500">دارس</p>
            </div>
          </div>
          <p class="text-sm text-slate-600 max-w-sm leading-relaxed">
            Quran, Arabic & Fiqh — online worldwide.
          </p>
        </div>

        <!-- Quick links -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-gold mb-4">
            Quick links
          </h3>
          <ul class="space-y-2.5 text-sm">
            <li v-for="link in quickLinks" :key="link.to">
              <RouterLink
                :to="link.to"
                class="text-slate-600 hover:text-primary transition-colors duration-200"
              >
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </div>

        <!-- Contact -->
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-gold mb-4">
            Contact
          </h3>
          <p class="text-sm text-slate-600 mb-3 leading-relaxed">
            English support available.
          </p>
          <div class="space-y-2">
            <a
              :href="whatsAppHref"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors duration-200"
            >
              <span
                class="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <svg class="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </span>
              <span>WhatsApp</span>
            </a>
            <a
              :href="`mailto:${contactEmail}`"
              class="flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors duration-200"
            >
              <span
                class="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <svg class="h-3.5 w-3.5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0l-9.75 6.5-9.75-6.5" />
                </svg>
              </span>
              <span>{{ contactEmail }}</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-10 pt-6 border-t border-primary/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>&copy; {{ new Date().getFullYear() }} Daris. All rights reserved.</p>
        <p class="text-slate-400">
          Quran &middot; Arabic &middot; Fiqh &mdash; Online worldwide
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/programs', label: 'Programs' },
  { to: '/contact', label: 'Contact' }
];
</script>
