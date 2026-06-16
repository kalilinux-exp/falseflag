// level2_payload.js - steganography. Teach LSB, then make the analyst READ the
// recovered note and mark the evidence. No drag-and-win.
import { el, clear, toast } from '../ui.js';
import { laptopFrame } from '../laptop.js';
import { icon } from '../icons.js';
import { SECRET, EXIF, EVIDENCE, VERDICT } from '../data/level2_payload.js';

const W = 260, H = 150;

// the two pieces of evidence the analyst must find by reading the note,
// plus decoys so it isn't a single obvious chip.
const TARGETS = [
  { text: 'stg-07.veil-net.ru', id: 'host', label: 'staging host' },
  { text: 'gh0stwrjter', id: 'alias', label: 'attacker alias' },
];
const DECOYS = ['600s', 'beacon', 'ROTATE'];

let carrier, decoded = '';
let plane = null, reached0 = false, decodedShown = false, exifFound = false;
const found = new Set();
let wrongMarks = 0;

const level = {
  id: 'payload',
  order: 2,
  codename: 'THE PAYLOAD',
  title: 'The Payload',
  skill: 'STEGANOGRAPHY',
  icon: 'image',
  status: 'live',
  objective: 'The phishing email carried this image. It looks ordinary - but data can hide <b>inside the pixels</b>. Learn how, dig it out, then mark the evidence you find in the recovered note.',
  hints: [
    'Look at the metadata first (who made the file, when). Then the picture itself: slide down through the bit-planes and watch for the plane where it stops looking like a photo.',
    'The hidden data lives in bit plane 0 - the least-significant bit. Drag the slider all the way down, then decode that plane.',
    'After decoding, read the note. The two clues to mark are the staging host (stg-07.veil-net.ru) and the forum handle (gh0stwrjter).',
  ],

  mount(root, ctx) {
    plane = null; reached0 = false; decodedShown = false; exifFound = false; wrongMarks = 0; found.clear();
    carrier = buildCarrier();
    decoded = extractLSB(carrier.data);

    clear(root);
    root.append(
      objectiveBanner(level.objective),
      // steganography is digital forensics — it runs on the analyst's laptop
      laptopFrame([
        el('div', { class: 'panel' }, [tabHeader(root, ctx), el('div', { id: 'tool-body' })]),
      ], 'payload-decode'),
    );
    showTab('lsb', root, ctx);
  },
};

/* ---------------- shared ---------------- */
function objectiveBanner(html) {
  return el('div', { class: 'objective' }, [
    el('span', { class: 'objective__icon' }, [icon('image')]),
    el('span', { class: 'objective__text', html }),
  ]);
}
function fieldNote(html) {
  return el('div', { class: 'fieldnote' }, [
    el('span', { class: 'fieldnote__tag', text: 'FIELD NOTE' }),
    el('span', { class: 'fieldnote__text', html }),
  ]);
}

/* ---------------- tabs ---------------- */
function tabHeader(root, ctx) {
  const head = el('div', { class: 'panel__head', style: 'gap:0; padding:0;' });
  head.append(tab('lsb', 'Pixels (LSB)', 'image', root, ctx), tab('exif', 'Metadata (EXIF)', 'doc', root, ctx));
  return head;
}
function tab(id, label, ic, root, ctx) {
  return el('button', { class: 'toolab', 'data-tab': id, onClick: () => showTab(id, root, ctx) }, [icon(ic), label]);
}
function showTab(id, root, ctx) {
  root.querySelectorAll('.toolab').forEach((t) => t.classList.toggle('toolab--on', t.dataset.tab === id));
  const body = root.querySelector('#tool-body');
  clear(body);
  body.append(id === 'exif' ? exifPanel() : lsbPanel(ctx));
}

/* ---------------- EXIF panel ---------------- */
function exifPanel() {
  const wrap = el('div', { class: 'toolpad' });
  wrap.append(fieldNote('Files remember who made them. <b>Metadata</b> can leak the author, their machine, and the exact time - even when the picture gives nothing away.'));
  const table = el('div', { class: 'exif' });
  EXIF.forEach((row) => table.append(el('div', { class: `exifrow ${row.suspicious ? 'exifrow--sus' : ''}`, title: row.note || '' }, [
    el('span', { class: 'exif__k', text: row.key }),
    el('span', { class: 'exif__v', text: row.value }),
    row.suspicious ? el('span', { class: 'exif__flag' }, [icon('flag')]) : null,
  ])));
  wrap.append(table);
  const btn = el('button', { class: 'btn', onClick: (e) => {
    exifFound = true; e.currentTarget.setAttribute('disabled', ''); e.currentTarget.textContent = 'Anomaly logged';
    toast('Logged: the file was authored in-house (mdev, Eastern time) the night before.', 'red');
  } }, ['Flag the anomaly']);
  if (exifFound) { btn.setAttribute('disabled', ''); btn.textContent = 'Anomaly logged'; }
  wrap.append(el('div', { class: 'mt' }, [btn]));
  return wrap;
}

