<template>
  <canvas
    ref="canvasRef"
    class="w-full h-full pointer-events-none"
    style="opacity: 0; transition: opacity 1.2s ease;"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import createGlobe from 'cobe';

const canvasRef = ref(null);
let globe = null;
let animationId = null;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const size = canvas.offsetWidth;
  if (size === 0) return;

  let phi = 0;

  globe = createGlobe(canvas, {
    devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    width: size * 2,
    height: size * 2,
    phi: 0,
    theta: 0.25,
    dark: 1,
    diffuse: 1.2,
    mapSamples: 16000,
    mapBrightness: 2,
    baseColor: [0.047, 0.125, 0.078],
    markerColor: [0.784, 0.663, 0.318],
    glowColor: [0.047, 0.125, 0.078],
    markers: [
      { location: [38.9, -77.0], size: 0.06 },
      { location: [51.5, -0.1], size: 0.06 },
      { location: [52.4, 4.9], size: 0.06 },
      { location: [52.2, 21.0], size: 0.06 },
      { location: [30.0, 31.2], size: 0.06 },
      { location: [24.7, 46.7], size: 0.06 },
      { location: [25.3, 51.5], size: 0.06 },
      { location: [41.3, 69.3], size: 0.06 },
      { location: [33.7, 73.0], size: 0.06 },
    ],
    onRender: (state) => {
      state.phi = phi;
      phi += 0.003;
    },
  });

  canvas.style.opacity = '1';
});

onBeforeUnmount(() => {
  if (globe) globe.destroy();
});
</script>
