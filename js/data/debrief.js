// debrief.js - a short "in the real world" card shown when each stage is solved.
// Connects the puzzle's skill to a real attack technique plus a real-world case,
// so the player walks away with transfer, not just a win screen.
export const DEBRIEF = {
  phish: {
    concept: 'Lookalike & homoglyph domains',
    text: 'Phishing works because a domain only has to <b>look</b> right for a second. Attackers swap <code>rn</code> for <code>m</code>, <code>0</code> for <code>o</code>, or use Unicode look-alike letters so the address passes a glance.',
    realcase: '<b>Real case:</b> IDN homograph attacks have spoofed banks for years, and "paypaI.com" (capital i) has fooled users into handing over logins. Check the exact characters, and verify SPF/DKIM - not just the display name.',
  },
  payload: {
    concept: 'Encoded payloads & steganography',
    text: 'Malware rarely ships in the clear. Commands and download URLs get <b>Base64-encoded</b> or hidden inside ordinary-looking files and images (LSB steganography) so scanners and humans skim past them.',
    realcase: '<b>Real case:</b> Crews have smuggled command-and-control configs inside PNGs and meme images. Decode and inspect before you trust an attachment or a blob.',
  },
  weaklink: {
    concept: 'Password reuse & credential stuffing',
    text: 'A predictable password (a word, a year, a leetspeak swap) is already on a wordlist. Reuse it, and one breach unlocks every account - attackers replay leaked dumps at scale.',
    realcase: '<b>Real case:</b> The 2012 LinkedIn breach leaked 117M password hashes that still crack accounts today. Defence: length + randomness, a password manager, and MFA.',
  },
  profile: {
    concept: 'OSINT & alias correlation',
    text: 'People <b>reuse handles</b>, leak their timezone, and name their projects. Cross-referencing those small tells across public accounts collapses an "anonymous" alias onto a real person.',
    realcase: '<b>Real case:</b> Researchers routinely deanonymise threat actors by linking reused usernames across GitHub, forums, and social media.',
  },
  falseflag: {
    concept: 'False flags & stylometry',
    text: 'Attackers plant a <b>false flag</b> - blaming a known crew - to misdirect attribution. But writing style (word choice, sentence cadence, punctuation) is a fingerprint that survives the disguise. That is <b>stylometry</b>.',
    realcase: '<b>Real case:</b> Stylometric analysis of the manifesto helped identify the Unabomber, and the same techniques are used to attribute modern ransomware notes.',
  },
};
