// ── Commander shared utilities ─────────────────────────────────────────────────
// Loaded before commander-stats.js on every commander page and on admin.html.
// Provides: CSV URL globals, _csvConfigReady promise, and string helpers.

// ── Shared CSV endpoints — sourced from /data/config.json ────────────────────
// To update after a Google Sheets republish: edit /data/config.json only.
let GAMES_CSV_URL     = '';
let DECK_CSV_URL      = '';
let CMDRSTATS_CSV_URL = '';

const _csvConfigReady = fetch('/data/config.json')
  .then(r => r.json())
  .then(cfg => {
    GAMES_CSV_URL     = cfg.games;
    DECK_CSV_URL      = cfg.deck;
    CMDRSTATS_CSV_URL = cfg.cmdrstats;
  });

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
