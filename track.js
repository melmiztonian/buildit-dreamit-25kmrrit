/*
  HelloMelmo Button Tracker

  Paste this on any Shopify page to auto-track every button click.
  Set PAGE_PREFIX and FUNNEL_STAGE for the page.

  Usage: Add to the bottom of your page before </body>:

  <script>
  var PAGE_PREFIX = 'tw';        // e.g. tw, cp, beta, hub
  var FUNNEL_STAGE = 'tw-page';  // must match a funnel stage ID
  </script>
  <script src="https://melmiztonian.github.io/buildit-dreamit-25kmrrit/track.js"></script>
*/

(function() {
  var SB = 'https://ingvjqyqoqggskkrklhk.supabase.co';
  var KEY = 'sb_publishable_a_7d3ojYoI3Glt0R9AMbhA_1rH_urFn';
  var PREFIX = window.PAGE_PREFIX || 'page';
  var STAGE = window.FUNNEL_STAGE || 'link-click';
  var PAGE_URL = window.location.href;

  function getVid() {
    var v = localStorage.getItem('_vid');
    if (!v) {
      v = 'v_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('_vid', v);
    }
    return v;
  }

  function cleanText(s) {
    return s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30);
  }

  // Extract a meaningful section name from Shopify section IDs
  // e.g. "shopify-section-template--20311414636730__final_cta_section_jeDdjw" -> "final-cta-section"
  function getSectionName(el) {
    var section = el.closest('[id*="shopify-section"], section[id], [id]');
    if (!section || !section.id) return null;
    var id = section.id;
    // Shopify format: shopify-section-template--{number}__{name}_{hash}
    var match = id.match(/__([a-zA-Z_]+)/);
    if (match) {
      // Remove trailing hash (last _ followed by random chars)
      var name = match[1].replace(/_[a-zA-Z0-9]{4,}$/, '');
      return name.replace(/_/g, '-').replace(/-+$/, '');
    }
    // Fallback: use the id directly, cleaned up
    return cleanText(id).slice(0, 25);
  }

  function trackClick(name) {
    fetch(SB + '/rest/v1/link_clicks', {
      method: 'POST',
      headers: {
        'apikey': KEY,
        'Authorization': 'Bearer ' + KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        link_name: name,
        visitor_id: getVid(),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent || null
      }),
      keepalive: true
    }).catch(function() {});
  }

  function ensureLink(name) {
    fetch(SB + '/rest/v1/links?name=eq.' + encodeURIComponent(name) + '&select=name', {
      headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY }
    }).then(function(r) { return r.json(); }).then(function(rows) {
      if (!rows.length) {
        fetch(SB + '/rest/v1/links', {
          method: 'POST',
          headers: {
            'apikey': KEY,
            'Authorization': 'Bearer ' + KEY,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            name: name,
            destination: PAGE_URL,
            funnel_stage: STAGE
          })
        }).catch(function() {});
      }
    }).catch(function() {});
  }

  window.addEventListener('load', function() {
    var buttons = document.querySelectorAll('a[href], button, [role="button"], input[type="submit"], .btn, [class*="button"], [class*="btn"]');
    var seen = {};

    buttons.forEach(function(btn) {
      var text = cleanText(btn.textContent || btn.value || '');
      if (!text || text.length < 2) return;

      // Get section name from parent Shopify section
      var section = getSectionName(btn);

      // Try to find a nearby tagline, heading, or title to make the name unique
      var context = '';
      var card = btn.closest('[class*="window"], [class*="card"], [class*="block"], [class*="item"], [class*="slide"]');
      if (card) {
        var tagline = card.querySelector('[class*="tagline"], [class*="subtitle"], [class*="eyebrow"], [class*="titlebar-text"]');
        if (tagline && tagline.textContent.trim()) {
          context = cleanText(tagline.textContent);
        } else {
          var heading = card.querySelector('h2, h3, h4, [class*="heading"]');
          if (heading && heading.textContent.trim()) {
            context = cleanText(heading.textContent).slice(0, 25);
          }
        }
      }

      // Build name: prefix-section-context-buttontext or prefix-section-buttontext
      var baseName;
      if (context) {
        baseName = PREFIX + '-' + (section ? section + '-' : '') + context;
      } else {
        baseName = section ? PREFIX + '-' + section + '-' + text : PREFIX + '-' + text;
      }

      // Number duplicates (fallback, shouldn't happen often with context)
      if (seen[baseName]) {
        seen[baseName]++;
        var linkName = baseName + '-' + seen[baseName];
      } else {
        seen[baseName] = 1;
        var linkName = baseName;
      }

      ensureLink(linkName);

      btn.addEventListener('click', function() {
        trackClick(linkName);
      });
    });

    // Also track form submissions
    document.addEventListener('submit', function() {
      trackClick(PREFIX + '-form-submit');
      ensureLink(PREFIX + '-form-submit');
    });

    // Track Shopify Buy Button iframes (product-component-* containers)
    // These load dynamically, so poll until iframes appear
    function setupBuyButtons() {
      var containers = document.querySelectorAll('[id^="product-component"]');
      containers.forEach(function(container) {
        if (container.dataset.tracked) return;
        var iframe = container.querySelector('iframe');
        if (!iframe) return;

        container.dataset.tracked = '1';

        // Find nearest Shopify section + heading for naming
        var shopifySection = container.closest('[id*="shopify-section"]');
        var sectionName = '';
        if (shopifySection) {
          var match = shopifySection.id.match(/__([a-zA-Z_]+)/);
          if (match) sectionName = match[1].replace(/_[a-zA-Z0-9]{4,}$/, '').replace(/_/g, '-').replace(/-+$/, '');
        }
        var heading = shopifySection ? shopifySection.querySelector('h2, h3, [class*="heading"], [class*="tagline"]') : null;
        var context = heading ? cleanText(heading.textContent).slice(0, 30) : '';

        var linkName = PREFIX + '-buy-' + (sectionName || 'section') + (context ? '-' + context : '');
        ensureLink(linkName);

        // Detect iframe click via blur/focus
        var focused = false;
        container.addEventListener('mouseenter', function() { focused = true; });
        container.addEventListener('mouseleave', function() { focused = false; });
        window.addEventListener('blur', function() {
          if (focused) {
            trackClick(linkName);
            focused = false;
            setTimeout(function() { window.focus(); }, 100);
          }
        });
      });
    }

    // Poll for buy button iframes (they load async)
    setupBuyButtons();
    var pollCount = 0;
    var pollInterval = setInterval(function() {
      setupBuyButtons();
      pollCount++;
      if (pollCount > 20) clearInterval(pollInterval);
    }, 500);

    // Also track form submissions
    document.addEventListener('submit', function() {
      trackClick(PREFIX + '-form-submit');
      ensureLink(PREFIX + '-form-submit');
    });
  });
})();
