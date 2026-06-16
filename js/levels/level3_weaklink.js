// level3_weaklink.js - password hygiene. Teach WHY predictable passwords fall,
// then make the analyst reconstruct it from the rules. The cracker only teaches;
// it never completes the stage for you. Real SHA-256 via Web Crypto.
import { el, clear, toast } from '../ui.js';
import { laptopFrame } from '../laptop.js';
import { icon } from '../icons.js';
import { PASSWORD, INTEL, WORDLIST, EVIDENCE, VERDICT, HINTS } from '../data/level3_password.js';

let targetHash = '';
let usedEngine = false;
let solved = false;

const level = {
  id: 'weaklink',
  order: 3,
  codename: 'THE WEAK LINK',
  title: 'The Weak Link',
  skill: 'PASSWORD HYGIENE',
  icon: 'key',
  status: 'live',
  objective: 'The attacker walked in through the password. Learn why it was weak, watch a dictionary attack prove it - then <b>reconstruct the password yourself</b> from the rules to log the credential.',
  hints: HINTS,

  mount(root, ctx) {
    usedEngine = false; solved = false;
    clear(root);
    root.append(
      objectiveBanner(level.objective),
      fieldNote('A password is weak when it is <b>predictable</b>. Attackers don’t guess at random - they run dictionaries of common words plus your obvious details (company name, year) with simple letter swaps. If yours is a word with a number on the end, it is already on a list.'),
      // the cracking is digital forensics — it runs on the analyst's laptop on the desk
      laptopFrame([
        el('div', { class: 'crack-console' }, [targetPanel(ctx), attackPanel(ctx)]),
        el('div', { id: 'crack-result' }),
      ], 'credential-analysis'),
    );
    sha256(PASSWORD).then((h) => { targetHash = h; const n = root.querySelector('#target-hash'); if (n) n.textContent = h; });
  },
};

/* ---------------- shared ---------------- */
function objectiveBanner(html) {
  return el('div', { class: 'objective' }, [el('span', { class: 'objective__icon' }, [icon('key')]), el('span', { class: 'objective__text', html })]);
}
function fieldNote(html) {
  return el('div', { class: 'fieldnote' }, [el('span', { class: 'fieldnote__tag', text: 'FIELD NOTE' }), el('span', { class: 'fieldnote__text', html })]);
}

/* ---------------- left: target + rules + reconstruct ---------------- */
function targetPanel(ctx) {
  const panel = el('div', { class: 'panel' });
  panel.append(el('div', { class: 'panel__head', text: 'CAPTURED CREDENTIAL HASH' }));
  const body = el('div', { class: 'toolpad' });
  body.append(
    el('div', { class: 'hash-box', id: 'target-hash', 'aria-hidden': 'true', text: 'computing…' }),
    el('div', { class: 'panel__head', style: 'border:none;padding:14px 0 8px;', text: 'THE RULES THEY FOLLOW' }),
  );
  const intel = el('ul', { class: 'intel' });
  INTEL.forEach((row) => intel.append(el('li', { class: 'intel__row' }, [
    el('span', { class: 'intel__k', text: row.label }),
    el('span', { class: 'intel__v', text: row.value }),
  ])));
  body.append(intel);

  const input = el('input', { class: 'pw-input', id: 'pw-guess', type: 'text', autocomplete: 'off', spellcheck: 'false', placeholder: 'apply the rules…', 'aria-label': 'Reconstruct the password' });
  const status = el('div', { class: 'crack-status', id: 'guess-status', 'aria-live': 'polite' });
  const form = el('form', { class: 'pw-form', onSubmit: async (e) => {
    e.preventDefault();
    const guess = input.value.trim();
    if (!guess) return;
    const h = await sha256(guess);
    if (h === targetHash) {
      status.textContent = 'Hash match - that is the password.'; status.className = 'crack-status crack-status--ok';
      solveManually(ctx, guess);
    } else {
      status.textContent = 'No match. Apply all four rules: studio name, leetspeak swaps, the launch year, then the symbol.'; status.className = 'crack-status crack-status--bad';
      toast('No match. Each rule on the left is a step - use every one.', 'red');
    }
  } }, [
    el('label', { class: 'pw-label', for: 'pw-guess', text: 'Reconstruct the password' }),
    el('div', { class: 'pw-row' }, [input, el('button', { class: 'btn', type: 'submit', text: 'Test' })]),
  ]);
  body.append(form, status);
  panel.append(body);
  return panel;
}

/* ---------------- right: dictionary attack (teaching demo) ---------------- */
function attackPanel(ctx) {
  const panel = el('div', { class: 'panel' });
  panel.append(el('div', { class: 'panel__head', text: 'DICTIONARY ATTACK · DEMO' }));
  const body = el('div', { class: 'toolpad' });
  const counters = el('div', { class: 'counters' }, [
    counter('GUESSES', '0', 'c-guesses'), counter('ELAPSED', '0.00s', 'c-time'), counter('STATUS', 'armed', 'c-status'),
  ]);
  const log = el('ol', { class: 'crack-log', id: 'crack-log', 'aria-live': 'off' });
  const status = el('div', { class: 'crack-status', id: 'engine-status', 'aria-live': 'polite' });
  const runBtn = el('button', { class: 'btn btn--ghost', id: 'run-btn', text: 'Run dictionary attack', onClick: () => runEngine(ctx, runBtn) });
  body.append(counters, el('div', { class: 'mt' }, [runBtn]), el('div', { class: 'faint mt', style: 'font-size:12px', text: 'Proves how fast it falls. You still reconstruct it on the left to log it.' }), log, status);
  panel.append(body);
  return panel;
}
function counter(label, val, id) {
  return el('div', { class: 'counter' }, [el('div', { class: 'counter__v', id, text: val }), el('div', { class: 'counter__k', text: label })]);
}

