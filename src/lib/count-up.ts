/**
 * Counts an element's number up from 0 to its `data-count`, with
 * `data-decimals` places, formatted for the page language. Waits for the
 * element's `--d` delay first, so it lines up with a staggered fade-in.
 */
export function countUp(el: HTMLElement, duration = 1200) {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  const format = new Intl.NumberFormat(document.documentElement.lang, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  const delay = parseFloat(getComputedStyle(el).getPropertyValue('--d') || '0') * 1000;
  const start = performance.now() + delay;
  const step = (now: number) => {
    const p = Math.min(1, Math.max(0, (now - start) / duration));
    el.textContent = format.format(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
