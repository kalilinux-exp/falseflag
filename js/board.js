// board.js - the evidence corkboard: pinned cards + red string toward the insider
import { State } from './state.js';
import { $, el, clear, openModal } from './ui.js';
import { icon } from './icons.js';

// Fixed positions (percent of board) so the layout reads like a real corkboard.
// Cards appear here as their evidence id is collected, in this order.
// Ring around the centre so up to 9 cards + the insider node never overlap.
const SLOTS = [
  { x: 50, y: 17, rot: -2 },
  { x: 72, y: 25, rot:  3 },
  { x: 83, y: 44, rot: -3 },
  { x: 79, y: 67, rot:  3 },
  { x: 62, y: 82, rot: -2 },
  { x: 38, y: 82, rot:  2 },
  { x: 21, y: 67, rot: -3 },
  { x: 17, y: 44, rot:  4 },
  { x: 28, y: 25, rot: -2 },
];
// The insider card is always pinned dead-centre - strings converge on it.
const INSIDER_SLOT = { x: 50, y: 50, rot: -1 };

export function openBoard() {
  const overlay = $('#board-overlay');
  document.body.classList.add('scroll-lock');
  clear(overlay).classList.remove('hidden');
  overlay.onclick = (e) => { if (e.target === overlay) closeBoard(); };

  const board = el('div', { class: 'board' });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'board__svg');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('viewBox', '0 0 100 100');
  const layer = el('div', { class: 'board__layer' });

  const bar = el('div', { class: 'board__bar' }, [
    el('span', { class: 'board__title' }, [icon('board'), ' EVIDENCE BOARD']),
    el('span', { class: 'board__hint', text: 'every clue you recover pins here' }),
    el('button', { class: 'sheet__close', text: '×', 'aria-label': 'Close board', onClick: closeBoard }),
  ]);

  board.append(bar, svg, layer);
  overlay.append(board);

  renderPins(layer, svg);
}

export function closeBoard() {
  const overlay = $('#board-overlay');
  overlay.classList.add('hidden');
  clear(overlay);
  if ($('#modal-overlay').classList.contains('hidden')) document.body.classList.remove('scroll-lock');
}

function renderPins(layer, svg) {
  const evidence = State.evidence;
  if (evidence.length === 0) {
    layer.append(el('div', { class: 'board__empty',
      html: 'No evidence yet.<br/>Work the case - recovered clues pin here automatically.' }));
    return;
  }

  const hasSuspect = evidence.some((e) => e.suspect);

  // Pin every clue as its own card; remember each suspect clue's slot for string routing.
  const suspectSlots = [];
  evidence.forEach((item, i) => {
    const slot = SLOTS[i % SLOTS.length];
    layer.append(pinCard(item, slot));
    if (item.suspect) suspectSlots.push(slot);
  });

  // Once any clue points inward, pin the central INSIDER node and connect the strings.
  if (hasSuspect) {
    const insiderCard = {
      id: 'insider', tag: 'PRIME SUSPECT', label: 'INSIDER?', suspect: true,
      detail: 'The trail bends back inside Northwind. Identity confirmed in the final analysis.',
    };
    layer.append(pinCard(insiderCard, INSIDER_SLOT, true));
    suspectSlots.forEach((slot) => drawString(svg, slot, INSIDER_SLOT));
  }
}

function pinCard(item, slot, isInsider = false) {
  return el('div', {
    class: `card-pin ${item.suspect ? 'card-pin--suspect' : ''}`,
    style: `left:${slot.x}%; top:${slot.y}%; --rot:${slot.rot}deg;`,
  }, [
    el('div', { class: 'card-pin__tag', text: item.tag || 'EVIDENCE' }),
    el('div', { class: 'card-pin__label', text: item.label }),
    item.detail ? el('div', { class: 'card-pin__detail', text: item.detail }) : null,
  ]);
}

function drawString(svg, from, to) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', from.x); line.setAttribute('y1', from.y);
  line.setAttribute('x2', to.x);   line.setAttribute('y2', to.y);
  line.setAttribute('stroke', '#ff5364');
  line.setAttribute('stroke-width', '0.4');
  line.setAttribute('opacity', '0.85');
  line.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(line);
}
