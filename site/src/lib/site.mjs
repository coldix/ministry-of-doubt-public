/** Site-level constants for ministryofdoubt.com (public surface only). */

export const SITE = {
  name: "The Ministry of Doubt",
  short: "Ministry of Doubt",
  url: "https://ministryofdoubt.com",
  domain: "ministryofdoubt.com",
  tagline: "Suspicion is not proof. Authority is not proof either. Show me the evidence.",
  email: "contact@ministryofdoubt.com",
  publisher: "OZE",
  publisherUrl: "https://oze.net.au",
  // Working repo stays private; do not link the public to internal docs.
  relatedPublic: "https://electiontracker.au",
};

export const AUTHOR = {
  name: "Colin Dixon",
  role: "Author",
  location: "Mallacoota, Victoria, Australia",
  shortBio:
    "Australian writer and technologist with a background in physics, mathematics and IT. Builds evidence-first public tools, including the Australian Election Tracker.",
  /** Served from site/public; master file also kept at repo root images/ */
  photo: "/images/spot-col-1k.jpg",
  photoAlt: "Colin Dixon",
  x: "https://x.com/colindixon",
  xHandle: "@colindixon",
  linkedin: "https://www.linkedin.com/in/colindixon/",
  ozol: "https://ozol.com",
  electionTracker: "https://electiontracker.au",
  oze: "https://oze.net.au",
};

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/book", label: "The Book" },
  { href: "/music", label: "Music" },
  { href: "/author", label: "Author" },
  { href: "/tracker", label: "Tracker" },
  { href: "/about", label: "About" },
];

/** Sibling evidence sites. Same lines as the "Same family" block on cantexplain.au. */
export const FAMILY = [
  {
    name: "Can’t Explain",
    href: "https://cantexplain.au",
    line: "A receipt-first hall of ridiculous claims.",
  },
  {
    name: "Election Tracker",
    href: "https://electiontracker.au",
    line: "Sourced Australian election ledger. Not a forecast.",
  },
  {
    name: "FixMap",
    href: "https://fixmap.au/",
    line: "Spot it. Map it. Fix it. Civic reporting for Australia.",
  },
];
