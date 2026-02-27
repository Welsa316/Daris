<template>
  <div>
    <!-- ═══════════════════════════════════════════
         SECTION 1: Editorial Hero
         Dark surface, large serif brand statement,
         no generic banner. Confident and human.
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-32 md:py-44">
      <!-- Subtle radial glow — warm, off-center -->
      <div class="absolute top-1/2 ltr:left-1/3 rtl:right-1/3 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-gold/[0.025] blur-[140px]" aria-hidden="true"></div>
      <!-- Grain -->
      <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
      <!-- Bottom gold hairline -->
      <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" aria-hidden="true"></div>

      <div class="section-wide relative">
        <div class="max-w-3xl">
          <!-- Eyebrow -->
          <p class="text-gold/50 text-[10px] font-semibold tracking-[0.45em] uppercase mb-8 hero-entrance hero-entrance-1">
            {{ $t('about.eyebrow') }}
          </p>

          <!-- Brand statement — large serif, confident -->
          <h1 class="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] mb-8 hero-entrance hero-entrance-2">
            {{ $t('about.title') }}
          </h1>

          <!-- Mission — generous, understated -->
          <p class="text-lg md:text-xl text-cream/40 leading-relaxed max-w-xl hero-entrance hero-entrance-3">
            {{ $t('about.description') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 2: Story + Credentials
         Two-column editorial. Generous whitespace.
         Text left, photo + credentials right.
         ═══════════════════════════════════════════ -->
    <section class="bg-cream py-24 md:py-36">
      <div class="section-wide">
        <div class="grid gap-16 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] items-start">
          <!-- Left: narrative text -->
          <div data-reveal>
            <!-- Thin rule above text -->
            <div class="w-10 h-px bg-gold/40 mb-10" aria-hidden="true"></div>

            <div class="space-y-6 text-base md:text-lg text-slate-600 leading-[1.8]">
              <p>{{ $t('about.text1') }}</p>
              <p>{{ $t('about.text2') }}</p>
            </div>
          </div>

          <!-- Right: photo + credential card -->
          <aside class="space-y-8" data-reveal data-reveal-delay="150">
            <figure class="relative w-full rounded-2xl overflow-hidden shadow-card bg-white">
              <img
                src="/images/sheikh-placeholder.svg"
                :alt="$t('about.photoAlt')"
                class="h-72 w-full object-cover"
              />
              <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 to-transparent text-xs text-cream px-6 py-6">
                {{ $t('about.photoCaption') }}
              </figcaption>
            </figure>

            <div class="rounded-2xl bg-cream-50 border border-cream-200/60 p-7 text-sm text-slate-600">
              <h3 class="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold mb-5">
                {{ $t('about.credentialsTitle') }}
              </h3>
              <ul class="space-y-3.5">
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credTeaching') }} <em class="text-slate-400">{{ $t('about.credTeachingVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credQuran') }} <em class="text-slate-400">{{ $t('about.credQuranVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credFiqh') }} <em class="text-slate-400">{{ $t('about.credFiqhVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credArabic') }} <em class="text-slate-400">{{ $t('about.credArabicVal') }}</em></span>
                </li>
                <li class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                  <span>{{ $t('about.credCerts') }} <em class="text-slate-400">{{ $t('about.credCertsVal') }}</em></span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 3: Values band
         Dark green surface. Two-column editorial.
         Gold accents. Breaks the white rhythm.
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-24 md:py-32">
      <div class="absolute inset-0 grain-texture" aria-hidden="true"></div>
      <!-- Top + bottom gold hairlines -->
      <div class="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" aria-hidden="true"></div>
      <div class="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" aria-hidden="true"></div>

      <div class="section-wide relative">
        <div class="grid gap-12 md:grid-cols-2">
          <div data-reveal>
            <div class="w-8 h-px bg-gold/40 mb-8" aria-hidden="true"></div>
            <h3 class="font-display text-2xl md:text-3xl text-cream leading-[1.2] mb-5">
              {{ $t('about.philosophyTitle') }}
            </h3>
            <p class="text-base text-cream/35 leading-relaxed max-w-md">
              {{ $t('about.philosophyText') }}
            </p>
          </div>

          <div data-reveal data-reveal-delay="150">
            <div class="w-8 h-px bg-gold/40 mb-8" aria-hidden="true"></div>
            <h3 class="font-display text-2xl md:text-3xl text-cream leading-[1.2] mb-5">
              {{ $t('about.langTitle') }}
            </h3>
            <p class="text-base text-cream/35 leading-relaxed max-w-md">
              {{ $t('about.langText') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 4: CTA — cinematic close
         Matches home page BoldCTA register.
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-32 md:py-44">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-gold/[0.02] blur-[150px]" aria-hidden="true"></div>

      <div class="section-wide relative text-center">
        <div class="w-10 h-px bg-gold/30 mx-auto mb-10" data-reveal aria-hidden="true"></div>

        <h2
          class="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] mb-6 max-w-2xl mx-auto text-balance"
          data-reveal="cinematic"
        >
          {{ $t('about.ctaTitle') }}
        </h2>

        <p
          class="text-base text-cream/30 max-w-sm mx-auto mb-14"
          data-reveal
          data-reveal-delay="150"
        >
          {{ $t('about.ctaText') }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center" data-reveal data-reveal-delay="300">
          <CTAButton :asLink="true" :href="whatsAppHref" :external="true" variant="gold">
            {{ $t('about.ctaWhatsApp') }}
          </CTAButton>
          <CTAButton :asLink="true" :href="`mailto:${contactEmail}`" variant="outline">
            <span class="text-cream">{{ $t('about.ctaEmail') }}</span>
          </CTAButton>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useScrollReveal } from '@/composables/useScrollReveal';
import CTAButton from '@/components/common/CTAButton.vue';
import { contactConfig } from '@/config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;

useScrollReveal();
</script>
