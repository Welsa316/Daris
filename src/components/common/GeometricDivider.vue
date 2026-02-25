<template>
  <div
    class="flex items-center justify-center"
    :class="spacing"
    role="presentation"
    aria-hidden="true"
  >
    <svg
      class="text-primary"
      :class="sizeClass"
      viewBox="0 0 480 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Left line -->
      <line
        x1="60"
        y1="12"
        x2="206"
        y2="12"
        stroke="currentColor"
        stroke-width="0.5"
        opacity="0.2"
      />

      <!-- Left small diamonds -->
      <path
        d="M80 12L84 8.5L88 12L84 15.5Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M130 12L133 9.5L136 12L133 14.5Z"
        fill="currentColor"
        opacity="0.1"
      />

      <!-- Center 8-pointed star -->
      <g transform="translate(240, 12)" opacity="0.25">
        <!-- Outer star -->
        <path
          d="M0 -9L3 -3L9 0L3 3L0 9L-3 3L-9 0L-3 -3Z"
          fill="currentColor"
        />
        <!-- Inner rotated square -->
        <path
          d="M0 -6L6 0L0 6L-6 0Z"
          fill="currentColor"
          opacity="0.4"
        />
      </g>

      <!-- Right line -->
      <line
        x1="274"
        y1="12"
        x2="420"
        y2="12"
        stroke="currentColor"
        stroke-width="0.5"
        opacity="0.2"
      />

      <!-- Right small diamonds -->
      <path
        d="M392 12L396 8.5L400 12L396 15.5Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M344 12L347 9.5L350 12L347 14.5Z"
        fill="currentColor"
        opacity="0.1"
      />

      <!-- End dots -->
      <circle cx="52" cy="12" r="1.5" fill="currentColor" opacity="0.15" />
      <circle cx="428" cy="12" r="1.5" fill="currentColor" opacity="0.15" />
    </svg>
  </div>
</template>

<script setup>
defineProps({
  spacing: {
    type: String,
    default: 'py-4'
  },
  sizeClass: {
    type: String,
    default: 'w-48 sm:w-64 md:w-80 h-6'
  }
});
</script>
