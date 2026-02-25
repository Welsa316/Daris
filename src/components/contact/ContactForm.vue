<template>
  <form
    class="space-y-5"
    @submit.prevent="handleSubmit"
  >
    <div>
      <label for="contact-name" class="block text-sm font-medium text-slate-900 mb-1.5">
        Name
      </label>
      <input
        id="contact-name"
        v-model="form.name"
        name="name"
        type="text"
        required
        autocomplete="name"
        class="block w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400"
        placeholder="Your full name"
      />
    </div>

    <div>
      <label for="contact-email" class="block text-sm font-medium text-slate-900 mb-1.5">
        Email
      </label>
      <input
        id="contact-email"
        v-model="form.email"
        name="email"
        type="email"
        required
        autocomplete="email"
        class="block w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400"
        placeholder="you@example.com"
      />
    </div>

    <div>
      <label for="contact-message" class="block text-sm font-medium text-slate-900 mb-1.5">
        Message
      </label>
      <textarea
        id="contact-message"
        v-model="form.message"
        name="message"
        rows="5"
        required
        class="block w-full rounded-xl border border-primary/10 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none placeholder:text-slate-400 resize-y"
        placeholder="Share your current level, goals, and preferred times."
      ></textarea>
    </div>

    <p class="text-xs text-slate-500 leading-relaxed">
      By submitting, your message will open in your default email client via a
      <code class="text-slate-600">mailto:</code> link. If a form service is
      configured, it will be submitted directly instead.
    </p>

    <button
      type="submit"
      class="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold tracking-wide text-cream shadow-soft transition-all duration-200 hover:bg-primary-800 hover:shadow-soft-md active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
    >
      Send message
    </button>
  </form>
</template>

<script setup>
import { reactive } from 'vue';
import { contactConfig } from '@/config/contactConfig';

const form = reactive({
  name: '',
  email: '',
  message: ''
});

const handleSubmit = () => {
  if (contactConfig.formEndpoint) {
    const formEl = document.createElement('form');
    formEl.action = contactConfig.formEndpoint;
    formEl.method = 'POST';

    const fields = ['name', 'email', 'message'];
    fields.forEach((field) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = field;
      input.value = form[field];
      formEl.appendChild(input);
    });

    document.body.appendChild(formEl);
    formEl.submit();
    document.body.removeChild(formEl);
  } else {
    const subject = encodeURIComponent('Daris – New enquiry');
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:${contactConfig.contactEmail}?subject=${subject}&body=${body}`;
  }
};
</script>
