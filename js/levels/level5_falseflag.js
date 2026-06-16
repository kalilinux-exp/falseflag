// level5_falseflag.js - stylometry. Prove who really wrote the ransom note.
import { el, clear, toast } from '../ui.js';
import { icon } from '../icons.js';
import { CORRECT_AUTHOR, FUNCTION_WORDS, TELL_PHRASES, RANSOM_NOTE, SUSPECTS, EVIDENCE, VERDICT, HINTS } from '../data/level5_stylometry.js';

let analyzed = false;
let scores = {};   // suspectId -> {sim, feats, shared}
let selected = null;

const level = {
  id: 'falseflag',
  order: 5,
  codename: 'FALSE FLAG',
  title: 'False Flag',
  skill: 'STYLOMETRY',
  icon: 'mask',
  status: 'live',
  objective: 'The ransom note is signed <b>CRIMSON VEIL</b>. Prove who actually wrote it. Run <b>stylometric analysis</b> against the three suspects, then accuse the real author.',
  hints: HINTS,

  mount(root, ctx) {
    analyzed = false; scores = {}; selected = null;
    clear(root);
    root.append(
      objectiveBanner(level.objective),
      el('div', { class: 'fieldnote' }, [
        el('span', { class: 'fieldnote__tag', text: 'FIELD NOTE' }),
        el('span', { class: 'fieldnote__text', html: 'Everyone has a <b>writing fingerprint</b> - how often they use little words (the, and, that), how long their sentences run, where they put commas. It survives even when you fake who you are. That is <b>stylometry</b>; it is how the Unabomber was caught.' }),
      ]),
      el('div', { class: 'stylo' }, [notePanel(), suspectsPanel(ctx)]),
    );
  },
};

function objectiveBanner(html) {
  return el('div', { class: 'objective' }, [
    el('span', { class: 'objective__icon' }, [icon('mask')]),
    el('span', { class: 'objective__text', html }),
  ]);
}

/* ---------------- ransom note ---------------- */
function notePanel() {
  return el('div', { class: 'panel' }, [
    el('div', { class: 'panel__head', text: 'RANSOM NOTE - exhibit A' }),
    el('div', { class: 'toolpad' }, [
      el('div', { class: 'artifact' }, [
        el('span', { class: 'stamp stamp--evidence', text: 'EVIDENCE' }),
        el('pre', { class: 'note-text', text: RANSOM_NOTE }),
      ]),
    ]),
  ]);
}

/* ---------------- suspects + analysis ---------------- */
function suspectsPanel(ctx) {
  const panel = el('div', { class: 'panel' });
  panel.append(el('div', { class: 'panel__head', text: 'SUSPECT WRITING SAMPLES' }));
  const body = el('div', { class: 'toolpad', id: 'stylo-body' });

  SUSPECTS.forEach((s) => body.append(suspectCard(s, ctx)));

  body.append(el('div', { class: 'accuse mt-lg' }, [
    el('button', { class: 'btn btn--ghost', id: 'run-stylo', text: 'Run stylometric analysis',
      onClick: () => runAnalysis() }),
    el('button', { class: 'btn', id: 'accuse-btn', disabled: '', text: 'Name the author',
      onClick: () => accuse(ctx) }),
  ]));
  panel.append(body);
  return panel;
}

function suspectCard(s, ctx) {
  const card = el('button', { class: 'suspect', 'data-id': s.id, onClick: () => selectSuspect(s.id) }, [
    el('div', { class: 'suspect__top' }, [
      el('div', {}, [
        el('span', { class: 'suspect__name', text: s.name }),
        el('span', { class: 'suspect__role', text: s.role }),
      ]),
      el('span', { class: 'suspect__score', 'data-score': s.id, text: '' }),
    ]),
    el('pre', { class: 'suspect__sample', text: s.sample }),
    el('div', { class: 'suspect__note muted', text: s.note }),
    el('div', { class: 'suspect__bar' }, [el('div', { class: 'suspect__fill', 'data-fill': s.id, style: 'width:0%' })]),
  ]);
  return card;
}

