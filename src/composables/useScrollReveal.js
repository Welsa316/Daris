import { onMounted, onUnmounted } from 'vue';

/**
 * Lightweight scroll-reveal using IntersectionObserver.
 * Elements with [data-reveal] fade in + translate up when they enter the viewport.
 * Optional [data-reveal-delay="100"] for staggered children.
 */
export function useScrollReveal() {
  let observer = null;

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = el.dataset.revealDelay || '0';
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add('revealed');
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('[data-reveal]').forEach((el) => {
      observer.observe(el);
    });
  });

  onUnmounted(() => {
    if (observer) {
      observer.disconnect();
    }
  });
}
