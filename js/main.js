// main.js - orchestrator: boot -> title -> briefing -> attack-chain map -> levels
import { State } from './state.js';
import { $, el, clear, typeLines, openModal, closeModal, toast, toTop } from './ui.js';
import { CASE } from './data/case.js';
import { LEVELS, getLevel } from './levels/registry.js';
import { openBoard } from './board.js';
import { openHints } from './hints.js';
import { icon } from './icons.js';
import { DEBRIEF } from './data/debrief.js';

const app = $('#app');

function init() {
  State.init();
  wireStatusBar();
  refreshStatusBar();
  // Resume mid-case if there's progress; otherwise boot fresh.
  if (State.data.started && State.evidenceCount > 0) renderChain();
  else if (State.data.started) renderChain();
  else renderTitle();
}

/* ---------------- status bar ---------------- */
function wireStatusBar() {
  $('#btn-board').addEventListener('click', openBoard);
  $('#btn-reset').addEventListener('click', confirmReset);
  State.subscribe(refreshStatusBar);
}
function refreshStatusBar() {
  const bar = $('#statusbar');
  bar.classList.toggle('hidden', !State.data.started);
  $('#evidence-count').textContent = State.evidenceCount;
}
function confirmReset() {
  const body = el('div', {}, [
    el('div', { class: 'sheet__kicker', text: 'DANGER' }),
    el('h3', { text: 'Reset the entire case?' }),
    el('p', { text: 'This wipes all recovered evidence, solved levels and your analyst rating. Start from boot.' }),
    el('div', { class: 'sheet__actions' }, [
      el('button', { class: 'btn btn--ghost', text: 'Keep working', onClick: () => closeModal() }),
      el('button', { class: 'btn btn--danger', text: 'Reset case', onClick: () => {
        State.reset(); closeModal(); renderTitle();
      } }),
    ]),
  ]);
  openModal(body);
}

/* ---------------- boot ---------------- */
async function renderBoot() {
  clear(app);
  const boot = el('div', { class: 'boot' });
  app.append(boot);
  await typeLines(boot, CASE.boot, { speed: 14 });
  setTimeout(renderTitle, 500);
}

/* ---------------- title ---------------- */
function renderTitle() {
  clear(app);
  app.append(el('div', { class: 'title' }, [
    // scattered desk props behind the file
    el('span', { class: 'prop prop--ring', 'aria-hidden': 'true' }),
    el('span', { class: 'prop prop--photo', 'aria-hidden': 'true' }),
    // the case file itself — a kraft folder on the desk
    el('div', { class: 'casefile' }, [
      el('span', { class: 'casefile__tab', text: 'CASE FILE' }),
      el('span', { class: 'casefile__clip', 'aria-hidden': 'true' }),
      el('span', { class: 'stamp stamp--classified', text: 'CLASSIFIED' }),
      el('div', { class: 'title__kicker', text: 'FORENSIC RECONSTRUCTION UNIT' }),
      el('h1', { class: 'title__logo', text: 'FALSE FLAG' }),
      el('div', { class: 'title__sub', text: 'reconstruct the breach · unmask the liar' }),
      el('p', { class: 'title__tag', text:
        'A studio was hijacked on launch day. The ransom note names a famous hacking crew. Walk the attack chain backward, stage by stage - and find out who’s really behind the mask.' }),
      el('div', { class: 'reveal', style: 'animation-delay: 1.5s' }, [
        el('button', { class: 'btn btn--lg', text: '▶ Open case file', onClick: () => { State.begin(); renderBriefing(); } }),
      ]),
      el('div', { class: 'title__meta reveal', style: 'animation-delay: 2.1s', text: 'CASE #NW-0451 · 5 STAGES · BUILT BY KALIXTE PETROF' }),
    ]),
  ]));
  toTop();
}

/* ---------------- briefing ---------------- */
function renderBriefing() {
  clear(app);
  const b = CASE.briefing;
  app.append(el('div', { class: 'dossier' }, [
    el('div', { class: 'dossier__stamp', text: 'CONFIDENTIAL' }),
    el('div', { class: 'doc' }, [
      el('span', { class: 'stamp stamp--reviewed', text: 'REVIEWED' }),
      el('h1', { text: b.title }),
      el('div', { class: 'doc__meta', html: b.meta }),
      ...b.body.map((p) => el('p', { html: p })),
    ]),
    el('div', { class: 'tcenter mt-lg reveal', style: 'animation-delay: 2.5s' }, [
      el('button', { class: 'btn btn--lg', text: 'Begin reconstruction ▸', onClick: renderChain }),
    ]),
  ]));
  toTop();
}