/* ---------------- LSB panel ---------------- */
function lsbPanel(ctx) {
  const wrap = el('div', { class: 'toolpad' });
  wrap.append(fieldNote('Every pixel’s colour is a number, and its <b>last binary digit</b> barely changes the shade. Hide data in those last bits and the image looks identical. Slide down the bit-planes: the plane that stops looking like the photo <b>is</b> the hidden data.'));

  const canvas = el('canvas', { class: 'stego-canvas', width: W, height: H });
  const caption = el('div', { class: 'stego-cap muted', text: 'Original image. Drag right to peel back its bit-planes.' });
  const slider = el('input', { type: 'range', min: '0', max: '8', value: '0', step: '1', class: 'planeslider', autocomplete: 'off', 'aria-label': 'Bit plane' });
  const sliderLabel = el('span', { class: 'plane-label', text: 'IMAGE' });
  const decodeBtn = el('button', { class: 'btn', id: 'decode-btn', disabled: '', text: 'Decode this plane' });
  const result = el('div', { id: 'decode-result' });

  function render() {
    const v = parseInt(slider.value, 10);
    plane = v === 0 ? null : (8 - v);
    drawView(canvas, plane);
    if (plane === null) { sliderLabel.textContent = 'IMAGE'; caption.textContent = 'Original image. Drag right to peel back its bit-planes.'; }
    else {
      sliderLabel.textContent = `BIT ${plane}${plane === 0 ? ' · LSB' : plane === 7 ? ' · MSB' : ''}`;
      caption.textContent = plane === 0
        ? 'Bit plane 0 (LSB). The band across the top is not noise - it is data.'
        : `Bit plane ${plane}: still basically the picture. Keep going down.`;
    }
    if (plane === 0) { reached0 = true; decodeBtn.removeAttribute('disabled'); }
    else if (!decodedShown) decodeBtn.setAttribute('disabled', '');
  }
  slider.addEventListener('input', render);
  decodeBtn.addEventListener('click', () => { decodedShown = true; decodeBtn.setAttribute('disabled', ''); decodeBtn.textContent = 'Decoded'; renderDecoded(result, ctx); result.scrollIntoView({ behavior: 'smooth', block: 'center' }); });

  wrap.append(
    el('div', { class: 'stego-stage' }, [canvas, caption]),
    el('div', { class: 'plane-ctl' }, [el('span', { class: 'muted', text: 'IMAGE' }), slider, el('span', { class: 'muted', text: 'LSB' }), sliderLabel]),
    el('div', { class: 'accuse mt' }, [el('span', { class: 'accuse__hint', text: 'Find the data plane, then decode it.' }), decodeBtn]),
    result,
  );
  setTimeout(() => { slider.value = reached0 && !decodedShown ? '8' : (decodedShown ? '8' : '0'); render(); if (decodedShown) { decodeBtn.textContent = 'Decoded'; renderDecoded(result, ctx); } }, 0);
  return wrap;
}

/* ---------------- decoded note + mark-the-evidence gate ---------------- */
function renderDecoded(container, ctx) {
  clear(container);
  container.append(
    el('div', { class: 'panel__head', style: 'border:none;padding:18px 0 8px;', text: 'RECOVERED FROM THE LSB PLANE' }),
    el('div', { class: 'artifact' }, [
      el('span', { class: 'stamp stamp--recovered', text: 'RECOVERED' }),
      el('pre', { class: 'decoded-doc' }, tokenize(ctx)),
    ]),
    el('div', { class: 'mark-instruct', html: 'This is the attacker’s own staging note. <b>Tap the two pieces of evidence</b> hiding in it: the server they used and the handle they slipped.' }),
    checklist(),
    el('div', { class: 'accuse mt' }, [
      el('span', { class: 'accuse__hint', id: 'mark-status', text: '0 of 2 marked' }),
      el('button', { class: 'btn', id: 'log-btn', disabled: '', text: 'Log evidence & continue',
        onClick: () => ctx.complete({
          flagsCaught: Math.max(0, 2 - wrongMarks), flagsTotal: 2,
          evidence: EVIDENCE, verdict: VERDICT,
        }) }),
    ]),
  );
  refreshMarks();
}