async function runEngine(ctx, runBtn) {
  if (runBtn.disabled) return;
  usedEngine = true;
  runBtn.setAttribute('disabled', ''); runBtn.textContent = 'running…';
  const log = document.querySelector('#crack-log');
  const cGuesses = document.querySelector('#c-guesses'), cTime = document.querySelector('#c-time'), cStatus = document.querySelector('#c-status'), engStatus = document.querySelector('#engine-status');
  clear(log); cStatus.textContent = 'running';
  const candidates = buildCandidates();
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  let guesses = 0;
  for (let i = 0; i < candidates.length; i++) {
    const cand = candidates[i];
    const h = await sha256(cand);                 // real SHA-256 of every guess
    const hit = h === targetHash;                 // compared to the captured hash, not the plaintext
    guesses++;
    cGuesses.textContent = guesses.toLocaleString();
    cTime.textContent = ((performance.now() - t0) / 1000).toFixed(2) + 's';
    log.prepend(el('li', { class: `crack-row ${hit ? 'crack-row--hit' : ''}` }, [
      el('span', { class: 'crack-row__pw', text: cand }),
      el('span', { class: 'crack-row__hash', 'aria-hidden': 'true', text: hit ? 'MATCH' : h.slice(0, 10) }),
      el('span', { class: 'crack-row__mark', text: hit ? '✓' : '✗' }),
    ]));
    if (hit) {
      cStatus.textContent = 'CRACKED';
      runBtn.textContent = 'cracked';
      engStatus.textContent = `Cracked in ${guesses} hash${guesses === 1 ? '' : 'es'} (${cTime.textContent}) - each guess SHA-256'd and checked against the captured hash. A dictionary word in disguise.`;
      revealDemo(ctx, cand);
      break;
    }
    if (!reduce) await sleep(45);
  }
}

/* ---------------- result + lesson ---------------- */
function lessonBlock() {
  return [
    lessonBar('This password', 'Looks strong (94¹⁴ ≈ 4×10²⁷ combos)… but it is a dictionary word + leetspeak, so a rules-based attack finds it almost instantly.', 8, 'bad', '~1.2 seconds'),
    lessonBar('A random passphrase', '“river-cobalt-anchor-mellow-quartz-drift” - six random words, no dictionary shortcut. The same attack would have to brute-force the whole space.', 99, 'good', '~600,000 years'),
    el('p', { class: 'faint mt', html: 'Estimated at 10 billion guesses/sec. The takeaway: <b>length and randomness beat clever substitutions.</b>' }),
  ];
}
function revealDemo(ctx, pw) {
  if (solved) return;
  const wrap = document.querySelector('#crack-result'); clear(wrap);
  wrap.append(el('div', { class: 'panel mt-lg' }, [
    el('div', { class: 'panel__head', text: 'WHY IT FELL - AND WHAT WOULD NOT' }),
    el('div', { class: 'toolpad' }, [
      el('p', { html: `The dictionary attack found: <b class="pw-reveal">${pw}</b>. That is the point - it was guessable.` }),
      ...lessonBlock(),
      el('p', { class: 'accuse__hint mt', html: 'Now <b>reconstruct it on the left</b> and hit Test to log the credential.' }),
    ]),
  ]));
  wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function solveManually(ctx, pw) {
  if (solved) return; solved = true;
  const wrap = document.querySelector('#crack-result'); clear(wrap);
  wrap.append(el('div', { class: 'panel mt-lg' }, [
    el('div', { class: 'panel__head', text: 'WHY IT FELL - AND WHAT WOULD NOT' }),
    el('div', { class: 'toolpad' }, [
      el('p', { html: usedEngine ? `Logged: <b class="pw-reveal">${pw}</b>.` : `You reconstructed it from the rules: <b class="pw-reveal">${pw}</b>. Sharp.` }),
      ...lessonBlock(),
      el('div', { class: 'accuse mt' }, [
        el('span', { class: 'accuse__hint', text: usedEngine ? 'You leaned on the cracker - same result the attacker got.' : 'Reasoned by hand. Top marks.' }),
        el('button', { class: 'btn', text: 'Log credential & continue', onClick: () => ctx.complete({ flagsCaught: 2, flagsTotal: 2, evidence: EVIDENCE, verdict: VERDICT }) }),
      ]),
    ]),
  ]));
  wrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function lessonBar(title, desc, pct, kind, time) {
  return el('div', { class: 'lesson' }, [
    el('div', { class: 'lesson__top' }, [el('span', { class: 'lesson__title', text: title }), el('span', { class: `lesson__time lesson__time--${kind}`, text: time })]),
    el('div', { class: 'lesson__track' }, [el('div', { class: `lesson__fill lesson__fill--${kind}`, style: `width:${pct}%` })]),
    el('div', { class: 'lesson__desc muted', html: desc }),
  ]);
}

/* ---------------- helpers ---------------- */
const leet = (s) => s.replace(/o/gi, '0').replace(/i/gi, '1').replace(/e/gi, '3').replace(/a/gi, '4').replace(/s/gi, '5');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function buildCandidates() {
  const out = [];
  for (const base of WORDLIST) {
    out.push(base, base + '2026', cap(base));
    const l = cap(leet(base));
    out.push(l, l + '2026', l + '2026' + '!');
  }
  const uniq = [...new Set(out)].filter((c) => c !== PASSWORD);
  uniq.push(PASSWORD);
  return uniq;
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default level;
