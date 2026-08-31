// ── Mana symbol & card reference renderer ─────────────────────────────────────
(function () {
  var symbolMap = {
    'W':'ms-w', 'U':'ms-u', 'B':'ms-b', 'R':'ms-r', 'G':'ms-g',
    'C':'ms-c', 'X':'ms-x', 'Y':'ms-y', 'Z':'ms-z',
    'T':'ms-tap', 'Q':'ms-untap', 'S':'ms-s', 'E':'ms-e',
    '0':'ms-0','1':'ms-1','2':'ms-2','3':'ms-3','4':'ms-4',
    '5':'ms-5','6':'ms-6','7':'ms-7','8':'ms-8','9':'ms-9',
    '10':'ms-10','11':'ms-11','12':'ms-12','13':'ms-13','14':'ms-14',
    '15':'ms-15','16':'ms-16','17':'ms-17','18':'ms-18','19':'ms-19','20':'ms-20',
    'W/U':'ms-wu','W/B':'ms-wb','U/B':'ms-ub','U/R':'ms-ur',
    'B/R':'ms-br','B/G':'ms-bg','R/G':'ms-rg','R/W':'ms-rw',
    'G/W':'ms-gw','G/U':'ms-gu',
    'W/P':'ms-wp','U/P':'ms-up','B/P':'ms-bp','R/P':'ms-rp','G/P':'ms-gp',
    '2/W':'ms-2w','2/U':'ms-2u','2/B':'ms-2b','2/R':'ms-2r','2/G':'ms-2g'
  };

  function manaHTML(sym) {
    var upper = sym.toUpperCase();
    var cls = symbolMap[upper];
    // For hybrid symbols, try the reversed order if the first lookup fails
    if (!cls && upper.indexOf('/') !== -1) {
      var parts = upper.split('/');
      cls = symbolMap[parts[1] + '/' + parts[0]];
    }
    if (!cls) return '{' + sym + '}';
    return '<i class="ms ms-cost ms-shadow ' + cls + '" title="{' + sym + '}"></i>';
  }

  function replaceInText(text) {
    return text.replace(/\{([^}]+)\}/g, function (match, sym) {
      return manaHTML(sym);
    });
  }

  // [[Card Name]] → hoverable anchor using Scryfall named card image API
  function replaceCardRefs(text) {
    return text.replace(/\[\[([^\]]+)\]\]/g, function (match, name) {
      var encoded = encodeURIComponent(name);
      var href = 'https://api.scryfall.com/cards/named?fuzzy=' + encoded + '&format=image';
      return '<a href="' + href + '" class="card-ref">' + name + '</a>';
    });
  }

  function processNode(node) {
    if (node.nodeType === 3) {
      var hasSymbol = node.textContent.indexOf('{') !== -1;
      var hasCard   = node.textContent.indexOf('[[') !== -1;
      if (!hasSymbol && !hasCard) return;
      var span = document.createElement('span');
      span.innerHTML = node.textContent
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      if (hasCard)   span.innerHTML = replaceCardRefs(span.innerHTML);
      if (hasSymbol) span.innerHTML = replaceInText(span.innerHTML);
      node.parentNode.replaceChild(span, node);
    } else if (node.nodeType === 1) {
      var tag = node.tagName;
      if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') return;
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    var main = document.getElementById('main');
    if (main) processNode(main);
  });
})();

// ── Card image popup on hover ──────────────────────────────────────────────────
(function () {
  var popup    = document.getElementById('card-popup');
  var popupImg = document.getElementById('card-popup-img');
  var fadeTimer = null;

  // Match local /images/mtg/ links (blog post style) and Scryfall named API ([[...]] style)
  function isCardLink(href) {
    return href && (
      /\/images\/mtg\/.*\.(jpg|png|jpeg)/i.test(href) ||
      /api\.scryfall\.com\/cards\/named/.test(href)
    );
  }

  function showPopup(e, src) {
    clearTimeout(fadeTimer);
    popupImg.src = src;
    popup.style.opacity = '0';
    popup.style.display = 'block';
    popup.style.transition = 'opacity 0.15s ease';
    positionPopup(e);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { popup.style.opacity = '1'; });
    });
  }

  function hidePopup() {
    popup.style.transition = 'opacity 0.2s ease';
    popup.style.opacity = '0';
    fadeTimer = setTimeout(function () { popup.style.display = 'none'; }, 200);
  }

  function positionPopup(e) {
    var x = e.clientX, y = e.clientY;
    var pw = 220, ph = 310;
    var vw = window.innerWidth, vh = window.innerHeight;
    var left = Math.min(x + 16, vw - pw - 16);
    var top  = y - ph - 16;
    if (top < 8) top = y + 24;
    popup.style.left = left + 'px';
    popup.style.top  = top  + 'px';
  }

  document.addEventListener('mouseover', function (e) {
    var a = e.target.closest('a');
    if (a && isCardLink(a.getAttribute('href'))) showPopup(e, a.getAttribute('href'));
  });

  document.addEventListener('mousemove', function (e) {
    if (popup.style.display !== 'none') positionPopup(e);
  });

  document.addEventListener('mouseout', function (e) {
    var a = e.target.closest('a');
    if (a && isCardLink(a.getAttribute('href'))) hidePopup();
  });

  // Prevent navigation — these links exist only for the popup
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a');
    if (a && isCardLink(a.getAttribute('href'))) e.preventDefault();
  });
})();
