<template>
  <form
    :action="formAction"
    method="POST"
    class="space-y-4"
    @submit.prevent="handleSubmit"
  >
    <div>
      <label for="name" class="block text-sm font-medium text-slate-900 mb-1">
        Name
      </label>
      <input
        id="name"
        v-model="form.name"
        name="name"
        type="text"
        required
        class="block w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-slate-900 mb-1">
        Email
      </label>
      <input
        id="email"
        v-model="form.email"
        name="email"
        type="email"
        required
        class="block w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>

    <div>
      <label for="message" class="block text-sm font-medium text-slate-900 mb-1">
        Message
      </label>
      <textarea
        id="message"
        v-model="form.message"
        name="message"
        rows="4"
        required
        class="block w-full rounded-lg border border-emerald-900/15 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
        placeholder="Share your current level, goals, and preferred times."
      ></textarea>
    </div>

    <p class="text-xs text-slate-500">
      By submitting, your message will open in your default email client using a
      <code>mailto:</code> link. You can optionally configure a form service
      endpoint later.
    </p>

    <button
      type="submit"
      class="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold tracking-wide text-cream shadow-soft-lg hover:bg-emerald-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-cream transition-colors"
    >
      Send message
    </button>
  </form>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { contactConfig } from '../../config/contactConfig';

const form = reactive({
  name: '',
  email: '',
  message: ''
});

const formAction = computed(() =>
  contactConfig.formEndpoint ? contactConfig.formEndpoint : undefined
);

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

