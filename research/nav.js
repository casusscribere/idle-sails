// research/nav.js — the shared top menu bar for the research pages.
//
// Each research page is a self-contained HTML file; this script is the one
// shared piece. It injects a sticky navigation bar styled from the page's own
// CSS variables (so it follows each page's light/dark scheme), marks the
// current page, and carries the return link to the running chart.
// To add a page: add it to PAGES and include <script defer src="nav.js">.
(function () {
  const PAGES = [
    ['index.html', 'Overview'],
    ['silences.html', 'Silences'],
    ['flow-prominence.html', 'Flow prominence'],
    ['ports-1550-1815.html', 'Busiest ports'],
    ['port-synthesis.html', 'Persistence'],
    ['minor-ports-1500-1830.html', 'Minor ports'],
    ['route-persistence.html', 'Route persistence']
  ];
  const here = location.pathname.split('/').pop() || 'index.html';

  const style = document.createElement('style');
  style.textContent = `
.research-nav{position:sticky;top:0;z-index:50;display:flex;align-items:center;gap:2px;flex-wrap:wrap;
  padding:8px 14px;background:color-mix(in srgb,var(--card) 94%,transparent);
  border-bottom:1px solid var(--edge);backdrop-filter:blur(3px);
  font-family:var(--sans);font-size:12.5px}
.research-nav a{color:var(--ink-soft);text-decoration:none;border-bottom:none;padding:4px 9px;border-radius:3px;letter-spacing:.04em;white-space:nowrap}
.research-nav a:hover{color:var(--ink);background:color-mix(in srgb,var(--ink) 8%,transparent)}
.research-nav a.rn-here{color:var(--ink);font-weight:600;box-shadow:inset 0 -2px 0 var(--accent)}
.research-nav a:focus-visible{outline:1px solid var(--accent);outline-offset:1px}
.research-nav .rn-sim{color:var(--accent);font-weight:600}
.research-nav .rn-sep{width:1px;height:16px;background:var(--edge);margin:0 8px 0 4px}
@media (max-width:680px){.research-nav .rn-sim span{display:none}}`;
  document.head.appendChild(style);

  const nav = document.createElement('nav');
  nav.className = 'research-nav';
  nav.setAttribute('aria-label', 'Research pages');
  nav.innerHTML =
    '<a class="rn-sim" href="../index.html">⚓ <span>Return to the chart</span></a>' +
    '<span class="rn-sep" aria-hidden="true"></span>' +
    PAGES.map(([href, label]) =>
      `<a href="${href}"${href === here ? ' class="rn-here" aria-current="page"' : ''}>${label}</a>`
    ).join('');
  document.body.prepend(nav);
})();
