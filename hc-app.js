/* ==========================================================
   R-Link Help Center — single-page app
   Routes:
     #               → hub
     #cat            → category view (first article)
     #cat/art-id     → category view, specific article
   ========================================================== */

const POPULAR = [
  { cat: "getting-started", art: "art-2" },  // Starting Your First Meeting
  { cat: "elements",        art: "art-0" },  // Elements Overview
  { cat: "hosting",         art: "art-2" },  // Break Out Rooms
  { cat: "webinars",        art: "art-0" }   // Scheduling Your Webinar
];

const SUGGEST_CHIPS = [
  "first meeting", "breakout rooms", "webinar registration",
  "elements", "billing", "team roles"
];

/* Articles that have received their new screenshot pass.
   Add ids here as each article is finished — the hub shows a check badge + per-category count. */
const UPDATED = {
  'getting-started': ['art-0','art-1','art-2','art-3','art-4','art-5','art-6','art-7','art-8','art-9'],
  'account-billing': ['art-0','art-1','art-2','art-3','art-4','art-5','art-6','art-7','art-8','art-9'],
  'settings-support': ['art-0','art-1','art-2','art-3'],
  hosting: ['art-0','art-1','art-2','art-3','art-4','art-5','art-6','art-7','art-8','art-9'],
  elements: ['art-0','art-1','art-2','art-3','art-4','art-5','art-7','art-8','art-9'],
  webinars: ['art-0'],
  meetings: ['art-a','art-b','art-c','art-d','art-e'],
  integrations: ["art-0","art-1","art-2","art-3","art-4","art-5","art-6","art-7","art-8","art-9","art-10","art-11","art-12","art-13"],
  engagement: ['art-0','art-1','art-2','art-3','art-4']
};
const isUpdated = (catId, artId) => (UPDATED[catId] || []).includes(artId);
const hasVideo = (cat, a) => { const B = window.HC_ARTICLE_BODIES || {}; const n = String(a.id||'').replace('art-',''); return [`${cat.id}/${n}`, `${cat.slug}/${n}`].some(k => B[k] && B[k].includes('art-video')); };

const CATS = window.HC_CATEGORIES.filter(c => !c.hidden);
const ARTS = window.HC_ARTICLES;
const CAT_BY_ID = Object.fromEntries(CATS.map(c => [c.id, c]));