function tokenize(ctx) {
  const tokens = TARGETS.map((t) => ({ ...t, kind: 'target' })).concat(DECOYS.map((d) => ({ text: d, kind: 'decoy' })));
  const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp('(' + tokens.map((t) => esc(t.text)).join('|') + ')', 'g');
  const nodes = [];
  SECRET.split(re).forEach((part) => {
    const t = tokens.find((x) => x.text === part);
    if (!t) { nodes.push(document.createTextNode(part)); return; }
    nodes.push(tokenEl(t, ctx));
  });
  return nodes;
}
function tokenEl(t, ctx) {
  const isFound = t.kind === 'target' && found.has(t.id);
  const btn = el('button', { class: `tok ${isFound ? 'tok--found' : ''}`, 'data-tid': t.id || '', onClick: () => {
    if (t.kind === 'decoy') { wrongMarks += 1; toast('That is in the note, but it is not the evidence we need.', 'red'); return; }
    if (found.has(t.id)) return;
    found.add(t.id);
    btn.classList.add('tok--found');
    toast(`Marked the ${t.label}.`);
    refreshMarks();
  } }, [t.text]);
  return btn;
}
function checklist() {
  const list = el('div', { class: 'ev-check' });
  TARGETS.forEach((t) => list.append(el('div', { class: 'ev-slot', 'data-slot': t.id }, [
    el('span', { class: 'ev-slot__box' }, found.has(t.id) ? [icon('check')] : []),
    el('span', { text: t.label.charAt(0).toUpperCase() + t.label.slice(1) }),
  ])));
  return list;
}
function refreshMarks() {
  TARGETS.forEach((t) => {
    const slot = document.querySelector(`.ev-slot[data-slot="${t.id}"]`);
    if (slot) { slot.classList.toggle('ev-slot--on', found.has(t.id)); const box = slot.querySelector('.ev-slot__box'); if (box && found.has(t.id) && !box.childElementCount) box.append(icon('check')); }
  });
  const status = document.querySelector('#mark-status');
  const logBtn = document.querySelector('#log-btn');
  if (status) status.textContent = `${found.size} of 2 marked`;
  if (logBtn) found.size >= 2 ? logBtn.removeAttribute('disabled') : logBtn.setAttribute('disabled', '');
}

/* ---------------- canvas + steganography (canonical LSB) ---------------- */
function drawView(canvas, plane) {
  const ctx = canvas.getContext('2d');
  if (plane === null) { ctx.putImageData(carrier, 0, 0); return; }
  const out = ctx.createImageData(W, H);
  const src = carrier.data, dst = out.data;
  for (let i = 0; i < src.length; i += 4) {
    const bit = (src[i] >> plane) & 1;
    const val = bit ? 235 : 12;
    dst[i] = dst[i + 1] = dst[i + 2] = val; dst[i + 3] = 255;
  }
  ctx.putImageData(out, 0, 0);
}
function buildCarrier() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#10243a'); g.addColorStop(1, '#06101c');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  const rnd = seeded(0x9e3779b9);
  for (let n = 0; n < 5; n++) {
    const rg = ctx.createRadialGradient(rnd() * W, rnd() * H, 4, rnd() * W, rnd() * H, 60);
    rg.addColorStop(0, 'rgba(70,130,180,0.18)'); rg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
  }
  ctx.fillStyle = '#dfe9f5';
  for (let n = 0; n < 80; n++) ctx.fillRect((rnd() * W) | 0, (rnd() * H) | 0, 1, 1);
  ctx.font = 'bold 22px monospace'; ctx.fillStyle = 'rgba(223,233,245,0.85)';
  ctx.fillText('NORTHWIND', 18, 86);
  const img = ctx.getImageData(0, 0, W, H);
  embedLSB(img.data, SECRET);
  return img;
}
function seeded(s) { let a = s >>> 0; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; }; }
function embedLSB(data, text) {
  const bytes = new TextEncoder().encode(text);
  const payload = [(bytes.length >> 8) & 255, bytes.length & 255, ...bytes];
  let bit = 0;
  for (let i = 0; i < data.length && bit < payload.length * 8; i++) {
    if (i % 4 === 3) continue;
    const b = (payload[bit >> 3] >> (7 - (bit & 7))) & 1;
    data[i] = (data[i] & 0xfe) | b; bit++;
  }
}
function extractLSB(data) {
  const bits = [];
  for (let i = 0; i < data.length; i++) { if (i % 4 === 3) continue; bits.push(data[i] & 1); }
  const byteAt = (o) => { let v = 0; for (let k = 0; k < 8; k++) v = (v << 1) | bits[o * 8 + k]; return v; };
  const len = (byteAt(0) << 8) | byteAt(1);
  const out = new Uint8Array(len);
  for (let j = 0; j < len; j++) out[j] = byteAt(2 + j);
  return new TextDecoder().decode(out);
}

export default level;
