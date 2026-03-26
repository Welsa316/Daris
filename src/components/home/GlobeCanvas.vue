<template>
  <canvas
    ref="canvasRef"
    class="w-full h-full pointer-events-none"
    style="opacity: 0; transition: opacity 1.2s ease; border-radius: 50%;"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import createGlobe from 'cobe';

const canvasRef = ref(null);
let globe = null;
let animationId = null;
let autoRotation = 0;

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  function init() {
    const width = canvas.offsetWidth;
    if (width === 0 || globe) return;

    globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width,
      height: width,
      phi: 0,
      theta: 0.2,
      dark: 1,
      diffuse: 1.5,
      mapSamples: 16000,
      mapBrightness: 10,
      baseColor: [0.5, 0.5, 0.5],
      markerColor: [0.78, 0.66, 0.32],
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
    });

    function animate() {
      autoRotation += 0.003;
      globe.update({ phi: autoRotation, theta: 0.2 });
      animationId = requestAnimationFrame(animate);
    }
    animate();

    setTimeout(() => { canvas.style.opacity = '1'; });
  }

  if (canvas.offsetWidth > 0) {
    init();
  } else {
    const ro = new ResizeObserver((entries) => {
      if (entries[0]?.contentRect.width > 0) {
        ro.disconnect();
        init();
      }
    });
    ro.observe(canvas);
  }
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
  if (globe) globe.destroy();
});
</script>
