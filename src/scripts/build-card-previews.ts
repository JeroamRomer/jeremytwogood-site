const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const desktop = window.matchMedia('(min-width: 901px)');

const sizeGrids = () => {
  for (const grid of document.querySelectorAll<HTMLElement>('.builds-grid')) {
    const cards = [...grid.querySelectorAll<HTMLElement>('.build-card')];
    grid.style.removeProperty('--compact-height');
    // Measure the copy at one-column width without clipping longer descriptions.
    const compact = Math.max(320, ...cards.filter((card) => !card.classList.contains('is-expanded')).map((card) => {
      card.style.height = 'auto';
      card.style.minHeight = '320px';
      const height = card.getBoundingClientRect().height;
      card.style.height = '';
      card.style.minHeight = '';
      return height;
    }));
    grid.style.setProperty('--compact-height', `${compact}px`);
    grid.style.setProperty('--expanded-height', `${Math.max(718, grid.clientWidth * .58 + 80)}px`);
  }
};
sizeGrids();
document.fonts.ready.then(sizeGrids);
window.addEventListener('resize', sizeGrids);

const hover = window.matchMedia('(hover: hover)');

for (const card of document.querySelectorAll<HTMLElement>('.build-card')) {
  if (card.dataset.previewReady) continue;
  card.dataset.previewReady = 'true';
  const graphic = card.querySelector<HTMLElement>('.build-card__shot');
  if (!graphic) continue;
  const iconOnly = graphic.classList.contains('build-card__shot--icon');
  let animation: Animation | undefined;

  const reveal = (open: boolean) => {
    const start = card.getBoundingClientRect();
    if (open && !card.classList.contains('is-expanded')) {
      const grid = card.parentElement!.getBoundingClientRect();
      card.classList.toggle('is-right-column', start.left > grid.left + grid.width / 3);
    }
    animation?.cancel();
    card.style.height = '';
    card.classList.toggle('is-expanded', open && !iconOnly);
    card.classList.toggle('is-active', open);
    const end = card.getBoundingClientRect();
    if (iconOnly || reducedMotion.matches || Math.abs(start.height - end.height) < 1 && Math.abs(start.width - end.width) < 1) return;
    animation = card.animate([
      { height: `${start.height}px`, width: `${start.width}px`, transform: desktop.matches ? `translateX(${start.left - end.left}px)` : 'none' },
      { height: `${end.height}px`, width: `${end.width}px`, transform: 'none' },
    ], {
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
