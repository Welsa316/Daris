<template>
  <div>
    <!-- ═══════════════════════════════════════════
         SECTION 1: Editorial Hero
         Dark surface, large serif brand statement.
         ═══════════════════════════════════════════ -->
    <section class="relative overflow-hidden bg-primary-950 py-32 md:py-44">
      <!-- Subtle radial glow. warm, off-center -->
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

          <!-- Brand statement. large serif -->
          <h1 class="font-display text-4xl sm:text-5xl md:text-6xl text-cream leading-[1.08] mb-8 hero-entrance hero-entrance-2 text-balance">
            {{ $t('about.title') }}
          </h1>

          <!-- Mission. generous, understated -->
          <p class="text-lg md:text-xl text-cream/40 leading-relaxed max-w-xl hero-entrance hero-entrance-3 text-pretty">
            {{ $t('about.description') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 2: Narrative + Methodology card
         Five-paragraph org story, left column. The
         "Methodology & tradition" card (right) is
         organisation-level. no personal credentials.
         ═══════════════════════════════════════════ -->
    <section class="bg-cream py-24 md:py-36">
      <div class="section-wide">
        <div class="grid gap-16 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] items-start">
          <!-- Left: narrative text -->
          <div data-reveal>
            <!-- Thin rule above text -->
            <div class="w-10 h-px bg-gold/40 mb-10" aria-hidden="true"></div>

            <div class="space-y-6 text-base md:text-lg text-slate-600 leading-[1.8] text-pretty">
              <p>{{ $t('about.story1') }}</p>
              <p>{{ $t('about.story2') }}</p>
              <p>{{ $t('about.story3') }}</p>
              <p>{{ $t('about.story4') }}</p>
              <p>{{ $t('about.story5') }}</p>
            </div>
          </div>

          <!-- Right: methodology card -->
          <aside data-reveal data-reveal-delay="150">
            <div class="rounded-2xl bg-cream-50 border border-cream-200/60 p-7 text-sm text-slate-600">
              <h2 class="text-[10px] font-semibold tracking-[0.3em] uppercase text-gold mb-5">
                {{ $t('about.credentialsTitle') }}
              </h2>
              <ul class="space-y-3.5">
                <li v-for="row in credentialRows" :key="row.label" class="flex gap-3 items-start">
                  <span class="mt-1.5 h-1 w-1 rounded-full bg-gold/50 flex-shrink-0" aria-hidden="true"></span>
                  <span>
                    {{ $t(row.labelKey) }}
                    <em class="text-slate-400 not-italic">{{ $t(row.valueKey) }}</em>
                  </span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 3: Methodology grid. "How we teach"
         Five principles, 2-up then 3-up grid. Dark
         cream background to break rhythm between two
         dark sections.
         ═══════════════════════════════════════════ -->
    <section class="bg-cream-100 py-24 md:py-32 border-y border-cream-200/60">
      <div class="section-wide">
        <div class="max-w-2xl mb-14 md:mb-20" data-reveal>
          <div class="w-10 h-px bg-gold/40 mb-8" aria-hidden="true"></div>
          <h2 class="font-display text-3xl md:text-4xl text-primary-950 leading-[1.15] mb-5 text-balance">
            {{ $t('about.methodologyTitle') }}
          </h2>
          <p class="text-base md:text-lg text-slate-600 leading-relaxed text-pretty">
            {{ $t('about.methodologyIntro') }}
          </p>
        </div>

        <ol class="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          <li
            v-for="(m, i) in methodologyItems"
            :key="m.titleKey"
            data-reveal
            :data-reveal-delay="i * 80"
          >
            <div class="text-xs font-semibold text-gold tabular-nums tracking-[0.25em] mb-3">
              {{ String(i + 1).padStart(2, '0') }}
            </div>
            <h3 class="font-display text-xl md:text-2xl text-primary-950 leading-snug mb-3 text-balance">
              {{ $t(m.titleKey) }}
            </h3>
            <p class="text-sm md:text-base text-slate-600 leading-relaxed text-pretty">
              {{ $t(m.bodyKey) }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 4: Values band. Philosophy + Languages
         Dark green surface. Two-column editorial.
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
            <h2 class="font-display text-2xl md:text-3xl text-cream leading-[1.2] mb-5 text-balance">
              {{ $t('about.philosophyTitle') }}
            </h2>
            <p class="text-base text-cream/40 leading-relaxed max-w-md text-pretty">
              {{ $t('about.philosophyText') }}
            </p>
          </div>

          <div data-reveal data-reveal-delay="150">
            <div class="w-8 h-px bg-gold/40 mb-8" aria-hidden="true"></div>
            <h2 class="font-display text-2xl md:text-3xl text-cream leading-[1.2] mb-5 text-balance">
              {{ $t('about.langTitle') }}
            </h2>
            <p class="text-base text-cream/40 leading-relaxed max-w-md text-pretty">
              {{ $t('about.langText') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════════════════════════════════════
         SECTION 5: CTA. cinematic close
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
          class="text-base text-cream/30 max-w-sm mx-auto mb-14 text-pretty"
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
import { usePageSeo } from '@/composables/usePageSeo';
import CTAButton from '@/components/common/CTAButton.vue';
import { contactConfig } from '@/config/contactConfig';
import { useWhatsApp } from '@/composables/useWhatsApp';

usePageSeo('about');
const { contactEmail } = contactConfig;
const { whatsAppHref } = useWhatsApp();

// Six rows on the "Methodology & tradition" card. All are organisation-
// level. training lineage, fiqh school, what/how each program teaches.
// Deliberately no named instructor; Daris is the brand and E-E-A-T here
// is carried by the Al-Azhar lineage rather than a personal biography.
const credentialRows = [
  { labelKey: 'about.credLineageLabel', valueKey: 'about.credLineageVal' },
  { labelKey: 'about.credFiqhLabel', valueKey: 'about.credFiqhVal' },
  { labelKey: 'about.credQuranLabel', valueKey: 'about.credQuranVal' },
  { labelKey: 'about.credArabicLabel', valueKey: 'about.credArabicVal' },
  { labelKey: 'about.credStudentsLabel', valueKey: 'about.credStudentsVal' },
  { labelKey: 'about.credFormatLabel', valueKey: 'about.credFormatVal' },
];

// Five methodology principles, rendered as a numbered grid below the story.
const methodologyItems = [
  { titleKey: 'about.method1Title', bodyKey: 'about.method1Body' },
  { titleKey: 'about.method2Title', bodyKey: 'about.method2Body' },
  { titleKey: 'about.method3Title', bodyKey: 'about.method3Body' },
  { titleKey: 'about.method4Title', bodyKey: 'about.method4Body' },
  { titleKey: 'about.method5Title', bodyKey: 'about.method5Body' },
];

useScrollReveal();
</script>
