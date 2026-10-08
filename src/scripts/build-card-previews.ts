const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hover = window.matchMedia('(hover: hover)');

for (const card of document.querySelectorAll<HTMLElement>('.build-card')) {
  if (card.dataset.previewReady) continue;
  card.dataset.previewReady = 'true';
  const graphic = card.querySelector<HTMLElement>('.build-card__shot');
  if (!graphic) continue;
  const iconOnly = graphic.classList.contains('build-card__shot--icon');
  let animation: Animation | undefined;

  const reveal = (open: boolean) => {
    const start = card.getBoundingClientRect().height;
    animation?.cancel();
    card.style.height = '';
    card.classList.toggle('is-expanded', open && !iconOnly);
    card.classList.toggle('is-active', open);
    const end = card.getBoundingClientRect().height;
    if (iconOnly || reducedMotion.matches || Math.abs(start - end) < 1) return;
    animation = card.animate([{ height: `${start}px` }, { height: `${end}px` }], {
      duration: 480,
      easing: 'cubic-bezier(.65, 0, .35, 1)',
    });
  };

  card.addEventListener('mouseenter', () => { if (hover.matches) reveal(true); });
  card.addEventListener('mouseleave', () => { if (hover.matches) reveal(false); });
  card.addEventListener('click', (event) => {
    if (hover.matches || (event.target as Element).closest('a, button')) return;
    const open = !card.classList.contains('is-active');
    for (const other of document.querySelectorAll<HTMLElement>('.build-card.is-active')) {
      if (other !== card) other.dispatchEvent(new Event('preview-close'));
    }
    reveal(open);
  });
  card.addEventListener('preview-close', () => reveal(false));
  window.addEventListener('resize', () => animation?.cancel());
  reducedMotion.addEventListener('change', () => animation?.cancel());
}
