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
    // Check if link exists, create if not
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
    // Find all clickable elements
    var buttons = document.querySelectorAll('a[href], button, [role="button"], input[type="submit"], .btn, [class*="button"], [class*="btn"]');
    var seen = {};

    buttons.forEach(function(btn) {
      var text = cleanText(btn.textContent || btn.value || '');
      if (!text || text.length < 2) return;

      // Generate unique name
      var baseName = PREFIX + '-' + text;
      if (seen[baseName]) {
        seen[baseName]++;
        baseName = baseName + '-' + seen[baseName];
      } else {
        seen[baseName] = 1;
      }
      var linkName = baseName;

      // Ensure the link exists in Supabase
      ensureLink(linkName);

      // Track click
      btn.addEventListener('click', function() {
        trackClick(linkName);
      });
    });

    // Also track form submissions
    document.addEventListener('submit', function() {
      trackClick(PREFIX + '-form-submit');
      ensureLink(PREFIX + '-form-submit');
    });
  });
})();
