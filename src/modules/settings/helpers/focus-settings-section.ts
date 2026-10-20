export function focusSettingsSection(section: HTMLElement | null) {
  if (!section) {
    return;
  }

  const scroller = section.closest<HTMLElement>('[data-settings-detail-scroll]');
  if (scroller) {
    scroller.scrollTo({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      top: scroller.scrollTop + section.getBoundingClientRect().top - scroller.getBoundingClientRect().top - 24,
    });
  }
  section.focus({ preventScroll: true });
}
