// hints.js - graduated hint system (nudge -> strong -> near-answer)
import { State } from './state.js';
import { el, openModal, closeModal } from './ui.js';

const TIER_LABELS = ['NUDGE', 'STRONG HINT', 'NEAR-ANSWER'];

// Tracks how many tiers the player has revealed per level, this session.
const revealed = {};

export function openHints(level) {
  revealed[level.id] = revealed[level.id] || 0;
  const tiers = level.hints || [];

  const body = el('div', {}, [
    el('div', { class: 'sheet__kicker', text: 'ANALYST SUPPORT' }),
    el('h3', { text: 'Need a hand?' }),
    el('p', { text: 'Reveal one step at a time. Using hints lowers your final analyst rating - but a solved case beats a perfect score.' }),
  ]);

  const list = el('div', { class: 'mt' });
  body.append(list);

  function paint() {
    list.replaceChildren();
    tiers.forEach((text, i) => {
      const shown = i < revealed[level.id];
      const row = el('div', { class: `hinttier ${shown ? '' : 'hinttier--locked'}` }, [
        el('span', { class: 'hinttier__lvl', text: TIER_LABELS[i] || `TIER ${i + 1}` }),
        el('span', { class: 'hinttier__text', text: shown ? text : '• • • • • • • • • •' }),
      ]);
      list.append(row);
    });

    const actions = el('div', { class: 'sheet__actions' });
    if (revealed[level.id] < tiers.length) {
      actions.append(el('button', {
        class: 'btn', text: `Reveal ${TIER_LABELS[revealed[level.id]] || 'next'}`,
        onClick: () => { revealed[level.id] += 1; State.useHint(); paint(); },
      }));
    }
    actions.append(el('button', { class: 'btn btn--ghost', text: 'Close', onClick: () => closeModal() }));
    list.append(actions);
  }

  paint();
  openModal(body);
}
