function normalizeCmdr(v) {
  if (!v) return '';
  return v.replace(/\r?\n/g, ' / ').trim();
}
function stripPilotSuffix(name) {
  return name.replace(/\s*\([A-Za-z]\)\s*$/, '').trim();
}
function avatarUrl(cardName) {
  return `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(stripPilotSuffix(cardName))}&format=image&version=art_crop`;
}
function cmdrAvatarHtml(val) {
  const normalized = (val || '').replace(/\r?\n/g, ' / ').trim();
  const parts = normalized.split(' / ');
  const imgs = parts.map(p =>
    `<img class="cmdr-avatar" src="${avatarUrl(p)}" alt="" loading="lazy" onerror="this.style.display='none'">`
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
