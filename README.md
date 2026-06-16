# FALSE FLAG — Forensic Reconstruction Unit

> A studio was hijacked on launch day. The ransom note names a famous hacking crew.
> Walk the attack chain **backward**, stage by stage — and find out who's *really* behind the mask.

**FALSE FLAG** is a browser-based forensic-analyst game. You play an investigator reconstructing a real cyber intrusion against *Northwind Games* (case #NW-0451). Each of the five stages is a genuine security skill, and together they *are* the attack chain — reconstructed in reverse, from the damage back to the attacker. The twist: the crew named in the ransom note is a false flag. The breach was an inside job.


**▶ Live demo:** https://kalilinux-exp.github.io/falseflag/

---

## The 5 stages = the attack chain

| Stage | Skill | What you do |
| :-- | :-- | :-- |
| **01 · The Lure** | Phishing / email forensics | Catch the spoofed sender and the homoglyph lookalike domain |
| **02 · The Payload** | Decoding & steganography | Base64-decode a dropper and pull data hidden via LSB steganography |
| **03 · The Weak Link** | Password hygiene | Run a **real** SHA-256 dictionary attack, then reconstruct the password |
| **04 · The Profile** | OSINT | Correlate a reused alias across mock social profiles to a real person |
| **05 · False Flag** | Stylometry | Match the ransom note's writing fingerprint to its true author |

Every clue you recover pins to an **evidence board** with red-string links, and the case ends with an analyst rating based on accuracy, flags caught, and hints used.

---

## Built with real technique — not faked

- **SHA-256 via the Web Crypto API** — the Stage 3 dictionary attack hashes every guess and compares it to the captured hash, live.
- **Real cosine-similarity stylometry** — Stage 5 scores function-word frequency + sentence-cadence feature vectors (the same idea used to attribute anonymous writing).
- **Email forensics** — homoglyph domains, SPF/DKIM signals, reply-to mismatches.
- **100% vanilla** — plain HTML, CSS, and ES-module JavaScript. No framework, no build step, no `npm install`.
- **Asset-free visuals** — textures are inline SVG `feTurbulence` data-URIs; nothing to download.
- **Accessibility** — Lighthouse Accessibility **100** (semantic controls, `aria-live` regions, visible focus, `prefers-reduced-motion` respected).
- **Saves your progress** — game state persists in `localStorage`.

---

## Run it locally

It's a static site, download needed,then run locally
```bash
# Option A: just open the file
#   open index.html in any modern browser

# Option B: serve it (recommended — ES modules like a server)
py -3 -m http.server 8000
#   then visit http://localhost:8000
```

> Note: fonts load from Google Fonts, so the typeface degrades gracefully if you're fully offline — the game still plays.

---

## How to play

1. Open the case file and read the briefing.
2. Work the attack chain top to bottom — each solved stage unlocks the next.
3. Inspect documents, decode payloads, crack the credential, correlate the alias.
4. In the final stage, run the stylometric analysis and **name the real author**.
5. Review your evidence board and see your analyst rating.

Stuck? Each stage has tiered hints that nudge without spoiling.

---

## Tech stack

- HTML5 · CSS3 · vanilla JavaScript (ES modules)
- Web Crypto API (SHA-256)
- `localStorage` for save state
- Google Fonts: Oswald, JetBrains Mono, Special Elite
- Zero dependencies · zero build tooling

## Project structure

```
index.html          # entry point
css/style.css       # the full design system (situation-room aesthetic)
js/
  main.js           # orchestrator: title → briefing → chain → levels
  board.js          # evidence corkboard + red string
  levels/           # one module per stage
  data/             # case text, per-level data, real-world debrief cards
```

---

## Credits

Built solo by **Kalixte Petrof** for NextGenHacks
© 2026 Kalixte Petrof