/* ===================== ROUTER ===================== */
function parseHash() {
  const h = (location.hash || '').replace(/^#/, '');
  if (!h) return { view: 'hub' };
  const [cat, art] = h.split('/');
  if (!CAT_BY_ID[cat]) return { view: 'hub' };
  return { view: 'category', cat, art: art || null };
}

function navigate(hash) {
  if (location.hash === hash) {
    render();
  } else {
    location.hash = hash;
  }
}

function render() {
  const route = parseHash();
  const hub = document.getElementById('hub-view');
  const cat = document.getElementById('cat-view');
  if (route.view === 'hub') {
    hub.hidden = false;
    cat.hidden = true;
    updateBreadcrumb(null, null);
    document.title = 'R-Link Studio Help Center';
    window.scrollTo(0, 0);
  } else {
    hub.hidden = true;
    cat.hidden = false;
    renderCategoryView(route.cat, route.art);
  }
  // Close any open dropdowns
  closeAllDD();
}

window.addEventListener('hashchange', render);

/* ===================== HUB RENDER ===================== */
function renderHub() {
  // Popular
  const grid = document.getElementById('popularGrid');
  grid.innerHTML = '';
  POPULAR.forEach((p, i) => {
    const cat = CAT_BY_ID[p.cat];
    if (!cat) return;
    const arts = ARTS[p.cat] || [];
    const a = arts.find(x => x.id === p.art);
    if (!a) return;
    const card = document.createElement('a');
    card.className = 'pop-card';
    card.href = '#' + p.cat + '/' + a.id;
    card.innerHTML = `
      <div class="pop-rank">0${i+1}</div>
      <div class="pop-cat"><span class="pop-cat-dot" style="background:${cat.color}"></span>${cat.name}</div>
      <h4>${escapeHtml(a.title)}</h4>
      <p>${escapeHtml(a.blurb)}</p>
    `;
    grid.appendChild(card);
  });

  // Categories
  const wrap = document.getElementById('catSection');
  wrap.innerHTML = '';
  CATS.forEach((cat, i) => {
    const articles = ARTS[cat.id] || [];
    const block = document.createElement('div');
    block.className = 'cat-block';
    block.id = 'cat-block-' + cat.id;
    const num = String(i+1).padStart(2,'0');
    const ctaHTML = !cat.soon
      ? `<a class="cat-cta" href="#${cat.id}">View all <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></a>`
      : '';
    block.innerHTML = `
      <div class="cat-head">
        <div class="cat-num" style="background:${cat.color}">${num}</div>
        <div class="cat-head-body">
          <div class="cat-head-row">
            <div class="cat-name">${escapeHtml(cat.name)}</div>
            ${cat.soon ? '<span class="cat-soon-pill">Coming soon</span>' : `<span class="cat-count">${articles.length} article${articles.length===1?'':'s'}</span>`}
            
          </div>
          <div class="cat-blurb">${escapeHtml(cat.blurb)}</div>
        </div>
        ${ctaHTML}
      </div>
    `;
    if (cat.soon) {
      const soon = document.createElement('div');
      soon.className = 'cat-soon-card';
      soon.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Articles for this category will arrive soon. Check back, or <a href="mailto:support@r-link.com" style="color:var(--pu);font-weight:600">ask support</a> in the meantime.`;
      block.appendChild(soon);
    } else {
      const grid = document.createElement('div');
      grid.className = 'art-grid';
      articles.forEach(a => {
        const letter = a.id.replace('art-','');
        const card = document.createElement(a.soon ? 'div' : 'a');
        card.className = a.soon ? 'art-card is-soon' : 'art-card';
        if (!a.soon) card.href = '#' + cat.id + '/' + a.id;
        card.innerHTML = `
          <span class="art-letter">${escapeHtml(letter)}</span>
          <div class="art-body">
            <div class="art-title">${escapeHtml(a.title)}</div>
            <div class="art-blurb">${escapeHtml(a.blurb)}</div>
          </div>
          ${a.soon ? '<span class="art-soon-badge">Coming Soon</span>' : (hasVideo(cat, a) ? '<span class="art-video-badge" title="Includes a video walkthrough"><svg viewBox="0 0 24 24"><polygon points="7 4 20 12 7 20 7 4"/></svg>Video</span>' : '<svg class="art-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>')}
        `;
        grid.appendChild(card);
      });
      block.appendChild(grid);
    }
    wrap.appendChild(block);
  });

  // Suggest chips
  const chipsWrap = document.getElementById('suggestChips');
  chipsWrap.innerHTML = '';
  SUGGEST_CHIPS.forEach(t => {
    const c = document.createElement('button');
    c.className = 'search-chip';
    c.textContent = t;
    c.onclick = () => { runSearch(t, 'hero'); document.getElementById('heroSearch').focus(); };
    chipsWrap.appendChild(c);
  });
}

/* ===================== ARTICLE HERO + META ===================== */
function getVariant() {
  try {
    return localStorage.getItem('hc-variant') || 'a';
  } catch(e) { return 'a'; }
}
function setVariant(v) {
  try { localStorage.setItem('hc-variant', v); } catch(e) {}
  // Re-render current article view if visible
  const route = parseHash();
  if (route.view === 'category') render();
  updateVariantUI();
}

function extractArticleMeta(art) {
  // Best-effort scrape from .text field which preserves the original meta line.
  const t = art.text || '';
  const meta = { plan: '', read: '', updated: '', level: '' };
  let m;
  if ((m = t.match(/(All Plans|Business|Basic)(?: only)?/i))) meta.plan = m[0];
  if ((m = t.match(/(\d+)\s*min read/i)))                       meta.read = m[1] + ' min read';
  if ((m = t.match(/Updated\s+\w+\s+\d{4}/i)))                  meta.updated = m[0];
  if ((m = t.match(/✓\s*(Beginner|Intermediate|Advanced)/i)))   meta.level = m[1];
  return meta;
}

function detectArticleType(html) {
  if (!html) return 'Overview';
  // Has explicit step structures or numbered ol-style list
  if (/class="(?:step|step-circle|step-num|step-n|ov-num|step-row)"/i.test(html)) return 'Step-by-step';
  if (/class="(?:steps|hc-steps)"/i.test(html)) return 'Step-by-step';
  return 'Overview';
}

function renderArticleHero(cat, art, meta, variant) {
  const chip = (label, icon) => label
    ? `<span class="hc-h-chip">${icon || ''}${escapeHtml(label)}</span>` : '';
  const iconClock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  const iconCal   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  const iconLevel = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const iconPlan  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>';
  return `
    <div class="hc-hero" data-variant="${variant}" style="--cat-color:${cat.color}">
      <div class="hc-hero-band"></div>
      <div class="hc-hero-inner">
        <div class="hc-h-eyebrow">
          <span class="hc-h-dot"></span>
          <span>${escapeHtml(cat.name)}</span>
        </div>
        <h1 class="hc-h-title">${escapeHtml(art.title)}</h1>
        <p class="hc-h-blurb">${escapeHtml(art.blurb)}</p>
        <div class="hc-h-meta">
          ${chip(meta.plan, iconPlan)}
          ${chip(meta.read, iconClock)}
          ${chip(meta.level, iconLevel)}
          ${chip(meta.updated, iconCal)}
        </div>
      </div>
    </div>
  `;
}

function updateVariantUI() {
  const v = getVariant();
  document.querySelectorAll('.tweak-variant-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.v === v);
  });
}

/* ===================== CATEGORY VIEW ===================== */
function renderCategoryView(catId, artId) {
  const cat = CAT_BY_ID[catId];
  const arts = ARTS[catId] || [];
  if (!arts.length) {
    // Coming-soon category — show a message
    document.getElementById('cvSidebar').innerHTML = sidebarHTML(cat, null);
    document.getElementById('cvMain').innerHTML = `
      <div class="cv-eyebrow"><span class="dot" style="background:${cat.color}"></span>${escapeHtml(cat.name)}</div>
      <h1 class="cv-h1">Coming soon</h1>
      <p class="cv-blurb">${escapeHtml(cat.blurb)}</p>
      <div class="cv-body">
        <p>This category is on its way. In the meantime, <a href="#">browse the help center</a> or <a href="mailto:support@r-link.com">contact support</a>.</p>
      </div>
    `;
    document.getElementById('cvToc').innerHTML = '';
    updateBreadcrumb(cat, null);
    document.title = `${cat.name} — R-Link Help`;
    window.scrollTo(0, 0);
    return;
  }
  // Default to first article
  const art = arts.find(a => a.id === artId) || arts[0];
  const artIdx = arts.indexOf(art);

  // Override art.html with hand-built source body when available
  const _bodyKeys = [
    `${cat.srcKey || cat.id || cat.slug}/${artIdx}`,
    `${cat.id || cat.slug}/${artIdx}`,
  ];
  if (window.HC_ARTICLE_BODIES) {
    for (const k of _bodyKeys) {
      if (window.HC_ARTICLE_BODIES[k]) { art.html = window.HC_ARTICLE_BODIES[k]; break; }
    }
  }

  // Sidebar
  document.getElementById('cvSidebar').innerHTML = sidebarHTML(cat, art);

  // Article body
  let pi = artIdx - 1; while (arts[pi] && arts[pi].soon) pi--;
  let ni = artIdx + 1; while (arts[ni] && arts[ni].soon) ni++;
  const prev = arts[pi];
  const next = arts[ni];
  // Pull meta from article text (read-time, plan, level, updated date) — best effort.
  const meta = extractArticleMeta(art);
  const variant = getVariant();
  document.getElementById('cvMain').setAttribute('data-variant', variant);
  document.getElementById('cvMain').innerHTML = `
    ${renderArticleHero(cat, art, meta, variant)}
    <div class="cv-body" data-variant="${variant}" style="--cat-color:${cat.color}">${sanitizeArticleHTML(art.html, art.title, cat.name)}</div>
    <div class="cv-art-nav">
      ${prev
        ? `<a href="#${cat.id}/${prev.id}"><div class="nl"><svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg></div><div class="nt">${escapeHtml(prev.title)}</div></a>`
        : '<div class="placeholder"></div>'}
      ${next
        ? `<a href="#${cat.id}/${next.id}" class="next-link"><div class="nl">Next <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg></div><div class="nt">${escapeHtml(next.title)}</div></a>`
        : '<div class="placeholder"></div>'}
    </div>
  `;

  // TOC from headings in article
  renderTOC(art, cat, arts);

  updateBreadcrumb(cat, art);
  document.title = `${art.title} — ${cat.name} — R-Link Help`;
  // Scroll content area to top
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

function sidebarHTML(activeCat, activeArt) {
  const arts = ARTS[activeCat.id] || [];
  let html = `<div class="cv-hlabel"><span class="cv-cat-color" style="background:${activeCat.color}"></span>${escapeHtml(activeCat.name)}</div>`;
  html += '<div class="cv-arts">';
  arts.forEach(a => {
    const letter = a.id.replace('art-','');
    const isActive = activeArt && a.id === activeArt.id;
    if (a.soon) {
      html += `<div class="cv-art is-soon">
      <span class="cv-art-l">${escapeHtml(letter)}</span>
      <span class="cv-art-t">${escapeHtml(a.title)}</span>
      <span class="art-soon-badge">Soon</span>
    </div>`;
    } else {
    html += `<a class="cv-art${isActive?' active':''}" href="#${activeCat.id}/${a.id}">
      <span class="cv-art-l">${escapeHtml(letter)}</span>
      <span class="cv-art-t">${escapeHtml(a.title)}</span>
    </a>`;
    }
  });
  html += '</div>';
  // Other categories
  html += '<div class="cv-div"></div><div class="cv-clabel">All Categories</div><div class="cv-cats">';
  CATS.forEach(c => {
    const isActive = c.id === activeCat.id;
    html += `<a class="cv-cat${isActive?' active-cat':''}" href="#${c.id}">
      <span class="cv-dot" style="background:${c.color}"></span>
      <span>${escapeHtml(c.name)}${c.soon ? ' <em style="color:var(--t-5);font-style:normal;font-size:10px;font-weight:700;letter-spacing:.06em">SOON</em>' : ''}</span>
    </a>`;
  });
  html += '</div>';
  return html;
}

function renderTOC(art, cat, arts) {
  const wrap = document.getElementById('cvToc');
  let html = '<div class="cv-toc-h">On This Article</div>';
  // Pull headings from rendered article body in #cvMain (h2/h3 with ids).
  const main = document.getElementById('cvMain');
  let headings = [];
  if (main) {
    main.querySelectorAll('.cv-body h2, .cv-body h3').forEach((h, i) => {
      if (!h.id) h.id = 'sec-' + i + '-' + (h.textContent || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
      headings.push({ id: h.id, text: h.textContent.trim(), level: h.tagName === 'H2' ? 2 : 3 });
    });
  }
  if (Array.isArray(art.headings) && art.headings.length) headings = art.headings;
  if (!headings.length) {
    html += '<div class="cv-toc-empty">No sections yet</div>';
  } else {
    html += '<div class="cv-toc-list">';
    headings.forEach(h => {
      html += `<button class="cv-toc-link lvl-${h.level}" data-id="${h.id}">${escapeHtml(h.text)}</button>`;
    });
    html += '</div>';
  }
  // Other Articles section
  if (cat && arts && arts.length) {
    const others = arts.filter(a => a.id !== art.id && !a.soon);
    if (others.length) {
      html += '<div style="height:1px;background:var(--bd-soft);margin:24px 0 18px"></div>';
      html += '<div class="cv-toc-h">Other Articles</div><div class="cv-toc-list">';
      others.forEach(a => {
        html += `<a class="cv-toc-link" href="#${cat.id}/${a.id}">${escapeHtml(a.title)}</a>`;
      });
      html += '</div>';
    }
  }
  wrap.innerHTML = html;
  wrap.querySelectorAll('.cv-toc-link').forEach(btn => {
    btn.onclick = () => {
      const target = document.getElementById(btn.dataset.id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        wrap.querySelectorAll('.cv-toc-link').forEach(x => x.classList.remove('active'));
        btn.classList.add('active');
      }
    };
  });
  // Activate first by default
  const first = wrap.querySelector('.cv-toc-link');
  if (first) first.classList.add('active');

  // Scroll spy
  setupScrollSpy();
}

let scrollSpyHandler = null;
function setupScrollSpy() {
  if (scrollSpyHandler) window.removeEventListener('scroll', scrollSpyHandler);
  scrollSpyHandler = () => {
    const links = document.querySelectorAll('.cv-toc-link');
    if (!links.length) return;
    let active = null;
    for (const link of links) {
      const target = document.getElementById(link.dataset.id);
      if (!target) continue;
      const rect = target.getBoundingClientRect();
      if (rect.top <= 100) active = link;
      else break;
    }
    if (!active) active = links[0];
    links.forEach(l => l.classList.toggle('active', l === active));
  };
  window.addEventListener('scroll', scrollSpyHandler, { passive: true });
}

function updateBreadcrumb(cat, art) {
  const bc = document.getElementById('navBreadcrumb');
  if (!cat) {
    bc.innerHTML = '<span class="n-bc-cur">Help Center</span>';
    return;
  }
  bc.innerHTML = `
    <a href="#">Help Center</a>
    <span class="sep">/</span>
    <a href="#${cat.id}" class="${art ? '' : 'n-bc-cur'}">${escapeHtml(cat.name)}</a>
    ${art ? `<span class="sep">/</span><span class="n-bc-cur">${escapeHtml(art.title)}</span>` : ''}
  `;
}

/* ===================== SEARCH ===================== */
function buildSearchCorpus() {
  const corpus = [];
  CATS.forEach(cat => {
    const arts = ARTS[cat.id] || [];
    arts.forEach(a => {
      if (a.soon) return;
      corpus.push({
        cat,
        art: a,
        haystack: (a.title + ' ' + a.blurb + ' ' + (a.text || '')).toLowerCase()
      });
    });
  });
  return corpus;
}
const CORPUS = buildSearchCorpus();

function searchAll(q) {
  const query = q.trim().toLowerCase();
  if (!query) return [];
  const tokens = query.split(/\s+/).filter(Boolean);
  const results = [];
  for (const entry of CORPUS) {
    let score = 0;
    let allMatch = true;
    for (const t of tokens) {
      const titleHits = (entry.art.title.toLowerCase().match(new RegExp(escRe(t),'g')) || []).length;
      const blurbHits = (entry.art.blurb.toLowerCase().match(new RegExp(escRe(t),'g')) || []).length;
      const bodyHits  = (entry.haystack.match(new RegExp(escRe(t),'g')) || []).length;
      if (bodyHits === 0) { allMatch = false; break; }
      score += titleHits * 8 + blurbHits * 4 + bodyHits;
    }
    if (allMatch) {
      // Build snippet
      const snippet = makeSnippet(entry.art.text || '', tokens);
      results.push({ ...entry, score, snippet });
    }
  }
  results.sort((a,b) => b.score - a.score);
  return results;
}

function makeSnippet(text, tokens) {
  if (!text) return '';
  const lower = text.toLowerCase();
  // Find first token match
  let pos = -1;
  for (const t of tokens) {
    const i = lower.indexOf(t);
    if (i > -1 && (pos === -1 || i < pos)) pos = i;
  }
  if (pos === -1) return text.slice(0, 140) + '…';
  const start = Math.max(0, pos - 50);
  const end = Math.min(text.length, pos + 110);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

/* Map callout emoji → semantic type */
const CALLOUT_TYPES = {
  '📌': { type: 'note',    label: 'Note',     icon: 'pin' },
  '💡': { type: 'tip',     label: 'Tip',      icon: 'bulb' },
  '⚠️': { type: 'warning', label: 'Warning',  icon: 'warn' },
  '⚠':  { type: 'warning', label: 'Warning',  icon: 'warn' },
  '✅': { type: 'success', label: 'Success',  icon: 'check' },
  '🔒': { type: 'plan',    label: 'Plan',     icon: 'lock' },
  '🚀': { type: 'tip',     label: 'Tip',      icon: 'rocket' },
  'ℹ️': { type: 'note',    label: 'Note',     icon: 'info' },
  'ℹ':  { type: 'note',    label: 'Note',     icon: 'info' }
};
const CALLOUT_ICONS = {
  lock:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  rocket:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>',
  info:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  pin:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V17z"/></svg>',
  bulb:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.8c.8.6 1 1.2 1 2.2v1h6v-1c0-1 .2-1.6 1-2.2A7 7 0 0 0 12 2z"/></svg>',
  warn:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
};

/* Strip the original page header (breadcrumb + duplicate H1 + plan/meta row)
   that the extractor left at the top of each article body. We re-render our
   own eyebrow + H1 above, so the inline copy is redundant. */
function sanitizeArticleHTML(html, title, catName) {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  // Remove every H1 — we render the title ourselves above the body.
  tmp.querySelectorAll('h1').forEach(el => el.remove());
  // Remove any element whose text content is just a breadcrumb chain
  // ("Help Center › Category › Article" — contains "Help Center" and ›).
  Array.from(tmp.querySelectorAll('div, p, nav')).forEach(el => {
    const t = (el.textContent || '').trim();
    if (!t) return;
    if (t.length < 200 && /Help Center/i.test(t) && /[›>]/.test(t)) el.remove();
  });
  // The article HTML often has a single big wrapper div containing the entire
  // body. If the firstElementChild has lots of children, drill in once.
  let scope = tmp;
  const firstWrap = tmp.firstElementChild;
  if (firstWrap && firstWrap.tagName === 'DIV' && firstWrap.children.length >= 3) {
    // Verify it doesn't lead with media (an image first means it's content, not chrome).
    const firstKid = firstWrap.firstElementChild;
    if (firstKid && firstKid.tagName !== 'IMG' && !firstKid.querySelector('img,video,iframe')) {
      scope = firstWrap;
    }
  }
  // Strip up to 8 leading wrappers (in scope) that look like header chrome.
  for (let i = 0; i < 8; i++) {
    const el = scope.firstElementChild;
    if (!el) break;
    const t = (el.textContent || '').trim();
    const hasMedia = el.querySelector('img, video, iframe');
    if (!t && !hasMedia) { el.remove(); continue; }
    if (hasMedia) break;
    // Never strip an authored callout block — it is content, not header chrome.
    if (el.classList && el.classList.contains('co')) break;
    // Combined plan + meta wrapper: contains both plan keyword AND read/updated/level.
    if (t.length < 320 && /\b(All Plans|Business|Basic)\b/i.test(t) && /(min read|updated|beginner|intermediate|advanced)/i.test(t)) { el.remove(); continue; }
    // Plan/meta row — short and contains plan keywords (with any suffix wording).
    if (t.length < 200 && /\b(All Plans|Business|Basic)\b/i.test(t)) { el.remove(); continue; }
    // Read-time + updated meta strip.
    if (t.length < 200 && /min read/i.test(t) && /updated/i.test(t)) { el.remove(); continue; }
    // Bare category-name eyebrow (e.g. just "Elements").
    if (catName && t.toLowerCase() === catName.toLowerCase()) { el.remove(); continue; }
    // Bare article-title repetition.
    if (title && t.toLowerCase() === title.toLowerCase()) { el.remove(); continue; }
    break;
  }
  // Also strip a bare-title node nested one level deep inside the first wrapper
  // (cv-body > div > div:nth-child(1|2) just containing the article title).
  if (title && scope.firstElementChild) {
    const inner = scope.firstElementChild;
    for (let i = 0; i < 3 && inner.firstElementChild; i++) {
      const c = inner.firstElementChild;
      const ct = (c.textContent || '').trim();
      if (!ct && !(c.matches('img,video,iframe')||c.querySelector('img,video,iframe'))) { c.remove(); continue; }
      if (ct.toLowerCase() === title.toLowerCase()) { c.remove(); continue; }
      if (catName && ct.toLowerCase() === catName.toLowerCase()) { c.remove(); continue; }
      break;
    }
  }
  // Drop any leftover empty leading wrappers (no text, no img, no media).
  while (scope.firstElementChild) {
    const first = scope.firstElementChild;
    const txt = (first.textContent || '').trim();
    const hasMedia = first.matches('img, video, iframe') || first.querySelector('img, video, iframe');
    if (!txt && !hasMedia) first.remove();
    else break;
  }
  // Transform callouts FIRST (before step-row promotion which targets similar shapes).
  // Callouts look like: <div><div>EMOJI</div><div><div>TITLE</div><div>BODY</div></div></div>
  tmp.querySelectorAll('div').forEach(row => {
    const kids = row.children;
    if (kids.length !== 2) return;
    const emoji = (kids[0].textContent || '').trim();
    if (!CALLOUT_TYPES[emoji]) return;
    if (kids[0].children.length > 0) return;
    const meta = CALLOUT_TYPES[emoji];
    const bodyDiv = kids[1];
    // Title is first child div, rest is body
    let titleText = meta.label;
    let bodyHTML = bodyDiv.innerHTML;
    const firstChild = bodyDiv.firstElementChild;
    if (firstChild && firstChild.tagName === 'DIV' && !firstChild.querySelector('img, p, ul, ol')) {
      const t = (firstChild.textContent || '').trim();
      if (t && t.length < 80) {
        titleText = t;
        firstChild.remove();
        bodyHTML = bodyDiv.innerHTML;
      }
    }
    const aside = document.createElement('aside');
    aside.className = 'hc-callout';
    aside.setAttribute('data-type', meta.type);
    aside.innerHTML = `
      <span class="hc-callout-icon">${CALLOUT_ICONS[meta.icon]}</span>
      <div class="hc-callout-body">
        <div class="hc-callout-title">${escapeHtml(titleText)}</div>
        <div class="hc-callout-text">${bodyHTML}</div>
      </div>`;
    row.replaceWith(aside);
  });

  // Promote step-row titles to h2 with IDs and add class for styling.
  // Step rows look like: <div><div>NUMBER</div><div><div>HEADING</div>...</div></div>
  let stepN = 0;
  const stepRows = [];
  tmp.querySelectorAll('div').forEach(row => {
    const kids = row.children;
    if (kids.length !== 2) return;
    const num = (kids[0].textContent || '').trim();
    if (!/^\d+$/.test(num)) return;
    if (kids[0].children.length > 0) return;
    const body = kids[1];
    const head = body.firstElementChild;
    if (!head || head.tagName !== 'DIV') return;
    const text = (head.textContent || '').trim();
    if (!text || text.length > 100) return;
    if (head.querySelector('img, svg, video, iframe, p, ul, ol')) return;
    const h = document.createElement('h2');
    h.id = 'sec-' + (++stepN) + '-' + text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
    h.textContent = text;
    head.replaceWith(h);
    // Mark the step row + number for CSS targeting.
    row.classList.add('hc-step');
    row.setAttribute('data-step', num);
    kids[0].classList.add('hc-step-num');
    kids[1].classList.add('hc-step-body');
    stepRows.push(row);
  });

  // Group consecutive step rows under <ol class="hc-steps">.
  // Walk stepRows; when one's previousElementSibling isn't the prior step, start a new ol.
  let currentOl = null;
  stepRows.forEach((row, i) => {
    const prev = stepRows[i - 1];
    if (!prev || row.previousElementSibling !== prev) {
      currentOl = document.createElement('ol');
      currentOl.className = 'hc-steps';
      row.parentNode.insertBefore(currentOl, row);
    }
    currentOl.appendChild(row);
  });

  // Wrap inline images followed by ↑/→/caption-paragraph into <figure>.
  tmp.querySelectorAll('img').forEach(img => {
    const wrap = img.parentElement;
    if (!wrap) return;
    // Find the next sibling that's a caption (p starting with ↑ → or short)
    let next = wrap.nextElementSibling;
    if (!next && wrap.parentElement) next = wrap.parentElement.nextElementSibling;
    let captionP = null;
    if (next && next.tagName === 'P') {
      const t = (next.textContent || '').trim();
      if (/^[↑→↓←]/.test(t) || t.length < 200) captionP = next;
    }
    const fig = document.createElement('figure');
    fig.className = 'hc-figure';
    const imgClone = img.cloneNode(true);
    fig.appendChild(imgClone);
    if (captionP) {
      const cap = document.createElement('figcaption');
      cap.innerHTML = captionP.innerHTML.replace(/^[↑→↓←]\s*/, '');
      fig.appendChild(cap);
      captionP.remove();
    }
    img.replaceWith(fig);
  });

  // Drop the trailing "Was this article helpful?" block + extractor next-link.
  Array.from(tmp.querySelectorAll('p, div, a')).forEach(el => {
    const t = (el.textContent || '').trim();
    if (/Was this article helpful/i.test(t) && t.length < 200) {
      // Remove this and any sibling buttons
      let scope = el.parentElement;
      if (scope && scope.children.length <= 4) scope.remove();
      else el.remove();
    }
  });
  tmp.querySelectorAll('a').forEach(a => {
    if (/Next Article/i.test(a.textContent || '')) a.remove();
  });
  // Drop stray "Previous / <article>" + "Next Article / <article>" leaf divs that
  // the extractor leaves orphaned in the body (we render our own prev/next nav).
  Array.from(tmp.querySelectorAll('div')).forEach(row => {
    const kids = row.children;
    if (kids.length !== 2) return;
    const a = kids[0], b = kids[1];
    if (a.tagName !== 'DIV' || b.tagName !== 'DIV') return;
    if (a.children.length || b.children.length) return;
    const lbl = (a.textContent || '').trim();
    if (/^(Previous|Next Article|Next)$/i.test(lbl) && (b.textContent || '').trim().length < 120) {
      row.remove();
    }
  });
  // Strip leftover "›" arrow leaves with no siblings of substance.
  Array.from(tmp.querySelectorAll('div')).forEach(d => {
    if (d.children.length) return;
    const t = (d.textContent || '').trim();
    if (t === '›' || t === '‹') d.remove();
  });
  // Inline emoji-icon-before-heading pattern:
  // <div><div>EMOJI</div><h2|h3|h4>Title</h2></div>
  // → flatten: heading with emoji prefixed (or replace wrapper with heading).
  tmp.querySelectorAll('div').forEach(row => {
    const kids = row.children;
    if (kids.length !== 2) return;
    const a = kids[0], b = kids[1];
    if (a.tagName !== 'DIV' || a.children.length > 0) return;
    if (!/^H[1-6]$/.test(b.tagName)) return;
    const emoji = (a.textContent || '').trim();
    // Single-grapheme emoji-ish (short text, contains a non-ASCII char).
    if (!emoji || emoji.length > 4 || /^[\w\s.,!?]+$/.test(emoji)) return;
    const h = b.cloneNode(true);
    h.insertBefore(document.createTextNode(emoji + ' '), h.firstChild);
    row.replaceWith(h);
  });
  // Also promote standalone "Overview" / section labels that precede a step list.
  tmp.querySelectorAll(':scope > div > div:first-child').forEach(el => {
    if (el.children.length > 0) return;
    const text = (el.textContent || '').trim();
    if (!text || text.length > 60) return;
    if (!/^(Overview|How it works|Setup|Settings|Best Practices|Tips|Notes|Steps)$/i.test(text)) return;
    const h = document.createElement('h2');
    h.id = 'sec-ov-' + text.toLowerCase().replace(/[^a-z0-9]+/g,'-');
    h.textContent = text;
    el.replaceWith(h);
  });
  // "Best for" / "Don't use for" boxes:
  // <div><div>Best for</div><div><div><span>✓</span> item</div>...</div></div>
  tmp.querySelectorAll('div').forEach(row => {
    if (row.classList.contains('hc-best-for')) return;
    const kids = row.children;
    if (kids.length !== 2) return;
    const label = kids[0], list = kids[1];
    if (label.tagName !== 'DIV' || list.tagName !== 'DIV') return;
    if (label.children.length > 0) return;
    const lt = (label.textContent || '').trim();
    if (!/^(Best for|Don't use for|Use cases|Good for|Not for|Pros|Cons)$/i.test(lt)) return;
    // List children should all be short items
    const items = Array.from(list.children);
    if (!items.length || items.length > 12) return;
    if (!items.every(it => it.tagName === 'DIV' && (it.textContent || '').trim().length < 200)) return;
    const isNeg = /Don't use|Not for|Cons/i.test(lt);
    const box = document.createElement('div');
    box.className = 'hc-best-for' + (isNeg ? ' hc-best-for-neg' : '');
    let html = `<div class="hc-bf-label">${escapeHtml(lt)}</div><div class="hc-bf-list">`;
    items.forEach(it => {
      // Strip the leading ✓/✗/× span if present
      const clone = it.cloneNode(true);
      const firstSpan = clone.querySelector('span');
      if (firstSpan) {
        const t = (firstSpan.textContent || '').trim();
        if (/^[✓✗×x✕]$/.test(t)) firstSpan.remove();
      }
      html += `<div class="hc-bf-item"><span class="hc-bf-mark">${isNeg ? '✕' : '✓'}</span><span>${clone.innerHTML.trim()}</span></div>`;
    });
    html += '</div>';
    box.innerHTML = html;
    row.replaceWith(box);
  });
  // Side-by-side comparison table:
  // <div>(wrapper)
  //   <div><div></div><div>📹 Meeting</div><div>🎙️ Webinar</div></div>  ← header (1st cell empty)
  //   <div><div>Label</div><div>val</div><div>val</div></div>  ← rows
  // </div>
  tmp.querySelectorAll('div').forEach(wrap => {
    if (wrap.classList.contains('hc-compare-table')) return;
    const rows = Array.from(wrap.children);
    if (rows.length < 3) return;
    if (!rows.every(r => r.tagName === 'DIV')) return;
    const head = rows[0];
    const headKids = Array.from(head.children);
    if (headKids.length < 3 || headKids.length > 5) return;
    if (!headKids.every(k => k.tagName === 'DIV')) return;
    // First header cell empty, rest have content
    if ((headKids[0].textContent || '').trim() !== '') return;
    if (!headKids.slice(1).every(k => (k.textContent || '').trim().length > 0 && (k.textContent || '').trim().length < 60)) return;
    const N = headKids.length;
    // All rows must have N div children
    if (!rows.slice(1).every(r => r.children.length === N && Array.from(r.children).every(c => c.tagName === 'DIV'))) return;
    const table = document.createElement('table');
    table.className = 'hc-compare-table';
    const thead = document.createElement('thead');
    const trh = document.createElement('tr');
    headKids.forEach((k, i) => {
      const th = document.createElement('th');
      if (i === 0) { th.innerHTML = ''; th.className = 'hc-cmp-corner'; }
      else { th.innerHTML = k.innerHTML; th.className = 'hc-cmp-col'; }
      trh.appendChild(th);
    });
    thead.appendChild(trh);
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].children);
      const tr = document.createElement('tr');
      cells.forEach((c, j) => {
        const td = document.createElement('td');
        let html = c.innerHTML;
        // Color ✓/✗ marks
        html = html.replace(/^(\s*)(✓|✔)\s*/, '$1<span class="hc-cmp-yes">✓</span> ');
        html = html.replace(/^(\s*)(✗|×|✘)\s*/, '$1<span class="hc-cmp-no">✗</span> ');
        td.innerHTML = html;
        if (j === 0) td.className = 'hc-cmp-row-label';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.replaceWith(table);
  });

  // Settings/feature table:
  // <div>(wrapper)
  //   <div><div>Setting</div><div>Plan</div></div>  ← header row (2 div kids, first is "Setting"/"Feature")
  //   <div><div><strong>Name</strong><div>desc</div></div><span>Business</span></div>  ← rows
  //   ...
  // </div>
  tmp.querySelectorAll('div').forEach(wrap => {
    if (wrap.classList.contains('hc-feature-table')) return;
    const rows = Array.from(wrap.children);
    if (rows.length < 3) return;
    if (!rows.every(r => r.tagName === 'DIV')) return;
    const head = rows[0];
    const headKids = head.children;
    if (headKids.length !== 2) return;
    const h0 = (headKids[0].textContent || '').trim().toLowerCase();
    const h1 = (headKids[1].textContent || '').trim().toLowerCase();
    if (!/^(setting|feature)$/.test(h0)) return;
    if (!/^(plan|tier|availability)$/.test(h1)) return;
    // Build clean table
    const table = document.createElement('table');
    table.className = 'hc-feature-table';
    const thead = document.createElement('thead');
    thead.innerHTML = `<tr><th>${escapeHtml(headKids[0].textContent.trim())}</th><th>${escapeHtml(headKids[1].textContent.trim())}</th></tr>`;
    table.appendChild(thead);
    const tbody = document.createElement('tbody');
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const cells = r.children;
      if (cells.length < 1 || cells.length > 2) continue;
      const left = cells[0];
      const tr = document.createElement('tr');
      const tdL = document.createElement('td');
      tdL.innerHTML = left.innerHTML;
      const strong = tdL.querySelector('strong');
      const innerDiv = tdL.querySelector(':scope > div');
      if (strong && innerDiv) {
        const name = strong.textContent.trim();
        const desc = innerDiv.innerHTML;
        tdL.innerHTML = `<div class="hc-ft-name">${escapeHtml(name)}</div><div class="hc-ft-desc">${desc}</div>`;
      }
      tr.appendChild(tdL);
      const tdR = document.createElement('td');
      tdR.className = 'hc-ft-plan';
      const tagText = cells.length === 2 ? (cells[1].textContent || '').trim() : '';
      if (tagText) tdR.innerHTML = `<span class="hc-ft-pill">${escapeHtml(tagText)}</span>`;
      tr.appendChild(tdR);
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    wrap.replaceWith(table);
  });

  // Settings legend: <div><span>Settings marked</span><span>● Business</span><span>...are exclusive...</span></div>
  tmp.querySelectorAll('div').forEach(row => {
    if (row.classList.contains('hc-ft-legend')) return;
    const kids = Array.from(row.children);
    if (kids.length < 2 || kids.length > 4) return;
    if (!kids.every(k => k.tagName === 'SPAN')) return;
    const txt = (row.textContent || '').toLowerCase();
    if (!/settings marked|features marked/.test(txt)) return;
    const pillSpan = kids.find(k => /^[●•·]\s*\w/.test((k.textContent || '').trim()));
    if (!pillSpan) return;
    const pillText = (pillSpan.textContent || '').replace(/^[●•·]\s*/, '').trim();
    const before = kids.slice(0, kids.indexOf(pillSpan)).map(k => k.textContent).join(' ');
    const after  = kids.slice(kids.indexOf(pillSpan)+1).map(k => k.textContent).join(' ');
    const legend = document.createElement('div');
    legend.className = 'hc-ft-legend';
    legend.innerHTML = `${escapeHtml(before.trim())} <span class="hc-ft-pill">${escapeHtml(pillText)}</span> ${escapeHtml(after.trim())}`;
    row.replaceWith(legend);
  });

  // Plan-comparison cards (Basic / Business pattern):
  // <div>(parent)
  //   <div> (basic card)  <div>(header)<div></div><h3>Basic</h3></div> <p>...</p> <div>features</div> </div>
  //   <div> (business card)  <div>Most Popular</div> <div>(header)...</div> <p>...</p> <div>features</div> </div>
  // </div>
  const isPlanCard = el => {
    if (!el || el.tagName !== 'DIV') return false;
    if (el.classList.contains('hc-plan-card')) return false;
    const kids = Array.from(el.children);
    if (kids.length < 3 || kids.length > 5) return false;
    let hasHeader = false, hasP = false, hasFeatures = false;
    kids.forEach(k => {
      if (k.tagName === 'DIV' && k.querySelector('h3')) hasHeader = true;
      if (k.tagName === 'P') hasP = true;
      if (k.tagName === 'DIV' && k.children.length >= 3) {
        const allCheckItems = Array.from(k.children).every(c => {
          if (c.tagName !== 'DIV') return false;
          const sp = c.querySelector('span');
          return sp && /^[✓✗×x]$/.test((sp.textContent || '').trim());
        });
        if (allCheckItems) hasFeatures = true;
      }
    });
    return hasHeader && hasP && hasFeatures;
  };
  tmp.querySelectorAll('div').forEach(parent => {
    if (parent.classList.contains('hc-plan-grid')) return;
    const kids = Array.from(parent.children);
    if (kids.length < 2 || kids.length > 4) return;
    if (!kids.every(isPlanCard)) return;
    parent.classList.add('hc-plan-grid');
    kids.forEach(card => {
      card.classList.add('hc-plan-card');
      // Find badge ("Most Popular" — a div with no children whose text is < 30 chars)
      const first = card.firstElementChild;
      if (first && first.tagName === 'DIV' && first.children.length === 0) {
        const t = (first.textContent || '').trim();
        if (t && t.length < 30 && /Popular|Recommended|Featured|Best/i.test(t)) {
          card.classList.add('hc-plan-card-featured');
          first.classList.add('hc-plan-badge');
        }
      }
      // Tag pieces
      Array.from(card.children).forEach(child => {
        if (child.classList.contains('hc-plan-badge')) return;
        if (child.tagName === 'DIV' && child.querySelector('h3')) child.classList.add('hc-plan-head');
        else if (child.tagName === 'P') child.classList.add('hc-plan-blurb');
        else if (child.tagName === 'DIV') {
          child.classList.add('hc-plan-features');
          // Replace each feature row's leading ✓ span with our mark
          Array.from(child.children).forEach(it => {
            const sp = it.querySelector('span');
            if (sp && /^[✓✗×x]$/.test((sp.textContent || '').trim())) {
              sp.className = 'hc-plan-mark';
              sp.textContent = '✓';
            }
            it.classList.add('hc-plan-feature');
          });
        }
      });
    });
  });
  // Auto-link URLs and emails in text nodes (don't touch existing <a>, <code>, <pre>).
  autolinkText(tmp);
  // Swap placeholder boxes for real screenshots when we have a match in the library.
  resolveScreenshots(tmp);
  return tmp.innerHTML;
}

/* ── Screenshot library matcher ────────────────────────────────────────── */
const HC_SS_STOPWORDS = new Set(['the','a','an','of','in','to','for','on','and','or','your','from','at','is','as','by','this','that','with','it','its','you','can','at','add','an','option','options','tab','panel','bar','view','your','our','my','off']);
function ssTokens(str) {
  return String(str || '').toLowerCase()
    .replace(/[—–\-_/]/g,' ')
    .replace(/[^a-z0-9 ]/g,' ')
    .split(/\s+/).filter(w => w && w.length > 1 && !HC_SS_STOPWORDS.has(w))
    .map(w => w.replace(/(ies|s|ed|ing)$/,'').replace(/(ie)$/,'y')); // light stem
}
function scoreSS(altTokens, libTokens) {
  if (!altTokens.length || !libTokens.length) return 0;
  const libSet = new Set(libTokens);
  const altSet = new Set(altTokens);
  let inter = 0;
  altSet.forEach(t => { if (libSet.has(t)) inter++; });
  // Jaccard-ish, weighted by coverage of the (usually shorter) library key
  const libCov = inter / libSet.size;
  const altCov = inter / altSet.size;
  return libCov * 0.6 + altCov * 0.4;
}
/* Manual aliases for placeholders the fuzzy matcher misses or scores too low.
   Key = lowercased data-alt substring (must contain ALL words). Value = exact filename without extension. */
const HC_SS_ALIASES = [
  ['browser camera permission|camera and microphone permission', 'Browser Camera and Microphone Permission'],
  ['studio.+share button|share button.+studio|meeting toolbar', 'Studio Top Bar Share Button'],
  ['dashboard.+start button|start a meeting button', 'Dashboard Start a Meeting Button'],
  ['choose meeting type|launch a session', 'Launch a Session Choose Meeting Type'],
  ['pre-?launch page', 'Pre-Launch Page Camera Mic and Room'],
  ['room url.+description.+default|default preset.+brand kit|room defaults', 'Room URL Description and Room Defaults'],
  ['edit room panel|room name.+type.+url|name your room', 'Edit Room Name Type URL and Defaults'],
  ['room settings toggle|room settings panel', 'Room Settings Toggles All Plans'],
  ['business plan settings|business plan room settings', 'Business Plan Room Settings'],
  ['live now.*(active|room|live room)|dashboard.*live now', 'Dashboard Live Now With Active Room'],
  ['admin dashboard overview|dashboard overview', 'Admin Dashboard Overview'],
  ['password reset email|reset email.*code|email.*with.*reset code', 'Password Reset Email With Reset Code'],
  ['set a new password|new password.*6.?digit|6.?digit code.*new password', 'Set a New Password Enter Code and Choose Password'],
  ['reset password.*(enter|email address)|forgot password.*request', 'Reset Password Enter Your Email'],
  ['reset password.*(check your email|reset link|reset code)', 'Reset Password Check Your Email for a Reset Link'],
  // [altIncludes (string or array of must-include phrases), screenshotKey]
  ['review.+publish', 'Webinar Final Review and Publishing'],
  ['profile (tab|settings|page)|personal.+identity', 'R-Link Studio Profile Settings'],
  ['account (tab|settings|page)|organization details|regional settings', 'R-Link Studio Account Settings'],
  ['auto.?approve', 'Auto-Approved Registration'],
  ['registrant details', 'Manual Approval of Registrant'],
  ['view details icon', 'Webinar Tab View Full Details'],
  ['ended webinars', 'Webinar Tab to manage scheduled webinars'],
  ['left panel.*studio controls', 'Left Navigation Panel'],
  ['studio controls.*left', 'Left Navigation Panel'],
  ['opening breakout', 'Break Out Rooms Manage'],
  ['breakout rooms setup', 'Break Out Rooms Set-Up'],
  ['breakout rooms settings', 'Break out Rooms Settings'],
  ['chat input area', 'Send a Message'],
  ['add element list', 'Adding New Elements'],
  ['admin panel elements library', 'Elements Tab in The Admin Portal'],
  ['elements library in admin', 'Elements Tab in The Admin Portal'],
  ['elements asset library', 'Elements Assets Library'],
  ['room card showing room url', 'R-Link Studio'],
  ['polls.+poll', 'Polls'],
  ['participants? view.*poll', 'Participants View of your Poll'],
  ['poll.+moderator', 'Poll Management Moderator View'],
  ['create poll', 'Create Poll in the Admin Panel Elements Tab'],
  ['live captions', 'How Live Captions look slike in Studio'],
  ['turn on captions|enable captions', 'Turn on Closed Captions'],
  ['language settings|spoken.+caption', 'Choose your Spoken & Caption Language'],
  ['raise hand|reaction.+stage', 'Reactions appear at the bottom right of your own video panel'],
  ['recording.+banner|consent.+recording', 'The Session is Being Recorded'],
  ['record button|start recording', 'Record button in Top Nav Bar'],
  ['pause.*recording|stop recording', 'Pause or Stop Recording'],
  ['recording started', 'Recording Started'],
  ['screen.?share|share screen', 'Start Screen Sharing'],
  ['share system audio', 'Share System Audio'],
  ['stop screen', 'Stop screen share'],
  ['waiting room', 'Admit or Deny from Waiting Room'],
  ['attendees panel|attendee list', 'Open the Attendees Panel'],
  ['chat panel', 'Open the Chat Panel'],
  ['breakout rooms.*open', 'Open Break Out Rooms'],
  ['participant.+hover|hover.+participant', 'Participant hover options'],
  ['video element.+url', 'Add Video URL Option'],
  ['video element.+library', 'Video Asset Library'],
  ['video element.+modal|edit video element', 'Video Element Modal'],
  ['video element in live', 'Video Element in LIVE'],
  ['audio element.+upload', 'Audio Element  from Upload'],
  ['audio element.+library', 'Audio Element from the Library'],
  ['audio element.+url', 'Audio Element from URL'],
  ['audio element in live', 'Audio Element in LIVE'],
  ['presentation element.+live', 'Presentation Element in LIVE'],
  ['presentation element', 'Presentation Element'],
  ['cta banner.+admin|create cta', 'Create CTA Banner in the Admin Panel'],
  ['launch.+cta|cta.+launch', 'Launch your CTA Banner'],
  ['cta.+participant', 'CTA Banner Particpant Experience'],
  ['webinar registration page', 'Webinar Registration Page'],
  ['webinar in progress', 'Webinar in Progress'],
  ['webinar room', 'Webinar Room'],
  ['confirmation email', '04 Confirmation Email'],
  ['stage control', 'Webinar Stage Control'],
  ['attendee options', 'Webinar Attendee Options'],
  ['event landing page', 'Webinar Event Landing Page'],
  ['date.*time.*duration|date and time', 'Webinar Date, Time, Duration & Recording'],
  ['email reminders|reminder emails', 'Webinar Email Reminders + Replay Management'],
  ['registration settings', 'Webinar Registration Settings'],
  ['customizations.+live stream|live streaming', 'Webinar Customizations + Live Streaming'],
  ['title.+description.+ai|create webinar title', 'Webinar Create Webinar Title + Description + AI Assistant'],
  ['webinar tab', 'Webinar Tab'],
  ['schedule tab', 'Schedule Tab'],
  ['schedule.+meeting details|meeting details', 'Schedule a Meeting Details'],
  ['scheduled meeting', 'Scheduled meeting will appear here'],
  ['top nav', 'Top Navigation Bar'],
  ['right panel', 'Right Panel'],
  ['pre.?launch', 'Pre Launch Page'],
  ['audio settings', 'Audio Settings'],
  ['access.+recording', 'Access Your Recordings'],
  ['export chat', 'Export Chat'],
  ['whiteboard', 'Whiteboard'],
  ['boosted.+effect|effects.+animation', 'Boosted and Effects appear within the video panel'],
  ['reaction.+chat|chat.+reaction', 'can also do reactions to messages in the chat'],
  ['reaction', 'Reactions'],
  ['choose.+google account|choose a google account|calendar.+choose|choose.+account', 'Calendar Integration - Choose Account'],
  ['r-link studio login|studio login page|r-link.+login page', 'R-Link Studio Login Page'],
  ['admin dashboard|r-link studio admin|welcome back', 'R-Link Studio Admin Dashboard'],
  ['account profile.+calendar|account profile page|open account settings|account settings.+calendar', 'Account Profile Calendar Integration'],
  ['rooms tab|rooms page|go to the rooms|room access', 'R-Link Studio Rooms Tab'],
  ['edit room panel|edit room.+name|room name.+url.+description', 'Edit Room Panel'],
  ['default preset|default brand kit|room url.+default', 'R-Link Studio Room Defaults'],
  ['room settings panel|room settings.+toggle', 'Room Settings Panel'],
  ['dashboard.+start button|start button.+dashboard|click.+start button', 'Dashboard Start Button'],
  ['end meeting menu|end meeting button|red.+end meeting|ending.+meeting', 'End Meeting Menu'],
  ['meeting toolbar.*invite|invite icon highlighted', 'Meeting Toolbar Invite Icon'],
  ['choose.+meeting type|meeting.+webinar.+live stream|choose.+session type|r-link studio.+choose', 'Choose Session Type'],
  ['calendar.+allow', 'Calendar Integration - Click Allow'],
  ['calendar.+continue', 'Calendar Integration - Click Continue'],
  ['calendar.+multiple', 'Calendar Integration - Multiple Calendars'],
  ['calendar.+success|calendar.+connect', 'Calendar Integration - Successful Connection'],
  // Account & Billing
  ['portal login page|log in.+account|login page', '1 Login Page'],
  ['login email|email.+login link|customer portal.+email', 'Your customer portal link in email'],
  ['check.+email.+login|login link.+email', 'Check your email for your login link'],
  ['update subscription', 'Update Your Subscription'],
  ['choose.+plan|change plan', 'Update Your Subscription Choose Plan'],
  ['confirm.+update|confirm change', 'Confirm Change Plan'],
  ['add payment method', 'Add Payment Method'],
  ['cancel subscription|cancel.+plan', 'Cancel Your Subscription'],
  ['confirm cancel', 'Confirm Cancellation'],
  ['invoice history|view invoice', 'View Invoices'],
  ['invoice detail|download invoice|download receipt|invoice.+receipt', 'View Invoices Details'],
  // Participant management
  ['participant options menu|make presenter|participant.+spotlight|participant.+co.host', 'Make Presenter Screenshot'],
  ['private message|private chat', 'Chat - Private Messages'],
  // Scheduling a Meeting
  ['empty meetings column', 'Click + Schedule Meeting'],
  ['schedule meeting modal|fill in.+meeting details|schedule meeting form', 'Fill in the meeting details'],
  ['new meeting card|meeting.+confirmed|scheduled meeting will appear', 'Your meeting is confirmed'],
  ['dashboard showing the schedule button|schedule button.+dashboard', '01 Schedule Tab'],
];
const HC_SS_ALIASES_COMPILED = HC_SS_ALIASES.map(([pat, key]) => [new RegExp(pat, 'i'), key]);
function findScreenshotByAlias(altText) {
  const lib = window.HC_SCREENSHOTS;
  if (!lib) return null;
  for (const [re, key] of HC_SS_ALIASES_COMPILED) {
    if (re.test(altText)) {
      const hit = lib.find(l => l.key === key);
      if (hit) return hit;
    }
  }
  return null;
}
function findScreenshot(altText) {
  // 1. Manual alias (highest priority)
  const aliased = findScreenshotByAlias(altText);
  if (aliased) return aliased;
  // 2. Token overlap fuzzy match
  const lib = window.HC_SCREENSHOTS;
  if (!lib || !lib.length) return null;
  const altTokens = ssTokens(altText);
  if (!altTokens.length) return null;
  let best = null, bestScore = 0;
  for (const item of lib) {
    const s = scoreSS(altTokens, item.tokens);
    if (s > bestScore) { bestScore = s; best = item; }
  }
  if (bestScore >= 0.45) return best;
  return null;
}
function resolveScreenshots(root) {
  const placeholders = root.querySelectorAll('.src-img-placeholder[data-alt]');
  // Track every screenshot path already shown in the article (existing imgs + placeholders we resolve)
  const seenPaths = new Set(
    [...root.querySelectorAll('img')]
      .map(img => img.getAttribute('src'))
      .filter(Boolean)
  );
  placeholders.forEach(ph => {
    const alt = ph.getAttribute('data-alt') || '';
    const hit = findScreenshot(alt);
    if (!hit) { ph.remove(); return; }
    if (seenPaths.has(hit.path)) { ph.remove(); return; }
    seenPaths.add(hit.path);
    const fig = document.createElement('figure');
    fig.className = 'hc-shot';
    fig.innerHTML = `<img src="${escapeHtml(hit.path)}?v=2" alt="${escapeHtml(alt)}" loading="lazy"/>`;
    ph.replaceWith(fig);
  });
}

const URL_RE = /\b((?:https?:\/\/|www\.)[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:\/[^\s<>"']*)?|(?:[a-z0-9-]+\.)+(?:com|co|io|net|org|app|dev|ai)\b(?:\/[^\s<>"']*)?)/gi;
const EMAIL_RE = /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/gi;
function autolinkText(root) {
  const SKIP = new Set(['A','CODE','PRE','SCRIPT','STYLE','BUTTON']);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(n){
      let p = n.parentElement;
      while (p && p !== root) { if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT; p = p.parentElement; }
      return (URL_RE.test(n.nodeValue) || EMAIL_RE.test(n.nodeValue))
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  URL_RE.lastIndex = 0; EMAIL_RE.lastIndex = 0;
  const targets = [];
  let n; while ((n = walker.nextNode())) targets.push(n);
  targets.forEach(node => {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    // Combine ranges
    const ranges = [];
    let m;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(text))) ranges.push({s:m.index, e:m.index+m[0].length, t:m[0], kind:'url'});
    EMAIL_RE.lastIndex = 0;
    while ((m = EMAIL_RE.exec(text))) ranges.push({s:m.index, e:m.index+m[0].length, t:m[0], kind:'email'});
    ranges.sort((a,b)=>a.s-b.s);
    // Drop overlaps (email might be inside url match — keep first)
    const filtered = [];
    let cursor = -1;
    ranges.forEach(r => { if (r.s >= cursor) { filtered.push(r); cursor = r.e; } });
    if (!filtered.length) return;
    filtered.forEach(r => {
      if (r.s > last) frag.appendChild(document.createTextNode(text.slice(last, r.s)));
      const a = document.createElement('a');
      a.href = r.kind === 'email' ? 'mailto:' + r.t : (/^https?:/i.test(r.t) ? r.t : 'https://' + r.t);
      if (r.kind === 'url') { a.target = '_blank'; a.rel = 'noopener'; }
      a.textContent = r.t;
      frag.appendChild(a);
      last = r.e;
    });
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.replaceWith(frag);
  });
}

function escRe(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
function escapeHtml(s){return (s+'').replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function highlight(s, q){
  if (!q.trim()) return escapeHtml(s);
  const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let out = escapeHtml(s);
  tokens.forEach(t => {
    const re = new RegExp('('+escRe(t)+')','gi');
    out = out.replace(re, '<mark>$1</mark>');
  });
  return out;
}

/* Search UI bindings */
const heroInput = document.getElementById('heroSearch');
const navInput  = document.getElementById('navSearch');
const heroDD    = document.getElementById('heroDD');
const navDD     = document.getElementById('navDD');

let activeSearch = { input: null, dd: null, results: [], idx: -1, query: '' };

function closeAllDD() {
  heroDD && heroDD.classList.remove('open');
  navDD && navDD.classList.remove('open');
  activeSearch = { input: null, dd: null, results: [], idx: -1, query: '' };
}

function renderDD(dd, results, query) {
  if (!query.trim()) { dd.classList.remove('open'); return; }
  if (!results.length) {
    dd.innerHTML = `<div class="search-dd-empty">No results for "<strong>${escapeHtml(query)}</strong>". Try a different keyword or <a href="mailto:support@r-link.com" style="color:var(--pu);font-weight:600">contact support</a>.</div>`;
    dd.classList.add('open');
    return;
  }
  const top = results.slice(0, 8);
  let html = `<div class="search-dd-section"><div class="search-dd-label">${top.length} result${top.length===1?'':'s'} of ${results.length}</div>`;
  top.forEach((r, i) => {
    const url = '#' + r.cat.id + '/' + r.art.id;
    html += `
      <a class="search-dd-item${i===activeSearch.idx?' active':''}" href="${url}" data-idx="${i}">
        <span class="search-dd-cdot" style="background:${r.cat.color}"></span>
        <div class="search-dd-body">
          <div class="search-dd-title">${highlight(r.art.title, query)}</div>
          <div class="search-dd-meta">${escapeHtml(r.cat.name)}</div>
          ${r.snippet ? `<div class="search-dd-snippet">${highlight(r.snippet, query)}</div>` : ''}
        </div>
        <svg class="search-dd-arrow" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </a>`;
  });
  html += `</div><div class="search-dd-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate · <kbd>↵</kbd> open · <kbd>esc</kbd> close</span><span>${results.length} total</span></div>`;
  dd.innerHTML = html;
  dd.classList.add('open');
}

function runSearch(q, which) {
  const input = which === 'hero' ? heroInput : navInput;
  const dd = which === 'hero' ? heroDD : navDD;
  if (input.value !== q) input.value = q;
  activeSearch.input = input;
  activeSearch.dd = dd;
  activeSearch.query = q;
  activeSearch.idx = -1;
  activeSearch.results = searchAll(q);
  // Sync the OTHER input
  const otherInput = which === 'hero' ? navInput : heroInput;
  if (otherInput && otherInput.value !== q) otherInput.value = q;
  renderDD(dd, activeSearch.results, q);
}

[
  ['hero', heroInput, heroDD],
  ['nav',  navInput,  navDD]
].forEach(([which, input, dd]) => {
  if (!input) return;
  input.addEventListener('input', e => runSearch(e.target.value, which));
  input.addEventListener('focus', e => {
    if (e.target.value) runSearch(e.target.value, which);
  });
  input.addEventListener('keydown', e => {
    if (!dd.classList.contains('open')) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSearch.idx = Math.min(activeSearch.idx + 1, Math.min(7, activeSearch.results.length - 1));
      renderDD(dd, activeSearch.results, input.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSearch.idx = Math.max(activeSearch.idx - 1, -1);
      renderDD(dd, activeSearch.results, input.value);
    } else if (e.key === 'Enter') {
      let target;
      if (activeSearch.idx >= 0 && activeSearch.results[activeSearch.idx]) target = activeSearch.results[activeSearch.idx];
      else if (activeSearch.results.length) target = activeSearch.results[0];
      if (target) {
        e.preventDefault();
        navigate('#' + target.cat.id + '/' + target.art.id);
        input.blur();
        closeAllDD();
      }
    } else if (e.key === 'Escape') {
      input.blur();
      closeAllDD();
    }
  });
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap') && !e.target.closest('.n-search-mini')) closeAllDD();
});

document.addEventListener('keydown', e => {
  if (e.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    const route = parseHash();
    if (route.view === 'hub') {
      heroInput.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navInput.focus();
    }
  }
});

/* Logo click → hub */
document.getElementById('logoLink').addEventListener('click', e => {
  e.preventDefault();
  navigate('#');
});

/* ===================== THEME ===================== */
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem('hc-theme', theme); } catch(e) {}
  updateThemeUI();
}
function updateThemeUI() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const t = document.getElementById('darkToggle');
  if (t) t.classList.toggle('on', isDark);
}
document.getElementById('themeToggle').addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});
document.getElementById('darkToggle').addEventListener('click', () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  setTheme(isDark ? 'light' : 'dark');
});

