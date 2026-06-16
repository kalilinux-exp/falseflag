// level4_profiles.js - fabricated OSINT profiles (no real people).
// Player correlates the recovered alias "gh0stwrjter" + username "mdev".

export const QUERY = 'gh0stwrjter';

// Clues that must be collected to unlock the correlation.
export const REQUIRED = ['handle_reuse', 'cross_link', 'timezone', 'nw_repo'];

export const PROFILES = [
  {
    id: 'devforum', platform: 'DevForum', handle: 'gh0stwrjter',
    meta: [
      { k: 'Joined', v: '2024-03' },
      { k: 'Bio', v: 'red-team hobbyist · GMT−5 · recon nerd' },
      { k: 'Website', v: 'git.dev/mdev-nw' },
    ],
    posts: ['anyone ever mirrored the northwind staging box? asking for a friend...'],
    clues: [
      { id: 'timezone', label: 'Timezone leak - GMT−5', detail: 'Bio lists GMT−5 (Eastern) - the studio’s zone, not an overseas crew’s.' },
      { id: 'cross_link', label: 'Links to “mdev-nw”', detail: 'Alias website points to git.dev/mdev-nw - ties gh0stwrjter to the username “mdev”.' },
    ],
  },
  {
    id: 'githost', platform: 'git.dev', handle: 'mdev-nw', name: 'mdev',
    meta: [
      { k: 'Name', v: 'mdev' },
      { k: 'Location', v: 'Eastern US' },
      { k: 'Commits as', v: 'M. Devlin <md@…>' },
    ],
    repos: ['northwind-tools (mirror)', 'recon-scripts', 'dotfiles'],
    clues: [
      { id: 'nw_repo', label: 'Repo: northwind-tools', detail: 'A private mirror of Northwind’s internal tooling - that is insider access.' },
      { id: 'realname', label: 'Commit name - M. Devlin', detail: 'Commits authored by “M. Devlin”. The real name behind the mask.' },
    ],
  },
  {
    id: 'gaming', platform: 'PlayHub', handle: 'gh0stwrjter',
    meta: [
      { k: 'Status', v: 'online · 2h ago' },
      { k: 'Friends', v: 'okafor_dev, northwind_official' },
    ],
    posts: [],
    clues: [
      { id: 'handle_reuse', label: 'Same handle as DevForum', detail: '“gh0stwrjter” reused here - handle reuse links the two accounts to one person.' },
      { id: 'victim_link', label: 'Friends with okafor_dev', detail: 'Connected to T. Okafor - the account holder who got phished.' },
    ],
  },
];

export const EVIDENCE = [
  { id: 'ev_alias', tag: 'PROFILE', label: 'Alias network mapped',
    detail: 'gh0stwrjter (DevForum, PlayHub) ↔ mdev-nw (git.dev). One person - Eastern TZ, mirrors Northwind tooling, friends with the victim.' },
  { id: 'ev_identity', tag: 'IDENTITY', suspect: true, label: 'Trail → M. Devlin',
    detail: 'The reused alias resolves to M. Devlin: Eastern timezone, Northwind-internal repos, connected to the victim. The “foreign crew” is a local insider.' },
];

export const VERDICT = {
  kind: 'win',
  title: 'Mask removed',
  lines: [
    'Three profiles, one person. The alias the ransom note hid behind belongs to <b>M. Devlin</b> - Eastern timezone, mirroring Northwind’s own tooling, friends with the victim.',
    'CRIMSON VEIL was never overseas. But a name is not proof - Devlin will say the account was stolen. The final stage proves who actually <i>wrote</i> the ransom note.',
  ],
};

export const HINTS = [
  'Open every profile in the results. Bios, repos, and friend lists leak more than people realize.',
  'Same handle on two sites = same person. Follow the alias’s website link to the git account, and note the timezone and the repo names.',
  'Collect: handle reuse (PlayHub), the link to mdev-nw + GMT−5 (DevForum), and the northwind-tools repo (git.dev). Then “Link the identity” → M. Devlin.',
];
