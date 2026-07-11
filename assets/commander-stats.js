function normalizeCmdr(v) {
  if (!v) return '';
  return v.replace(/\r?\n/g, ' / ').trim();
}
function stripPilotSuffix(name) {
  return name.replace(/\s*\([A-Za-z]\)\s*$/, '').trim();
}
function cmdrAvatarHtml(val) {
  const normalized = (val || '').replace(/\r?\n/g, ' / ').trim();
  const parts = normalized.split(' / ');
  // Use data-cmdr instead of src to avoid Chrome ORB errors from the Scryfall
  // redirect endpoint (api.scryfall.com returns Content-Type: text/html on its
  // 302, which ORB blocks). loadAvatarImages() resolves direct CDN URLs later.
  const imgs = parts.map(p =>
    `<img class="cmdr-avatar" data-cmdr="${p.replace(/"/g, '&quot;')}" alt="" loading="lazy">`
  ).join('');
  return `<span class="cmdr-avatars">${imgs}</span>`;
}
function cmdrName(v) {
  if (!v) return '';
  return v.replace(/\r?\n/g, '<br>').trim();
}
function cmdrToIndividualParts(cmdr) {
  return cmdr.split(' / ').map(p => stripPilotSuffix(p.trim())).filter(Boolean);
}

// Scryfall color identity lookup with localStorage cache
const SCRYFALL_COLLECTION = 'https://api.scryfall.com/cards/collection';
const CMDR_COLORS_CACHE_KEY = 'cmdr_colors_v1';

async function fetchScryfallBatch(names) {
  const cardColors = {};
  for (let i = 0; i < names.length; i += 75) {
    const batch = names.slice(i, i + 75);
    try {
      const resp = await fetch(SCRYFALL_COLLECTION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiers: batch.map(name => ({ name })) }),
      });
      const data = await resp.json();
      (data.data || []).forEach(card => {
        cardColors[card.name.toLowerCase()] =
          ['W','U','B','R','G'].filter(c => (card.color_identity || []).includes(c)).join('') || 'C';
      });
    } catch(e) { console.warn('Scryfall batch failed:', e); }
    if (i + 75 < names.length) await new Promise(r => setTimeout(r, 100));
  }
  return cardColors;
}

async function getColorMap(cmdrNames) {
  let cached = {};
  try {
    const raw = JSON.parse(localStorage.getItem(CMDR_COLORS_CACHE_KEY) || 'null');
    if (raw) cached = raw.colors || {};
  } catch(e) {}

  const missing = cmdrNames.filter(c => !(c in cached));
  if (missing.length > 0) {
    const individualNames = [...new Set(
      missing.flatMap(cmdrToIndividualParts).map(p => p.toLowerCase())
    )];
    const cardColors = await fetchScryfallBatch(individualNames.map(n =>
      missing.flatMap(cmdrToIndividualParts).find(p => p.toLowerCase() === n) || n
    ));
    missing.forEach(cmdr => {
      const merged = new Set();
      cmdrToIndividualParts(cmdr).forEach(part => {
        (cardColors[part.toLowerCase()] || '').split('').forEach(c => merged.add(c));
      });
      cached[cmdr] = ['W','U','B','R','G'].filter(c => merged.has(c)).join('') || 'C';
    });
    try {
      localStorage.setItem(CMDR_COLORS_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), colors: cached }));
    } catch(e) {}
  }
  return cached;
}

const CMDR_IMAGES_CACHE_KEY = 'cmdr_images_v1';

async function getImageMap(partNames) {
  let cached = {};
  try {
    const raw = JSON.parse(localStorage.getItem(CMDR_IMAGES_CACHE_KEY) || 'null');
    if (raw) cached = raw.images || {};
  } catch(e) {}

  const stripped = partNames.map(stripPilotSuffix);
  const missing = stripped.filter(n => !(n.toLowerCase() in cached));
  if (missing.length > 0) {
    for (let i = 0; i < missing.length; i += 75) {
      const batch = missing.slice(i, i + 75);
      try {
        const resp = await fetch(SCRYFALL_COLLECTION, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifiers: batch.map(name => ({ name })) }),
        });
        const data = await resp.json();
        (data.data || []).forEach(card => {
          const url = card.image_uris?.art_crop
            || card.card_faces?.[0]?.image_uris?.art_crop
            || null;
          if (url) cached[card.name.toLowerCase()] = url;
        });
      } catch(e) { console.warn('Scryfall images batch failed:', e); }
      if (i + 75 < missing.length) await new Promise(r => setTimeout(r, 100));
    }
    try {
      localStorage.setItem(CMDR_IMAGES_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), images: cached }));
    } catch(e) {}
  }
  return cached;
}

async function loadAvatarImages(container) {
  const imgs = Array.from((container || document).querySelectorAll('.cmdr-avatar[data-cmdr]'));
  if (!imgs.length) return;
  const partNames = [...new Set(imgs.map(img => img.dataset.cmdr).filter(Boolean))];
  const imageMap = await getImageMap(partNames);
  imgs.forEach(img => {
    const url = imageMap[stripPilotSuffix(img.dataset.cmdr).toLowerCase()];
    if (url) img.src = url;
  });
}

