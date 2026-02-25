<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
    <SectionHeader
      eyebrow="Contact"
      title="Get in touch with Daris"
      description="Share your background, what you hope to study, and your timezone. You will receive a clear reply with suggested timings and next steps."
    />

    <div class="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
      <section>
        <h2 class="text-base font-semibold text-slate-900 mb-3">Contact form</h2>
        <ContactForm />
      </section>

      <aside class="space-y-5 text-sm text-slate-700">
        <div class="rounded-2xl bg-white border border-emerald-900/10 p-5">
          <h3 class="text-sm font-semibold text-slate-900 mb-2">Direct contact</h3>
          <p class="mb-3">
            You can contact Daris directly via WhatsApp or email. English support is available through our
            team to assist with your enquiry.
          </p>
          <div class="space-y-2">
            <a
              :href="whatsAppHref"
              class="inline-flex items-center gap-2 text-primary hover:text-emerald-900"
            >
              <span class="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M7.5 3.75H16.5C18.5711 3.75 20.25 5.42893 20.25 7.5V16.5C20.25 18.5711 18.5711 20.25 16.5 20.25H7.5C5.42893 20.25 3.75 18.5711 3.75 16.5V7.5C3.75 5.42893 5.42893 3.75 7.5 3.75Z"
                    stroke="currentColor"
                    stroke-width="1.6"
                  />
                  <path
                    d="M9.5 8.75C9.5 8.05964 8.94036 7.5 8.25 7.5C7.55964 7.5 7 8.05964 7 8.75C7 12.2018 9.79822 15 13.25 15C13.9404 15 14.5 14.4404 14.5 13.75C14.5 13.0596 13.9404 12.5 13.25 12.5H12.8787C12.6244 12.5 12.379 12.3991 12.2071 12.2272L11.2906 11.3107C11.1046 11.1247 10.818 11.0866 10.582 11.2144L10.1402 11.4576C9.88941 11.595 9.58074 11.4936 9.45943 11.2363C9.20994 10.7071 9.5 9.5 9.5 8.75Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span>Contact on WhatsApp</span>
            </a>
            <a
              :href="`mailto:${contactEmail}`"
              class="block text-primary hover:text-emerald-900"
            >
              Email: {{ contactEmail }}
            </a>
          </div>
        </div>

        <div class="rounded-2xl bg-primary/5 border border-emerald-900/10 p-5">
          <h3 class="text-sm font-semibold text-slate-900 mb-2">Timings and response</h3>
          <p class="mb-2">
            Daris serves students outside Egypt and welcomes enquiries from all countries. When you write,
            please specify your city or timezone.
          </p>
          <p class="mb-2">
            Responses are typically sent within 1–3 working days. If your message arrives close to busy study
            periods or holidays, replies may take slightly longer, but every enquiry is read carefully.
          </p>
          <p>
            Together, you will look for a schedule that is sustainable for both sides and that respects your
            other commitments.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import SectionHeader from '../components/common/SectionHeader.vue';
import ContactForm from '../components/contact/ContactForm.vue';
import { contactConfig } from '../config/contactConfig';

const { whatsappNumber, whatsappMessage, contactEmail } = contactConfig;

const whatsAppHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  whatsappMessage
)}`;
</script>

