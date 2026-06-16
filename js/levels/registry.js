// registry.js - ordered attack chain. Live levels mount; sealed levels are previews.
import level1 from './level1_phish.js';
import level2 from './level2_payload.js';
import level3 from './level3_weaklink.js';
import level4 from './level4_profile.js';
import level5 from './level5_falseflag.js';

export const LEVELS = [
  level1,
  level2,
  level3,
  level4,
  level5,
];

export const getLevel = (id) => LEVELS.find((l) => l.id === id);
