// laptop.js - wraps digital tools in a laptop running real-looking forensic software.
// Kept in its own module so the shared helper can't desync with a cached ui.js.
import { el } from './ui.js';

// children: array of tool nodes. label: the app name shown in the window chrome.
export function laptopFrame(children, label = 'forensic-tool') {
  return el('div', { class: 'laptop' }, [
    el('div', { class: 'laptop__screen' }, [
      el('div', { class: 'laptop__view' }, [
        el('div', { class: 'scr-chrome' }, [
          el('span', { class: 'scr-dots', 'aria-hidden': 'true' }, [
            el('i', { class: 'scr-dot scr-dot--r' }),
            el('i', { class: 'scr-dot scr-dot--y' }),
            el('i', { class: 'scr-dot scr-dot--g' }),
          ]),
          el('span', { class: 'scr-path', text: `northwind-ir // ${label}` }),
          el('span', { class: 'scr-live' }, [el('i', { class: 'scr-led', 'aria-hidden': 'true' }), 'LIVE']),
        ]),
        el('div', { class: 'scr-body' }, children),
      ]),
    ]),
  ]);
}
