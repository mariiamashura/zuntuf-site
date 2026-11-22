// Central site configuration. Edit here, not in components.
export const site = {
  name: 'Zuntuf',
  email: 'zuntuf@proton.me',
  // Rendered only when a URL is set. TODO(author): supply the real URLs (github, linkedin, itch).
  social: {
    github: 'https://github.com/mariiamashura' as string,
    linkedin: 'https://www.linkedin.com/in/maria-mashura-56606558' as string,
    itch: '' as string, // itch.io profile or page
  },
  // Donation link (Monobank jar: https://send.monobank.ua/jar/XXXXXXXX). Empty = the tile is hidden.
  support: 'https://send.monobank.ua/jar/23VAUF63v4' as string,
  features: {
    lab: false, // Lab section: fully pre-wired, hidden until true
    journal: false,
    // Small "this is software" cues: window/cursor/terminal glyphs on the landing, a path chip on inner pages.
    // Set to false to switch them all off (nothing else changes).
    softwareCues: true,
  },
  // Show tools marked draft:true (the example entry) only when SHOW_DRAFTS=1 is set.
  showDrafts: process.env.SHOW_DRAFTS === '1',
  year: 2026,
};
