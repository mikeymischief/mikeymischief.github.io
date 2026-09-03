// ── Commander shared utilities ─────────────────────────────────────────────────
// Loaded before commander-stats.js on every commander page and on admin.html.
// Provides: CSV URL globals, _csvConfigReady promise, and string helpers.

// ── Shared CSV endpoints — sourced from /data/config.json ────────────────────
// To update after a Google Sheets republish: edit /data/config.json only.
let GAMES_CSV_URL     = '';
let DECK_CSV_URL      = '';
let CMDRSTATS_CSV_URL = '';
let TRUESKILL_CSV_URL = '';

const _csvConfigReady = fetch('/data/config.json')
  .then(r => r.json())
  .then(cfg => {
    GAMES_CSV_URL     = cfg.games;
    DECK_CSV_URL      = cfg.deck;
    CMDRSTATS_CSV_URL = cfg.cmdrstats;
    TRUESKILL_CSV_URL = cfg.trueskill || '';
  });

// ── TrueSkill parameters and helpers ─────────────────────────────────────────
// Must match the Google Sheet's calculation settings.
const TS_TAU_BASE = 5;    // base drift constant; actual tau scales with elapsed days
const TS_TAU_MAX_DAYS = 270; // cap at ~9 months
const TS_BETA = 400;
const TS_MU0  = 1500;
const TS_SIG0 = 500;

// Normal CDF via Abramowitz & Stegun rational approximation (|ε| < 7.5e-8).
function normCdf(x) {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989422820 * Math.exp(-x * x / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
  return x >= 0 ? 1 - p : p;
}

// Effective tau for an upcoming game given the commander's last-game date.
// Matches the sheet formula: TAU_BASE × √(min(daysSince, TAU_MAX_DAYS)).
// lastDateStr is a MM/DD/YYYY string from the TS sheet, or null for new commanders.
function tsEffectiveTau(lastDateStr) {
  if (!lastDateStr) return 0; // new commander: sigma_0 already captures uncertainty
  const ms = Date.now() - new Date(lastDateStr).getTime();
  const days = Math.max(0, Math.floor(ms / 86400000));
  return TS_TAU_BASE * Math.sqrt(Math.min(days, TS_TAU_MAX_DAYS));
}

// _tsMap: cmdrName → { mu, sigma, lastDate }  (most-recent row from TS sheet)
// _tsMapReady resolves once the fetch is complete (or failed).
// TS sheet cols: 0=Date, 1=Commander, 10=End Mu, 11=End Sigma
let _tsMap = {};
const _tsMapReady = _csvConfigReady.then(() => new Promise(resolve => {
  if (!TRUESKILL_CSV_URL) { resolve(); return; }
  Papa.parse(TRUESKILL_CSV_URL, {
    download: true,
    complete: function(results) {
      (results.data || []).slice(1).forEach(row => {
        const cmdr  = normalizeCmdr(row[1] || '');
        const mu    = parseFloat(row[10]);
        const sigma = parseFloat(row[11]);
        if (!cmdr || isNaN(mu) || isNaN(sigma)) return;
        _tsMap[cmdr] = { mu, sigma, lastDate: (row[0] || '').trim() || null };
      });
      resolve();
    },
    error: function() { resolve(); }
  });
}));

// Compute TrueSkill win probabilities for an array of { mu, sigma, lastDate } ratings.
// Returns an array of win-probability percentages in the same order.
// Formula: rawProb_i = Φ((2μ_i − podMuSum) / √podVarSum), normalized to 100%.
// Variance per player accounts for elapsed-time drift: σ² + effectiveTau² + β².
function tsPodWinProbs(ratings) {
  function varFor(r) {
    const tau = tsEffectiveTau(r.lastDate);
    return r.sigma * r.sigma + tau * tau + TS_BETA * TS_BETA;
  }
  const podMuSum  = ratings.reduce((s, r) => s + r.mu, 0);
  const podVarSum = ratings.reduce((s, r) => s + varFor(r), 0);
  const denom = Math.sqrt(podVarSum);
  const raw   = ratings.map(r => normCdf((2 * r.mu - podMuSum) / denom));
  const total = raw.reduce((s, v) => s + v, 0);
  return raw.map(v => total > 0 ? v / total * 100 : 100 / ratings.length);
}

// ── String helpers ────────────────────────────────────────────────────────────
function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Newline = partner pair separator → ' / '
function normalizeCmdr(v) {
  if (!v) return '';
  return v.replace(/\r?\n/g, ' / ').trim();
}

// Strip trailing pilot-letter suffix, e.g. "Sisay (A)" → "Sisay"
function stripPilotSuffix(name) {
  return name.replace(/\s*\([A-Za-z]\)\s*$/, '').trim();
}
