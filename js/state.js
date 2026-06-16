// state.js - single source of truth for case progress (persisted to localStorage)

const STORAGE_KEY = 'falseflag_save_v2';

const listeners = new Set();

const blank = () => ({
  started: false,
  evidence: [],      // { id, tag, label, detail, suspect? }
  solved: [],        // [levelId]
  hintsUsed: 0,
  flagsCaught: 0,
  flagsTotal: 0,
  accusedInsider: false,
});

export const State = {
  data: blank(),

  init() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.data = { ...blank(), ...JSON.parse(raw) };
    } catch { /* ignore corrupt saves */ }
    return this;
  },

  /* subscriptions */
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  _emit() { this._save(); listeners.forEach((fn) => fn(this.data)); },
  _save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data)); } catch {} },

  /* lifecycle */
  begin() { this.data.started = true; this._emit(); },
  reset() { this.data = blank(); this._emit(); },

  /* evidence */
  collect(item) {
    if (this.data.evidence.some((e) => e.id === item.id)) return false;
    this.data.evidence.push(item);
    this._emit();
    return true;
  },
  hasEvidence(id) { return this.data.evidence.some((e) => e.id === id); },
  get evidence() { return this.data.evidence; },
  get evidenceCount() { return this.data.evidence.length; },

  /* hints + scoring */
  useHint() { this.data.hintsUsed += 1; this._emit(); },
  recordFlags(caught, total) {
    this.data.flagsCaught += caught;
    this.data.flagsTotal += total;
    this._emit();
  },

  /* levels */
  solve(levelId) {
    if (!this.data.solved.includes(levelId)) { this.data.solved.push(levelId); this._emit(); }
  },
  isSolved(levelId) { return this.data.solved.includes(levelId); },

  /** A level is unlocked if it's the first, or every earlier-order level is solved. */
  isUnlocked(level, levels) {
    const earlier = levels.filter((l) => l.order < level.order);
    return earlier.every((l) => this.data.solved.includes(l.id));
  },

  /** Compute analyst rank from hints used vs flags caught. */
  rating() {
    const { hintsUsed, flagsCaught, flagsTotal } = this.data;
    const accuracy = flagsTotal ? flagsCaught / flagsTotal : 1;
    const score = accuracy * 100 - hintsUsed * 8;
    if (score >= 92) return { rank: 'S', label: 'LEAD ANALYST' };
    if (score >= 78) return { rank: 'A', label: 'FIELD ANALYST' };
    if (score >= 60) return { rank: 'B', label: 'JUNIOR ANALYST' };
    if (score >= 40) return { rank: 'C', label: 'TRAINEE' };
    return { rank: 'D', label: 'INTERN' };
  },
};