const IDENTITY_NAMES = {
  W:'Mono White', U:'Mono Blue', B:'Mono Black', R:'Mono Red', G:'Mono Green', C:'Colorless',
  WU:'Azorius', WB:'Orzhov', WR:'Boros', WG:'Selesnya',
  UB:'Dimir', UR:'Izzet', UG:'Simic',
  BR:'Rakdos', BG:'Golgari', RG:'Gruul',
  WUB:'Esper', WUR:'Jeskai', WUG:'Bant', WBR:'Mardu', WBG:'Abzan', WRG:'Naya',
  UBR:'Grixis', UBG:'Sultai', URG:'Temur', BRG:'Jund',
  WUBR:'Sans Green', WUBG:'Sans Red', WURG:'Sans Black', WBRG:'Sans Blue', UBRG:'Sans White',
  WUBRG:'Five Color',
};

const PIP_ORDER = {
  W:['W'], U:['U'], B:['B'], R:['R'], G:['G'], C:['C'],
  WU:['W','U'], UB:['U','B'], BR:['B','R'], RG:['R','G'], WG:['G','W'],
  WB:['W','B'], UR:['U','R'], BG:['B','G'], WR:['R','W'], UG:['G','U'],
  WUB:['W','U','B'], UBR:['U','B','R'], BRG:['B','R','G'], WRG:['R','G','W'], WUG:['G','W','U'],
  WBG:['W','B','G'], WUR:['U','R','W'], UBG:['B','G','U'], WBR:['R','W','B'], URG:['G','U','R'],
  UBRG:['U','B','R','G'], WBRG:['W','B','R','G'], WURG:['W','U','R','G'], WUBG:['W','U','B','G'], WUBR:['W','U','B','R'],
  WUBRG:['W','U','B','R','G'],
};

function pips(identity) {
  const colors = PIP_ORDER[identity] || (identity === 'C' ? ['C'] : identity.split(''));
  return '<span class="pips">' + colors.map(c =>
    `<img class="mana-pip" src="https://svgs.scryfall.io/card-symbols/${c}.svg" alt="${c}">`
  ).join('') + '</span>';
}

function parsePctDelta(val) {
  const s = String(val || '').trim();
  if (!s) return NaN;
  // Google Sheets exports MMR columns as percentage-formatted ("52318.72%"),
  // meaning the true value is 100x smaller — strip % and divide.
  return s.endsWith('%') ? parseFloat(s) / 100 : parseFloat(s);
}

const TIER_COLORS = {
  S: { stroke: '#EF9F27' },
  A: { stroke: '#F97316' },
  B: { stroke: '#85B7EB' },
  C: { stroke: '#B4B2A9' },
  D: { stroke: '#7A5C4A' },
};

function tierBadgeSvg(tier, size = 24) {
  if (!tier || !TIER_COLORS[tier]) return '';
  const { stroke } = TIER_COLORS[tier];
  return `<svg width="${size}" height="${size}" viewBox="0 0 28 28" role="img" style="vertical-align:middle"><title>${tier} tier</title><rect x="2" y="2" width="24" height="24" fill="none" stroke="${stroke}" stroke-width="2"/><text x="14" y="20" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="18" fill="${stroke}">${tier}</text></svg>`;
}

// Builds a tier map from Games CSV rows. mu/sigma are computed from active
// commanders only (played within the last 2 years) so tiers reflect the current
// meta. All commanders — including inactive ones — are scored against those stats,
// giving inactive commanders a frozen approximation of their last-known tier.
function buildTierMapFromGames(rows) {
  const latestMmr = {};
  const latestTs = {};
  const TWO_YEARS = 2 * 365 * 24 * 60 * 60 * 1000;
  rows.forEach(row => {
    const cmdr = normalizeCmdr(row[G.commander]);
    const endMmr = parsePctDelta(row[G.endMmr]);
    if (!cmdr || isNaN(endMmr)) return;
    const ts = new Date((row[G.date] || '').trim()).getTime();
    if (!latestTs[cmdr] || ts > latestTs[cmdr]) { latestTs[cmdr] = ts; latestMmr[cmdr] = endMmr; }
  });
  const cutoff = Date.now() - TWO_YEARS;
  const active = Object.keys(latestMmr).filter(c => latestTs[c] >= cutoff);
  const vals = active.map(c => latestMmr[c]);
  const mu = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  const sigma = vals.length > 1 ? Math.sqrt(vals.reduce((s, v) => s + (v - mu) ** 2, 0) / vals.length) : 0;
  const map = {};
  if (sigma > 0) {
    Object.keys(latestMmr).forEach(c => {
      const z = (latestMmr[c] - mu) / sigma;
      map[c] = z >= 1.5 ? 'S' : z >= 0.5 ? 'A' : z >= -0.5 ? 'B' : z >= -1.5 ? 'C' : 'D';
    });
  }
  return map;
}

// Returns a Set of commander names played within the last two years.
function buildActiveSet(rows) {
  const TWO_YEARS = 2 * 365 * 24 * 60 * 60 * 1000;
  const latestTs = {};
  rows.forEach(row => {
    const cmdr = normalizeCmdr(row[G.commander]);
    if (!cmdr) return;
    const ts = new Date((row[G.date] || '').trim()).getTime();
    if (!latestTs[cmdr] || ts > latestTs[cmdr]) latestTs[cmdr] = ts;
  });
  const cutoff = Date.now() - TWO_YEARS;
  return new Set(Object.keys(latestTs).filter(c => latestTs[c] >= cutoff));
}
