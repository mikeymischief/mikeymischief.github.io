---
published: true
layout: post
title: I Built a Commander Site
author: mikey
date: 2026-07-12 12:00:00 -0800
comments: true
excerpt_separator: <!--more-->
categories: mtg commander
image: /images/bg/commander/Kenrith-the-Returned-King-Throne-of-Eldraine-MtG-Art.jpg
---

For the past few years, Gerf, Brian, and I have been playing Commander pretty regularly — and for most of that time I've been logging our games in a spreadsheet. Match results, commanders played, win rates, that kind of thing. At some point the spreadsheet got detailed enough that it felt wrong to leave it buried in Google Sheets, so I turned it into a proper site. Cube is my heart and soul, but getting six people together for a draft is a logistical nightmare — Commander only needs four (three in our case), so it ends up winning the scheduling battle more often than not.

I've decided that more metrics is better, so starting with the next play session on August 8th, we'll be tracking how long games last and how many mulligans you take for your commanders. I think building out the full site to match player expectation and keep track of everything we're doing is an awesome way to keep the momentum of playing Commander (aka Magic) going for a long time. Hopefully, in a couple more years, the stats will be more full-bodied, leading to much more insights about this wonderful format.

All that said, here's what's there now.

<!--more-->

<div style="position:relative;width:100%;height:60px;border-radius:6px;overflow:hidden;margin:24px 0;">
  <img src="/images/bg/commander/Bury-in-Books-Strixhaven-MtG-Art.jpg" alt="" style="display:block;width:100%;height:100%;object-fit:cover;object-position:center 40%;opacity:0.75;"/>
  <div style="position:absolute;inset:0;background:rgba(13,15,26,0.5);display:flex;align-items:center;justify-content:flex-start;">
    <span style="font-family:'Cinzel',serif;font-size:0.85rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#e8d5a3;margin-left:16px;">Commander Pages</span>
  </div>
</div>

## [Commander](/commander-dashboard/)

The landing page. It gives a quick rundown of the format for anyone unfamiliar, links out to useful resources like the ban list, EDHREC, and Scryfall, and has a rotating spotlight on commanders we've played. There's also a "Next Session" banner when we have something scheduled.

## [Stats](/players/)

The meat of the site. Each player gets a card with their full commander history — every deck they've piloted, win/loss record, and a TrueSkill rating that tries to account for the four-player free-for-all format better than raw win percentage ever could. TrueSkill was originally developed by Microsoft for Xbox matchmaking, and it works well here because it handles uncertainty: a player who's gone 3-0 with a new deck is ranked differently than someone who's gone 30-0 over two years.

Commanders are sorted by play count and color-coded by tier — S through D — based on where each one lands relative to the pod's rating distribution.

## [History](/game-history/)

A full log of every game, newest first. Each row shows who played what, who won, and links to the commander's Scryfall page. You can filter by player to see their game-by-game record, or dig into specific matchup history. The "latest game" is automatically detected from the data so it's always current.

## [Insights](/insights/)

This is where I got a little nerdy. Insights breaks down things like seating patterns (does going first matter in our pod?), commander popularity over time, which color combinations have the best win rates, and a head-to-head matchup table. Some of it is small-sample-size territory, but even with the games we have logged, some trends are already starting to take shape.

## [Colors](/commander-colors/)

A breakdown of every commander we've played by color identity. You can see which color pairs or combinations show up most often, which ones win more, and how the meta has shifted over time. Our pod skews heavily toward blue, which surprises absolutely no one who has played with us.

## [FAQ](/faq/)

Answers the questions that come up whenever someone looks at the site for the first time — how TrueSkill works, what counts as a win, how the tier bands are calculated, and why certain commanders show up multiple times in someone's history.

---

The whole thing pulls live from the same Google Sheet I've been using for years, so there's no manual publishing step — log the game in the sheet, and the site updates on the next page load. Ratings are recomputed from scratch on every visit using the full game history.

I put a lot of work into this site, so if you're reading this, please provide some constructive feedback; anything helps.

I'll keep adding to it as we play. If you want to dig in, [start here](/commander-dashboard/).

{% if page.comments %}
<div id="disqus_thread"></div>
<script>
(function() {
var d = document, s = d.createElement('script');
s.src = 'https://mikeymischief-github-io.disqus.com/embed.js';
s.setAttribute('data-timestamp', +new Date());
(d.head || d.body).appendChild(s);
})();
</script>
<noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
<script id="dsq-count-scr" src="//mikeymischief-github-io.disqus.com/count.js" async></script>
{% endif %}
