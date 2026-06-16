// level1_phish.js - email forensics. Find the entry vector, tag the red flags.
import { el, clear, toast } from '../ui.js';
import { icon } from '../icons.js';
import { EMAILS, RED_FLAGS, SOLUTION } from '../data/level1_emails.js';

let selectedId = null;
const checked = new Set();

const level = {
  id: 'phish',
  order: 1,
  codename: 'THE PHISH',
  title: 'The Phish',
  skill: 'EMAIL FORENSICS',
  icon: 'mail',
  status: 'live',
  objective: 'The break-in started with one email. Open each message, <b>inspect the sender, links and headers</b>, tag the red flags, then accuse the message that was the entry vector.',
  hints: [
    'Real companies don’t send account threats with a countdown. Re-read the headers, not just the body - one sender failed authentication.',
    'Compare each "From" name to the actual address behind it. Look very closely at the domain spelling - some letters are impostors.',
    'It’s the 09:09 "Steam Security" alert. The domain is rnicrosoft-steam.com (r-n faking an m), SPF failed, and the Reply-To jumps to a different domain. Check all six flags and accuse it.',
  ],

  mount(root, ctx) {
    selectedId = null;
    checked.clear();

    clear(root);
    root.append(
      objectiveBanner(level.objective),
      el('div', { class: 'inbox' }, [
        listPanel(root, ctx),
        el('div', { class: 'panel mailview', id: 'mailview' }, [emptyState()]),
      ]),
    );
  },
};

function objectiveBanner(html) {
  return el('div', { class: 'objective' }, [
    el('span', { class: 'objective__icon' }, [icon('mail')]),
    el('span', { class: 'objective__text', html }),
  ]);
}

function emptyState() {
  return el('div', { class: 'mailview__empty',
    text: 'Select a message from the studio inbox to begin your inspection.' });
}

function listPanel(root, ctx) {
  const list = el('div', { class: 'maillist' });
  EMAILS.forEach((m) => list.append(mailRow(m, root, ctx)));
  return el('div', { class: 'panel' }, [
    el('div', { class: 'panel__head', text: 'STUDIO INBOX - launch day' }),
    list,
  ]);
}

function mailRow(m, root, ctx) {
  const row = el('button', {
    class: 'mailrow', 'data-id': m.id,
    onClick: () => selectEmail(m, root, ctx),
  }, [
    el('span', { class: 'mailrow__from', text: m.fromName }),
    el('span', { class: 'mailrow__time', text: m.time }),
    el('span', { class: 'mailrow__subj', text: m.subject }),
  ]);
  return row;
}

function selectEmail(m, root, ctx) {
  selectedId = m.id;
  root.querySelectorAll('.mailrow').forEach((r) =>
    r.classList.toggle('mailrow--active', r.dataset.id === m.id));
  const view = root.querySelector('#mailview');
  clear(view);
  // The message itself renders as a printed sheet pulled from the case file;
  // the flag-tagging tool stays a dark desk control below it.
  view.append(
    el('div', { class: 'mailsheet' }, [
      el('span', { class: 'mailsheet__stamp', text: `PRINTED ${m.time}` }),
      mailHeader(m),
      mailBody(m),
    ]),
    flagSection(m, root, ctx),
  );
}

function inspect(text, tip) {
  return el('span', { class: 'inspect', title: tip, text });
}

function mailHeader(m) {
  const head = el('div', { class: 'mailhead' });
  head.append(el('h2', { class: 'mailhead__subj', text: m.subject }));

  // From: display name vs real address
  const realAddrTip = m.malicious
    ? 'Display name says "Steam Security" but the real domain is rnicrosoft-steam.com - a fake.'
    : 'Display name matches the real sending domain.';
  head.append(field('From', el('span', {}, [
    `${m.fromName}  `,
    inspect(`<${m.fromAddr}>`, realAddrTip),
  ])));

  // Reply-To (only meaningful when it differs)
  const replyDiffers = m.replyTo && m.replyTo.split('@')[1] !== m.fromAddr.split('@')[1];
  head.append(field('Reply-To', el('span', {}, [
    replyDiffers
      ? inspect(m.replyTo, 'Reply-To is on a different domain than From - replies would go to the attacker.')
      : m.replyTo,
  ])));

  // SPF banner
  const spf = el('span', { class: `spf ${m.spf === 'pass' ? 'spf--pass' : 'spf--fail'}`,
    text: `SPF ${m.spf.toUpperCase()}`,
    title: m.spf === 'pass'
      ? 'Sender authentication passed.'
      : 'SPF FAILED - this server is not authorized to send for that domain. Strong sign of forgery.' });
  head.append(field('Auth', spf));
  head.append(field('Time', m.time));
  return head;
}

