// level4_profile.js - OSINT. Correlate a reused alias across mock profiles.
import { el, clear, toast } from '../ui.js';
import { laptopFrame } from '../laptop.js';
import { icon } from '../icons.js';
import { QUERY, REQUIRED, PROFILES, EVIDENCE, VERDICT, HINTS } from '../data/level4_profiles.js';

const monogram = (p) => (p.platform || '?').charAt(0).toUpperCase();

const collected = new Set();
let selectedId = null;

const level = {
  id: 'profile',
  order: 4,
  codename: 'THE PROFILE',
  title: 'The Profile',
  skill: 'OSINT',
  icon: 'scope',
  status: 'live',
  objective: 'The payload leaked an alias - <b>gh0stwrjter</b> - and a username, <b>mdev</b>. Open each profile, <b>collect the clues</b> that connect them, then link the alias to a real person.',
  hints: HINTS,

  mount(root, ctx) {
    collected.clear(); selectedId = null;
    clear(root);
    root.append(
      objectiveBanner(level.objective),
      el('div', { class: 'fieldnote' }, [
        el('span', { class: 'fieldnote__tag', text: 'FIELD NOTE' }),
        el('span', { class: 'fieldnote__text', html: 'People <b>reuse handles, leak their timezone, and name their projects</b>. Cross-reference enough small details across accounts and an anonymous alias resolves to a real person. That is OSINT.' }),
      ]),
      // OSINT findings laid out as printed photos + a dossier folder on the desk
      searchBar(),
      el('div', { class: 'osint osint--board' }, [
        resultsPanel(root),
        el('div', { class: 'panel folder osint-detail', id: 'prof-detail' }, [emptyDetail()]),
      ]),
      correlationBar(ctx),
    );
  },
};

function objectiveBanner(html) {
  return el('div', { class: 'objective' }, [
    el('span', { class: 'objective__icon' }, [icon('scope')]),
    el('span', { class: 'objective__text', html }),
  ]);
}

function searchBar() {
  return el('div', { class: 'osint-search' }, [
    el('span', { class: 'osint-search__icon' }, [icon('search')]),
    el('input', { class: 'osint-search__input', value: QUERY, readonly: 'true', 'aria-label': 'Search query' }),
    el('span', { class: 'muted', text: `${PROFILES.length} results` }),
  ]);
}

function resultsPanel(root) {
  const list = el('div', { class: 'osint-results' });
  PROFILES.forEach((p) => list.append(profileRow(p, root)));
  return el('div', { class: 'panel' }, [
    el('div', { class: 'panel__head', text: 'SEARCH RESULTS' }),
    list,
  ]);
}

function profileRow(p, root) {
  return el('button', { class: 'profrow', 'data-id': p.id, onClick: () => selectProfile(p, root) }, [
    el('span', { class: 'profrow__av', text: monogram(p) }),
    el('span', {}, [
      el('span', { class: 'profrow__handle', text: `@${p.handle}` }),
      el('span', { class: 'profrow__plat', text: p.platform }),
    ]),
  ]);
}

function emptyDetail() {
  return el('div', { class: 'mailview__empty', text: 'Select a profile to inspect it.' });
}

function selectProfile(p, root) {
  selectedId = p.id;
  root.querySelectorAll('.profrow').forEach((r) => r.classList.toggle('profrow--active', r.dataset.id === p.id));
  const d = root.querySelector('#prof-detail');
  clear(d);

  const head = el('div', { class: 'osint-head' }, [
    el('span', { class: 'osint-head__av', text: monogram(p) }),
    el('div', {}, [
      el('div', { class: 'osint-head__handle', text: `@${p.handle}` }),
      el('div', { class: 'osint-head__plat', text: p.platform }),
    ]),
  ]);

  const meta = el('div', { class: 'osint-meta' });
  p.meta.forEach((m) => meta.append(el('div', { class: 'intel__row' }, [
    el('span', { class: 'intel__k', text: m.k }),
    el('span', { class: 'intel__v', text: m.v }),
  ])));

  const body = el('div', { class: 'toolpad' }, [head, meta]);

  if (p.repos?.length) {
    body.append(el('div', { class: 'panel__head', style: 'border:none;padding:12px 0 6px;', text: 'REPOSITORIES' }));
    const repos = el('div', { class: 'repos' });
    p.repos.forEach((r) => repos.append(el('span', { class: 'repo', text: r })));
    body.append(repos);
  }
  if (p.posts?.length) {
    body.append(el('div', { class: 'panel__head', style: 'border:none;padding:12px 0 6px;', text: 'POSTS' }));
    p.posts.forEach((post) => body.append(el('div', { class: 'osint-post', text: `“${post}”` })));
  }

  body.append(el('div', { class: 'panel__head', style: 'border:none;padding:14px 0 6px;', text: 'CLUES - click to collect' }));
  const clues = el('div', { class: 'clue-grid' });
  p.clues.forEach((c) => clues.append(clueBtn(c)));
  body.append(clues);

  d.append(body);
}

function clueBtn(c) {
  const got = collected.has(c.id);
  const btn = el('button', { class: `clue-btn ${got ? 'clue-btn--got' : ''}`, title: c.detail,
    onClick: () => {
      if (collected.has(c.id)) return;
      collected.add(c.id);
      btn.classList.add('clue-btn--got');
      btn.querySelector('.clue-btn__mark').textContent = '✓';
      toast(`Clue logged - ${c.label}`, REQUIRED.includes(c.id) ? '' : '');
      refreshCorrelate();
    } }, [
    el('span', { class: 'clue-btn__mark', text: got ? '✓' : '+' }),
    el('span', {}, [
      el('span', { class: 'clue-btn__label', text: c.label }),
      el('span', { class: 'clue-btn__detail', text: c.detail }),
    ]),
  ]);
  return btn;
}

function correlationBar(ctx) {
  const bar = el('div', { class: 'correlate', id: 'correlate' });
  bar.append(
    el('div', { class: 'correlate__status', id: 'correlate-status', 'aria-live': 'polite',
      text: progressText() }),
    el('button', { class: 'btn', id: 'correlate-btn', disabled: '', text: 'Link the identity',
      onClick: () => ctx.complete({
        flagsCaught: REQUIRED.filter((id) => collected.has(id)).length,
        flagsTotal: REQUIRED.length,
        evidence: EVIDENCE,
        verdict: VERDICT,
      }) }),
  );
  return bar;
}

function progressText() {
  const have = REQUIRED.filter((id) => collected.has(id)).length;
  return `Correlation: ${have}/${REQUIRED.length} key links found`;
}
function refreshCorrelate() {
  const status = document.querySelector('#correlate-status');
  const btn = document.querySelector('#correlate-btn');
  if (status) status.textContent = progressText();
  const ready = REQUIRED.every((id) => collected.has(id));
  if (btn) ready ? btn.removeAttribute('disabled') : btn.setAttribute('disabled', '');
  if (ready && status) status.textContent = 'All key links found - three accounts, one person. Link the identity.';
}

export default level;