function selectSuspect(id) {
  if (!analyzed) { toast('Run the analysis first, then accuse.', 'red'); return; }
  selected = id;
  document.querySelectorAll('.suspect').forEach((c) => c.classList.toggle('suspect--sel', c.dataset.id === id));
  document.querySelector('#accuse-btn').removeAttribute('disabled');
}

/* ---------------- the real stylometry ---------------- */
function runAnalysis() {
  if (analyzed) return;
  const noteFeat = features(RANSOM_NOTE);
  let max = 0;
  SUSPECTS.forEach((s) => {
    const f = features(s.sample);
    const sim = cosine(noteFeat.vec, f.vec);
    const shared = TELL_PHRASES.filter((p) => RANSOM_NOTE.toLowerCase().includes(p) && s.sample.toLowerCase().includes(p));
    scores[s.id] = { sim, feats: f, shared };
    max = Math.max(max, sim);
  });

  analyzed = true;
  document.querySelector('#run-stylo').setAttribute('disabled', '');
  document.querySelector('#run-stylo').textContent = '✓ analysis complete';

  // Render scores, scaled so the top match reads near 100%.
  SUSPECTS.forEach((s) => {
    const { sim, feats, shared } = scores[s.id];
    const pct = Math.round((sim / max) * 100);
    const scoreEl = document.querySelector(`[data-score="${s.id}"]`);
    const fillEl = document.querySelector(`[data-fill="${s.id}"]`);
    scoreEl.textContent = `${pct}% match`;
    const top = s.id === CORRECT_AUTHOR;
    scoreEl.classList.add(top ? 'suspect__score--hi' : 'suspect__score--lo');
    fillEl.style.width = `${pct}%`;
    fillEl.classList.add(top ? 'suspect__fill--hi' : 'suspect__fill--lo');
    // annotate features
    const note = document.querySelector(`.suspect[data-id="${s.id}"] .suspect__note`);
    note.textContent = `avg sentence ${feats.avgLen.toFixed(1)} words · ${feats.commaRate.toFixed(2)} commas/sentence · ${feats.exclRate.toFixed(2)} "!"/sentence` + (shared.length ? ` · shares: ${shared.map((p) => `"${p}"`).join(', ')}` : '');
    if (shared.length) note.classList.add('suspect__note--tell');
  });

  toast('Fingerprints computed. One sample matches the note’s cadence almost exactly.');
}

function features(text) {
  const lower = text.toLowerCase();
  const words = lower.match(/[a-z']+/g) || [];
  const total = words.length || 1;
  const counts = {};
  words.forEach((w) => { counts[w] = (counts[w] || 0) + 1; });
  const vec = FUNCTION_WORDS.map((fw) => (counts[fw] || 0) / total);

  const sentences = (text.match(/[.!?]+/g) || ['.']).length;
  const avgLen = total / sentences;
  const commaRate = ((text.match(/,/g) || []).length) / sentences;
  const exclRate = ((text.match(/!/g) || []).length) / sentences;

  // append normalised structural features so cadence counts, not just word freq
  vec.push(Math.min(avgLen / 30, 1), Math.min(commaRate / 4, 1), Math.min(exclRate / 4, 1));
  return { vec, avgLen, commaRate, exclRate };
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / (Math.sqrt(na) * Math.sqrt(nb)) : 0;
}

/* ---------------- accusation ---------------- */
function accuse(ctx) {
  if (!selected) return;
  if (selected !== CORRECT_AUTHOR) {
    const s = SUSPECTS.find((x) => x.id === selected);
    toast(`${s.name} doesn’t fit. Re-read the match scores - the note’s cadence points elsewhere.`, 'red');
    return;
  }
  ctx.complete({
    flagsCaught: 1, flagsTotal: 1,
    evidence: EVIDENCE,
    verdict: VERDICT,
    final: true,
  });
}

export default level;
