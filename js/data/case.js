// case.js - narrative spine for FALSE FLAG

export const CASE = {
  id: 'NW-0451',
  victim: 'Northwind Games',
  crew: 'CRIMSON VEIL',

  boot: [
    { text: 'FORENSIC RECONSTRUCTION UNIT', cls: 'dim', instant: true },
    { text: 'CASE INTAKE  ·  FILE NW-0451', cls: 'warn', delay: 360 },
    { text: '', instant: true, delay: 160 },
    { text: 'Incident logged .... 09:58, launch day.', cls: 'dim', delay: 240 },
    { text: 'Victim ............. Northwind Games.', cls: 'dim', delay: 220 },
    { text: 'Account ............ seized.', cls: 'dim', delay: 200 },
    { text: 'Ransom ............. posted, signed CRIMSON VEIL.', cls: 'warn', delay: 280 },
    { text: '', instant: true, delay: 160 },
    { text: 'Analyst assigned ... YOU.', cls: 'ok', delay: 260 },
    { text: '', instant: true, delay: 220 },
    { text: '>>  CASE OPENED', cls: 'warn', delay: 320 },
  ],

  briefing: {
    title: 'CASE FILE NW-0451 - NORTHWIND GAMES',
    meta: 'CLASSIFICATION: ACTIVE · CLEARANCE <span class="redact">XXXXXX</span> · ANALYST EYES ONLY · 02:14 LOCAL',
    body: [
      `At <span class="key">09:58</span> on launch day, Northwind Games lost control of its official publishing account. Forty minutes later - minutes before their first game went live - the account was used to deface the storefront and post a ransom demand.`,
      `The note is "signed" by <span class="danger">CRIMSON VEIL</span>, a hacking crew known for extortion. They are demanding payment to release the account.`,
      `Northwind has no security team. They have <span class="key">you</span> - a forensic analyst brought in to answer two questions: <b>how did the attacker get in</b>, and <b>who are they really?</b>`,
      `The trail is cold but intact. We will walk it <b>backward</b> - from the damage, through the break-in, to the person behind it. Five stages. Each one you clear pins its evidence to the board.`,
      `One more thing. The ransom note feels… rehearsed. Reconstruct the chain before you believe a word of it.`,
    ],
  },

  // suspects surface fully in Level 5 (stylometry); seeded here for continuity
  suspects: [
    { id: 'crimson', name: 'CRIMSON VEIL', note: 'The crew the ransom note claims to be.' },
    { id: 'devlin',  name: 'M. Devlin',   note: 'Northwind contractor. Left the studio inbox thread early.' },
    { id: 'okafor',  name: 'T. Okafor',   note: 'Lead developer. Held the publishing credentials.' },
  ],
};