/* ---------------- attack-chain map ---------------- */
function renderChain() {
  clear(app);
  const solvedCount = LEVELS.filter((l) => State.isSolved(l.id)).length;

  const nodes = el('div', { class: 'nodes' });
  LEVELS.forEach((lvl) => nodes.append(chainNode(lvl)));

  const allDone = LEVELS.every((l) => State.isSolved(l.id));

  app.append(el('div', { class: 'chain' }, [
    el('div', { class: 'chain__head' }, [
      el('h2', { text: 'THE ATTACK CHAIN' }),
      el('p', { text: 'We reconstruct it backward - from the damage to the attacker. Clear each stage to unlock the next.' }),
      el('div', { class: 'chain__progress mt', text: `PROGRESS: ${solvedCount} / ${LEVELS.length} STAGES RECONSTRUCTED` }),
    ]),
    nodes,
    el('div', { class: 'chain__cta' }, [
      el('button', { class: 'sbtn', onClick: openBoard }, [icon('board'), 'View evidence board']),
    ]),
    allDone ? el('div', { class: 'tcenter mt-lg' }, [
      el('button', { class: 'btn btn--lg', text: 'See your analyst rating', onClick: renderCaseClosed }),
    ]) : null,
  ]));
  toTop();
}

function chainNode(lvl) {
  const solved = State.isSolved(lvl.id);
  const unlocked = State.isUnlocked(lvl, LEVELS);
  const live = lvl.status === 'live';

  let statusEl, cls = 'node', clickable = false;
  if (solved) { statusEl = ['st--done', 'RECONSTRUCTED']; cls += ' node--done'; clickable = true; }
  else if (!unlocked) { statusEl = ['st--locked', 'LOCKED']; cls += ' node--locked'; }
  else if (live) { statusEl = ['st--ready', 'READY']; clickable = true; }
  else { statusEl = ['st--soon', 'SEALED']; cls += ' node--locked'; }

  const node = el('button', {
    class: cls,
    onClick: () => {
      if (!unlocked) return toast('Reconstruct the earlier stage first.', 'red');
      if (live) startLevel(lvl);
      else toast(`“${lvl.title}” - ${lvl.skill}. This stage is sealed in this build.`, '');
    },
  }, [
    el('div', { class: 'node__icon' }, [icon(lvl.icon)]),
    el('div', {}, [
      el('div', { class: 'node__order', text: `STAGE 0${lvl.order}` }),
      el('div', { class: 'node__title', text: lvl.title }),
      el('div', { class: 'node__skill', text: lvl.skill }),
      lvl.teaser && !live ? el('div', { class: 'muted', style: 'font-size:12px;margin-top:4px', text: lvl.teaser }) : null,
    ]),
    el('span', { class: `node__status ${statusEl[0]}`, text: statusEl[1] }),
  ]);
  return node;
}

/* ---------------- level frame ---------------- */
function startLevel(lvl) {
  clear(app);
  const body = el('div', { id: 'level-body' });
  app.append(el('div', { class: 'level' }, [
    el('div', { class: 'level__bar' }, [
      el('div', {}, [
        el('div', { class: 'level__id', text: `STAGE 0${lvl.order} · ${lvl.codename}` }),
        el('div', { class: 'level__title', text: lvl.title }),
        el('div', { class: 'level__skill', text: lvl.skill }),
      ]),
      el('div', { class: 'level__actions' }, [
        el('button', { class: 'sbtn sbtn--ghost', text: '‹ Case files', onClick: renderChain }),
        el('button', { class: 'sbtn', onClick: () => openHints(lvl) }, [icon('search'), 'Hint']),
      ]),
    ]),
    body,
  ]));

  const ctx = {
    level: lvl,
    complete: (result) => completeLevel(lvl, result),
  };
  lvl.mount(body, ctx);
  toTop();
}

function completeLevel(lvl, result) {
  if (result.flagsTotal) State.recordFlags(result.flagsCaught || 0, result.flagsTotal);
  (result.evidence || []).forEach((ev) => State.collect(ev));
  State.solve(lvl.id);
  showVerdict(lvl, result.verdict);
}

