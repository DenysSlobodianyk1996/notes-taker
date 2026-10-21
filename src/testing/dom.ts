/** Text a user (or screen reader) perceives: aria-label if set, else text without aria-hidden parts (icons). */
export function accessibleName(element: Element): string {
  const label = element.getAttribute('aria-label');
  if (label) return label.trim();
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('[aria-hidden="true"]').forEach((hidden) => hidden.remove());
  return (clone.textContent ?? '').replace(/\s+/g, ' ').trim();
}

export function getButton(root: Element, name: string): HTMLButtonElement {
  const match = [...root.querySelectorAll('button')].find((b) => accessibleName(b) === name);
  if (!match) {
    const names = [...root.querySelectorAll('button')].map(accessibleName);
    throw new Error(`No button "${name}". Buttons: ${JSON.stringify(names)}`);
  }
  return match;
}
