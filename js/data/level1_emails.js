// level1_emails.js - the studio inbox. One email is the entry vector.
// Red-flag ids are referenced by the level's checklist validator.

export const RED_FLAGS = {
  display_mismatch: 'Display name doesn’t match the real sending address',
  lookalike_domain: 'Lookalike / typosquatted domain (e.g. rn vs m)',
  replyto_mismatch: 'Reply-To points to a different domain than From',
  urgency:          'Manufactured urgency / deadline pressure',
  link_mismatch:    'Link text hides a different real destination',
  spf_fail:         'SPF authentication failed (forged sender)',
};

// The malicious email and the exact flags present in it.
export const SOLUTION = {
  maliciousId: 'm3',
  flags: ['display_mismatch', 'lookalike_domain', 'replyto_mismatch', 'urgency', 'link_mismatch', 'spf_fail'],
};

export const EMAILS = [
  {
    id: 'm1',
    fromName: 'Steam Partner Program',
    fromAddr: 'noreply@steampowered.com',
    replyTo: 'noreply@steampowered.com',
    time: '08:31',
    spf: 'pass',
    subject: 'Your store page is ready for launch',
    body: `Hi Northwind team,

Your store page has passed review and is scheduled to go live on your selected date. No action is required.

Good luck with your launch!
- Steam Partner Program`,
    links: [{ text: 'View your dashboard', href: 'https://partner.steampowered.com/' }],
    malicious: false,
  },
  {
    id: 'm2',
    fromName: 'Tomi Okafor',
    fromAddr: 'tomi@northwindgames.com',
    replyTo: 'tomi@northwindgames.com',
    time: '08:52',
    spf: 'pass',
    subject: 'launch checklist - final',
    body: `Team - last pass before we go live at 10:00.

- Build uploaded ✓
- Trailer live ✓
- I'll hold the publishing login, nobody else needs it today.

See you on the other side.
Tomi`,
    links: [],
    malicious: false,
  },
  {
    id: 'm3', // THE ENTRY VECTOR
    fromName: 'Steam Security',
    fromAddr: 'account-alert@rnicrosoft-steam.com',
    replyTo: 'recovery@mail-secure-verify.net',
    time: '09:09',
    spf: 'fail',
    subject: 'URGENT: Suspicious login - verify within 24h or lose publishing access',
    body: `Security Alert.

We detected an unrecognized login to your Steam publishing account from a new device. As a precaution, publishing has been temporarily restricted.

You must verify your identity within 24 hours or your launch will be cancelled and access permanently revoked.

Confirm it's you to restore access immediately:
[[VERIFY ACCOUNT NOW]]

Failure to act will result in loss of your account.
Steam Security Team`,
    links: [{ text: 'VERIFY ACCOUNT NOW', href: 'http://steam-partner-verify.rnicrosoft-steam.com/login' }],
    malicious: true,
  },
  {
    id: 'm4',
    fromName: 'itch.io',
    fromAddr: 'hello@itch.io',
    replyTo: 'hello@itch.io',
    time: '09:40',
    spf: 'pass',
    subject: 'Weekly devlog digest',
    body: `Here's what's new from creators you follow this week.

Three new posts about pixel-art lighting, plus a sale on audio packs.

Manage your email preferences any time.`,
    links: [{ text: 'Read the digest', href: 'https://itch.io/updates' }],
    malicious: false,
  },
  {
    id: 'm5',
    fromName: 'M. Devlin',
    fromAddr: 'devlin@northwindgames.com',
    replyTo: 'devlin@northwindgames.com',
    time: '09:51',
    spf: 'pass',
    subject: 'Re: launch checklist - final',
    body: `Congrats on launch day everyone. Sorry I've been quiet on the thread.

Tomi - if anything goes sideways with the login today, I can jump in. I still remember how the recovery flow works from when I set it up.

- Devlin`,
    links: [],
    malicious: false,
  },
];