/* ---------------- verdict modal ---------------- */
function showVerdict(lvl, verdict = {}) {
  const win = verdict.kind !== 'fail';
  const next = LEVELS.find((l) => l.order === lvl.order + 1);
  const isLast = !next;

  const body = el('div', { class: `verdict ${win ? 'verdict--win' : ''}` }, [
    el('div', { class: 'verdict__icon' }, [icon(win ? 'check' : 'alert')]),
    el('div', { class: 'sheet__kicker', text: win ? (isLast ? 'CASE CLOSED' : 'STAGE RECONSTRUCTED') : 'NOT QUITE' }),
    el('h3', { text: verdict.title || (win ? 'Solved' : 'Try again') }),
    ...(verdict.lines || []).map((t) => el('p', { html: t })),
    ...(win && DEBRIEF[lvl.id] ? [debriefBlock(DEBRIEF[lvl.id])] : []),
    el('p', { class: 'faint', html: `New evidence pinned to the board - see <b>EVIDENCE</b> in the top bar.` }),
    el('div', { class: 'sheet__actions' }, [
      el('button', { class: 'btn btn--ghost', text: 'View board', onClick: () => { closeModal(); openBoard(); } }),
      isLast
        ? el('button', { class: 'btn', text: 'See your rating ▸', onClick: () => { closeModal(); renderCaseClosed(); } })
        : el('button', { class: 'btn', text: `Next: ${next.title} ▸`,
            onClick: () => { closeModal(); startLevel(next); } }),
    ]),
  ]);
  openModal(body, { onClose: refreshStatusBar });
}

// the "in the real world" card that turns a solved stage into a takeaway lesson
function debriefBlock(d) {
  return el('div', { class: 'debrief' }, [
    el('div', { class: 'debrief__kicker', text: 'In the real world' }),
    el('div', { class: 'debrief__concept', text: d.concept }),
    el('div', { class: 'debrief__text', html: d.text }),
    el('div', { class: 'debrief__case', html: d.realcase }),
  ]);
}

/* ---------------- case closed / analyst rating ---------------- */
function renderCaseClosed() {
  clear(app);
  const r = State.rating();
  const { hintsUsed, flagsCaught, flagsTotal } = State.data;
  const accuracy = flagsTotal ? Math.round((flagsCaught / flagsTotal) * 100) : 100;

  app.append(el('div', { class: 'closed' }, [
    el('div', { class: 'closed__kicker', text: 'CASE #NW-0451 · RESOLVED' }),
    el('h1', { class: 'closed__title', text: 'CASE CLOSED' }),
    el('p', { class: 'closed__culprit', html: 'The breach was an inside job. CRIMSON VEIL was a false flag. The attacker was <b>M. Devlin</b>.' }),
    el('div', { class: 'closed__rank' }, [
      el('div', { class: 'closed__grade', text: r.rank }),
      el('div', { class: 'closed__label', text: r.label }),
    ]),
    el('div', { class: 'closed__stats' }, [
      stat(`${flagsCaught}/${flagsTotal}`, 'RED FLAGS CAUGHT'),
      stat(`${accuracy}%`, 'ACCURACY'),
      stat(`${hintsUsed}`, 'HINTS USED'),
      stat(`${State.evidenceCount}`, 'CLUES RECOVERED'),
    ]),
    el('p', { class: 'closed__lesson muted', html: 'You just walked a real intrusion backward: <b>phishing → payload → credentials → identity → attribution</b>. That is the anatomy of a breach.' }),
    el('div', { class: 'closed__actions' }, [
      el('button', { class: 'btn btn--ghost', onClick: openBoard }, [icon('board'), 'Review evidence board']),
      el('button', { class: 'btn btn--lg', text: 'Run the case again', onClick: () => { State.reset(); renderTitle(); } }),
    ]),
    el('div', { class: 'closed__sig', text: 'FALSE FLAG · a forensic game by Kalixte Petrof' }),
  ]));
  toTop();
}
function stat(value, label) {
  return el('div', { class: 'closed__stat' }, [
    el('div', { class: 'closed__stat-v', text: value }),
    el('div', { class: 'closed__stat-k', text: label }),
  ]);
}

init();
