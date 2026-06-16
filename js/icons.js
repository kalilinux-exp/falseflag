// icons.js - small, consistent line-art icon set (no emoji).
// 24x24, currentColor stroke. Drawn simply so they read as one family.
const S = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

export const ICONS = {
  mail:   S('<rect x="3" y="5" width="18" height="14" rx="1.5"/><path d="m4 7 8 6 8-6"/>'),
  image:  S('<rect x="3" y="4.5" width="18" height="15" rx="1.5"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>'),
  key:    S('<circle cx="7.5" cy="7.5" r="3.5"/><path d="m10 10 9 9"/><path d="m15.5 14.5 2 2"/><path d="m13 17 2 2"/>'),
  scope:  S('<circle cx="12" cy="12" r="7"/><path d="M12 2.5v3.5M12 18v3.5M2.5 12H6M18 12h3.5"/><circle cx="12" cy="12" r="1.3"/>'),
  mask:   S('<path d="M4 7.5h16v3.5c0 4-3.6 7-8 7s-8-3-8-7Z"/><path d="M8 11.5h2.2M13.8 11.5H16"/>'),
  board:  S('<rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M8 8l4 4M16 8l-4 4M12 12v5"/>'),
  search: S('<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>'),
  doc:    S('<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/><path d="M9 12h6M9 16h6"/>'),
  check:  S('<path d="M4 12.5 9.5 18 20 6"/>'),
  alert:  S('<path d="M12 4 22 20H2Z"/><path d="M12 10v5M12 17.5v.5"/>'),
  flag:   S('<path d="M6 3v18"/><path d="M6 4h11l-2 3 2 3H6"/>'),
  pin:    S('<path d="M12 13v8"/><path d="M8 4h8l-1 5 2 2H7l2-2-1-5Z"/>'),
  clip:   S('<path d="M16 6.5 9 13.5a2.5 2.5 0 0 0 3.5 3.5l6-6a4 4 0 0 0-5.7-5.7l-6.5 6.5a6 6 0 0 0 8.5 8.5l5-5"/>'),
};

/** Return an inline-icon element. */
export function icon(name, cls = '') {
  const span = document.createElement('span');
  span.className = `ico ${cls}`.trim();
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = ICONS[name] || '';
  return span;
}
