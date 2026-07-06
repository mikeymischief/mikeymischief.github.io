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