/* ===================== TWEAKS PANEL HOST PROTOCOL ===================== */
const tweaksPanel = document.getElementById('tweaksPanel');
window.addEventListener('message', e => {
  if (!e.data || typeof e.data !== 'object') return;
  if (e.data.type === '__activate_edit_mode') {
    tweaksPanel.classList.add('open');
    updateThemeUI();
  } else if (e.data.type === '__deactivate_edit_mode') {
    tweaksPanel.classList.remove('open');
  }
});
document.getElementById('tweaksClose').addEventListener('click', () => {
  tweaksPanel.classList.remove('open');
  try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch(e) {}
});
document.querySelectorAll('.tweak-variant-btn').forEach(btn => {
  btn.addEventListener('click', () => setVariant(btn.dataset.v));
});
try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch(e) {}

/* ===================== INIT ===================== */
renderHub();
render();
updateThemeUI();
updateVariantUI();

document.addEventListener('click',e=>{const t=e.target.closest('[data-hc-tab]');if(!t)return;const w=t.closest('[data-hc-tabs]');w.querySelectorAll('[data-hc-tab]').forEach(x=>x.classList.toggle('is-active',x===t));w.querySelectorAll('[data-hc-panel]').forEach(x=>x.classList.toggle('is-active',x.dataset.hcPanel===t.dataset.hcTab));});
