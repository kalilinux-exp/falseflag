// level2_payload.js - the malicious attachment. A clue is hidden in the pixels.

// The message embedded in the image's least-significant bits (recovered at runtime).
export const SECRET = `-- staging drop OK --
host: stg-07.veil-net.ru
beacon: 600s
note: target reuses studio name + launch year for everything. lazy. cracked the login in minutes.
forum handle: gh0stwrjter   (ROTATE before payout)
-- end --`;

// Fabricated EXIF metadata. Suspicious fields are flagged for the inspector.
export const EXIF = [
  { key: 'File name',  value: 'launch_keyart_final.png' },
  { key: 'Format',     value: 'PNG · truecolor · 8-bit/channel' },
  { key: 'Dimensions', value: '260 × 150' },
  { key: 'Software',   value: 'GIMP 2.10.36 (Windows)' },
  { key: 'Author',     value: 'mdev', suspicious: true,
    note: 'A username - and not one of the public Northwind accounts. Internal handle?' },
  { key: 'Created',    value: '2026-06-11  23:14:07', suspicious: true,
    note: 'The night BEFORE the breach. This payload was prepared in advance.' },
  { key: 'Time zone',  value: 'UTC−05:00 (Eastern)', suspicious: true,
    note: 'The studio is in Eastern time. The author was local - not an overseas crew.' },
  { key: 'Comment',    value: '-' },
];

export const EVIDENCE = [
  { id: 'ev_payload', tag: 'PAYLOAD', label: 'Hidden note inside the PNG',
    detail: 'LSB-embedded staging note: host stg-07.veil-net.ru, alias “gh0stwrjter”, and a tell - “target reuses studio name + launch year.”' },
  { id: 'ev_exif_author', tag: 'METADATA', suspect: true, label: 'Built in-house, night before',
    detail: 'EXIF author “mdev”, Eastern time zone, created 23:14 the night before launch. Prepared from the inside.' },
];

export const VERDICT = {
  kind: 'win',
  title: 'Payload decoded',
  lines: [
    'You pulled a hidden note out of the image’s least-significant bits - and the metadata says the file was built in-house the night before.',
    'Two leads fall out of this: a <b>password tell</b> (“reuses studio name + launch year”) and an <b>alias</b> (“gh0stwrjter”). The next stage tests that password.',
  ],
};
