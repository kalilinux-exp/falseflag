// level3_password.js - the victim's password and the intel that cracks it.
// Sandboxed entirely to in-game data. This is a teaching visualization of WHY
// predictable passwords fail, not a tool aimed at any real system.

export const PASSWORD = 'N0rthw1nd2026!';

// Intel the player has gathered (from earlier stages) to reason out the password.
export const INTEL = [
  { label: 'Account holder', value: 'T. Okafor - held the publishing login' },
  { label: 'Recovered tell', value: 'reuses studio name + launch year for everything' },
  { label: 'Known habit', value: 'swaps letters for lookalikes (0 for o, 1 for i)' },
  { label: 'Policy', value: 'one symbol required - almost always “!” at the end' },
];

// Dictionary seeds the attack walks through (mutations applied in code).
export const WORDLIST = ['123456', 'password', 'qwerty', 'steam', 'dragon', 'indiedev', 'gamer', 'launch', 'okafor', 'northwind'];

export const EVIDENCE = [
  { id: 'ev_password', tag: 'CRACKED', label: 'Publishing login cracked',
    detail: 'Password was “N0rthw1nd2026!” - studio name + launch year + leetspeak. A dictionary attack found it in seconds.' },
  { id: 'ev_wordlist', tag: 'PATTERN', suspect: true, label: 'Attacker knew the studio',
    detail: 'The cracking dictionary was seeded with Northwind-internal terms (project names, staff handle). That is inside knowledge, not a random crew.' },
];

export const VERDICT = {
  kind: 'win',
  title: 'Credentials recovered',
  lines: [
    'With the publishing password cracked, the attacker walked straight into the account. It <i>looked</i> strong - 14 characters, symbols, numbers - but it was a dictionary word in disguise.',
    'The lesson the attacker exploited: <b>length and randomness beat clever substitutions.</b> And their wordlist already knew Northwind’s internal terms - another thread pointing inward.',
  ],
};

export const HINTS = [
  'You already recovered the pattern: studio name + launch year. Start from the studio’s name and apply the habits in the intel.',
  'Take “northwind”, swap letters for lookalikes (o→0, i→1), capitalize the first letter, add the launch year, and end with the required symbol.',
  'The password is N0rthw1nd2026! - or just run the dictionary attack and watch it fall. Then read why a random passphrase would have survived.',
];
