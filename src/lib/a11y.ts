export function focusableIn(root: HTMLElement): HTMLElement[] {
  const nodes = root.querySelectorAll<HTMLElement>(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  );
  return [...nodes].filter((node) => {
    if (node.hasAttribute('hidden') || node.getAttribute('aria-hidden') === 'true') return false;
    if (node.closest('[hidden], [aria-hidden="true"], [inert]')) return false;
    const style = typeof window !== 'undefined' ? window.getComputedStyle?.(node) : null;
    if (style && (style.display === 'none' || style.visibility === 'hidden')) return false;
    if ('disabled' in node && (node as HTMLButtonElement).disabled) return false;
    return true;
  });
}

export function trapTab(event: KeyboardEvent, root: HTMLElement): void {
  if (event.key !== 'Tab') return;
  const items = focusableIn(root);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement as HTMLElement | null;
  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