function field(label, valNode) {
  return el('div', { class: 'field' }, [
    el('span', { class: 'field__label', text: label }),
    el('span', { class: 'field__val' }, [valNode]),
  ]);
}

function mailBody(m) {
  const body = el('div', { class: 'mailbody' });
  // Render body, swapping the [[LINK]] placeholder for an inspectable link.
  const text = m.body;
  if (text.includes('[[VERIFY ACCOUNT NOW]]') && m.links[0]) {
    const [before, after] = text.split('[[VERIFY ACCOUNT NOW]]');
    body.append(before);
    body.append(el('span', { class: 'reveal-link', text: 'VERIFY ACCOUNT NOW',
      title: `Link text is friendly, but it really points to: ${m.links[0].href}` }));
    body.append(after);
  } else {
    body.append(text);
    if (m.links[0]) {
      body.append(el('div', { class: 'mt' }, [
        el('span', { class: 'reveal-link', text: m.links[0].text,
          title: `Destination: ${m.links[0].href}` }),
      ]));
    }
  }
  return body;
}

function flagSection(m, root, ctx) {
  checked.clear();
  const wrap = el('div', { class: 'flagbar' });
  wrap.append(el('div', { class: 'flagbar__title', text: 'Tag the red flags you can prove in this message' }));

  const grid = el('div', { class: 'flags' });
  Object.entries(RED_FLAGS).forEach(([id, label]) => {
    const chk = el('label', { class: 'flagchk', 'data-flag': id,
      onClick: () => toggleFlag(chk, id) }, [
      el('span', { class: 'flagchk__box', text: '' }),
      el('span', { text: label }),
    ]);
    grid.append(chk);
  });
  wrap.append(grid);

  wrap.append(el('div', { class: 'accuse' }, [
    el('span', { class: 'accuse__hint', text: 'Tag the red flags you can prove, then make the call.' }),
    el('button', { class: 'btn', text: 'Accuse this message',
      onClick: () => accuse(m, ctx) }),
  ]));
  return wrap;
}

function toggleFlag(node, id) {
  if (checked.has(id)) { checked.delete(id); node.classList.remove('flagchk--on'); node.querySelector('.flagchk__box').textContent = ''; }
  else { checked.add(id); node.classList.add('flagchk--on'); node.querySelector('.flagchk__box').textContent = '✓'; }
}

function accuse(m, ctx) {
  if (!m.malicious) {
    toast(`<b>${m.fromName}</b> checks out. That message is legitimate - keep digging.`, 'red');
    return;
  }
  // Correctly identified flags vs the six that truly apply to the phish.
  const correct = SOLUTION.flags.filter((f) => checked.has(f)).length;
  const total = SOLUTION.flags.length;

  // Anti-rush: an accusation needs evidence. Demand most of the red flags first.
  if (correct < 4) {
    toast(`You've only proven ${correct} red flag${correct === 1 ? '' : 's'}. Inspect the sender, headers and link, and tag at least 4 before you accuse.`, 'red');
    return;
  }

  ctx.complete({
    flagsCaught: correct,
    flagsTotal: total,
    evidence: [
      { id: 'ev_entry', tag: 'ENTRY VECTOR', label: 'Spoofed “Steam Security” email',
        detail: 'rnicrosoft-steam.com (r-n faking m), SPF fail, fake 24h deadline. The phish that opened the door.' },
      { id: 'ev_insider_seed', tag: 'ANOMALY', suspect: true, label: 'Someone knew the recovery flow',
        detail: 'A studio insider volunteered they personally “set up” account recovery. Filed for later.' },
    ],
    verdict: {
      kind: 'win',
      title: 'Entry vector confirmed',
      lines: [
        `You caught <b>${correct} of ${total}</b> red flags.`,
        `The attacker used a spoofed Steam security alert to harvest the publishing login. That email carried an attachment - and that’s where the trail goes next.`,
      ],
    },
  });
}

export default level;
