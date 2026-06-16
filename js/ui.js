// ui.js - small DOM + feedback helpers (no dependencies)

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Create an element from a tag, props, and children. */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== false && v != null) node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

/* ---------- toast ---------- */
let toastWrap;
export function toast(message, kind = '') {
  if (!toastWrap) {
    toastWrap = el('div', { class: 'toast-wrap' });
    document.body.append(toastWrap);
  }
  const t = el('div', { class: `toast ${kind === 'red' ? 'toast--red' : ''}`, html: message });
  toastWrap.append(t);
  setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0';
    setTimeout(() => t.remove(), 400); }, 3200);
}

/* ---------- modal ---------- */
export function openModal(content, { onClose } = {}) {
  const overlay = $('#modal-overlay');
  document.body.classList.add('scroll-lock');
  clear(overlay).classList.remove('hidden');
  const sheet = el('div', { class: 'sheet' });
  const close = el('button', { class: 'sheet__close', 'aria-label': 'Close', text: '×',
    onClick: () => closeModal(onClose) });
  sheet.append(close, content);
  overlay.append(sheet);
  overlay.onclick = (e) => { if (e.target === overlay) closeModal(onClose); };
  return overlay;
}
export function closeModal(onClose) {
  const overlay = $('#modal-overlay');
  overlay.classList.add('hidden');
  clear(overlay);
  if ($('#board-overlay').classList.contains('hidden')) document.body.classList.remove('scroll-lock');
  if (typeof onClose === 'function') onClose();
}

/* ---------- typewriter (returns a promise) ---------- */
export function typeLines(container, lines, { speed = 16, lineGap = 110 } = {}) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  return new Promise((resolve) => {
    let i = 0;
    const cursor = el('span', { class: 'boot__cursor' });
    function nextLine() {
      if (i >= lines.length) { cursor.remove(); return resolve(); }
      const { text = '', cls = '', delay = lineGap, instant = false } = lines[i++];
      const p = el('p', { class: 'boot__line' });
      const span = el('span', { class: cls });
      p.append(span);
      container.append(p);
      p.append(cursor);
      if (reduce || instant) { span.innerHTML = text; setTimeout(nextLine, reduce ? 40 : delay); return; }
      let j = 0;
      (function typeChar() {
        if (j <= text.length) { span.innerHTML = text.slice(0, j++); setTimeout(typeChar, speed); }
        else setTimeout(nextLine, delay);
      })();
    }
    nextLine();
  });
}

/** Smooth-scroll the app container to top. */
export function toTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
