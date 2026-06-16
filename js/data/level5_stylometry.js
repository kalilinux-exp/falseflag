// level5_stylometry.js - the climax. The ransom note claims CRIMSON VEIL.
// Writing analysis proves who actually wrote it.

export const CORRECT_AUTHOR = 'devlin';

// Function words used to fingerprint authorship (style, not topic).
export const FUNCTION_WORDS = [
  'the', 'and', 'of', 'to', 'a', 'in', 'that', 'is', 'it', 'for',
  'as', 'with', 'but', 'we', 'you', 'would', 'not', 'if', 'i', 'are',
  'have', 'our', 'this', 'so', 'here',
];

// Rare giveaway phrases. Sharing these across two texts is a strong tell.
export const TELL_PHRASES = ['to be clear', 'frankly', 'that said', 'for good'];

export const RANSOM_NOTE = `To the management of Northwind Games. To be perfectly clear, your systems were compromised some time ago, and we have had access for far longer than you would care to know. We are reasonable people, and we would prefer to resolve this quietly, without further damage to your launch. Pay what we ask, and the account is returned, intact. Frankly, the choice is a simple one.

- CRIMSON VEIL`;

export const SUSPECTS = [
  {
    id: 'crimson', name: 'CRIMSON VEIL', role: 'The crew the note claims to be',
    sample: `WE ARE INSIDE. YOUR FILES ARE OURS NOW. PAY OR LOSE EVERYTHING. NO POLICE. NO TRICKS. THE CLOCK IS RUNNING. DO NOT TEST US!!!`,
    note: 'Known style from past extortion notes: shouted caps, no commas, threats stacked short.',
  },
  {
    id: 'okafor', name: 'T. Okafor', role: 'Lead dev, held the login',
    sample: `ok so the build is green again, pushed the hotfix. should be fine for launch. lmk if the staging box acts up and i'll restart it. coffee's on me if we actually ship on time lol`,
    note: 'Casual, lowercase, technical shorthand. Writes like chat.',
  },
  {
    id: 'devlin', name: 'M. Devlin', role: 'Contractor, set up account recovery',
    sample: `To be clear, I am not trying to step on anyone's toes here, and I do want this launch to go well. That said, the recovery process is fragile, and if it is handled carelessly, we could lose access for good. Frankly, I would feel a great deal better if I were the one handling it.`,
    note: 'Measured, comma-heavy, hedging openers. Internal email to the team.',
  },
  {
    id: 'reyes', name: 'D. Reyes', role: 'Ops manager, ran the incident bridge',
    sample: `Team. Status update. We locked the affected accounts at 9am. Forensics is engaged. No customer data confirmed exposed yet. I want hourly check-ins until this is closed. Keep it tight. Keep it quiet.`,
    note: 'Clipped, declarative, command tone. Short sentences, almost no commas.',
  },
];

export const EVIDENCE = [
  { id: 'ev_stylo', tag: 'STYLOMETRY', suspect: true, label: 'Note written by M. Devlin',
    detail: 'The ransom note’s fingerprint - function-word rhythm, sentence length, comma habit, the phrases "to be clear" and "frankly" - matches M. Devlin, not CRIMSON VEIL.' },
];

export const VERDICT = {
  kind: 'win',
  title: 'Case closed',
  lines: [
    'The note is signed CRIMSON VEIL, but it does not <i>read</i> like them. No shouting, no broken threats - it reads like a careful internal memo. Comma-heavy, hedged, with "to be clear" and "frankly" sitting exactly where M. Devlin puts them.',
    'CRIMSON VEIL was a costume. The breach came from inside Northwind, dressed up as a foreign crew to throw you off. That is the false flag - and you pulled it off.',
  ],
};

export const HINTS = [
  'Forget what the note says - look at HOW it is written. Real CRIMSON VEIL notes shout. This one writes in calm, comma-heavy sentences.',
  'Run the analysis. Compare sentence length, comma rate, and repeated phrases. One suspect writes in the exact same measured cadence as the note.',
  'It is M. Devlin. The note shares Devlin’s tells - "to be clear", "frankly", long hedged sentences. Select Devlin and make the accusation.',
];
