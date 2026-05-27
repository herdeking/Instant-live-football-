// ============================================
// FIREBASE MATCH LOADER — efootball.com.ng
// Upload this file to your GitHub repo root
// then add this to index.html before </body>:
// <script src="firebase-loader.js"></script>
// ============================================

(function() {
  const firebaseConfig = {
    apiKey: "AIzaSyC7DzEQEgpeyBcsUo_QaKl7faeYRer8e2E",
    authDomain: "instantlivefootball.firebaseapp.com",
    projectId: "instantlivefootball",
    storageBucket: "instantlivefootball.firebasestorage.app",
    messagingSenderId: "584488048641",
    appId: "1:584488048641:web:7adf83799426222a5fc800"
  };

  // Wait for Firebase SDK to be ready
  function waitForFirebase(cb) {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      cb();
    } else {
      setTimeout(() => waitForFirebase(cb), 100);
    }
  }

  // Wait for page to fully load
  window.addEventListener('load', function() {
    waitForFirebase(function() {
      try {
        // Init Firebase (safe — won't re-init if already done)
        if (!firebase.apps || !firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
      } catch(e) {}

      loadMatchesFromFirebase();
    });
  });

  function loadMatchesFromFirebase() {
    const list = document.getElementById('match-list');
    if (!list) return;

    // Show loading
    list.innerHTML = '<div style="display:flex;align-items:center;gap:10px;padding:20px;color:#8a9ab0;font-family:Barlow Condensed,sans-serif;font-size:.85rem;"><div style="width:16px;height:16px;border:2px solid #1e2d3d;border-top-color:#00e96b;border-radius:50%;animation:spin .7s linear infinite;flex-shrink:0"></div><span>Loading matches…</span></div>';

    const db = firebase.firestore();

    db.collection('matches')
      .orderBy('date', 'desc')
      .get()
      .then(function(snapshot) {
        const loadedMatches = [];
        snapshot.forEach(function(doc) {
          const data = doc.data();
          // Skip hidden matches
          if (data.hidden) return;
          loadedMatches.push({ id: doc.id, ...data });
        });

        if (loadedMatches.length === 0) {
          list.innerHTML = '<div style="text-align:center;padding:32px 16px;color:#4a5a6a;font-family:Barlow Condensed,sans-serif;font-size:.85rem;">No matches scheduled today</div>';
          return;
        }

        // Override the global matches array if it exists
        if (typeof window.matches !== 'undefined') {
          window.matches = loadedMatches;
        }

        // Call renderAll if it exists
        if (typeof window.renderAll === 'function') {
          window.renderAll();
          return;
        }

        // Otherwise build the match list ourselves
        buildCards(loadedMatches, list);

        // Update live count
        const liveCount = loadedMatches.filter(m => m.status === 'live').length;
        const liveEl = document.getElementById('live-count');
        if (liveEl) liveEl.textContent = liveCount + ' Live';

        // Update match count
        const mcEl = document.getElementById('mc');
        if (mcEl) mcEl.textContent = loadedMatches.length + ' match' + (loadedMatches.length !== 1 ? 'es' : '');

      })
      .catch(function(err) {
        console.error('Firebase load error:', err);
        list.innerHTML = '<div style="text-align:center;padding:24px;color:#4a5a6a;font-family:Barlow Condensed,sans-serif;font-size:.82rem;">Could not load matches. <span style="color:#00e96b;cursor:pointer" onclick="location.reload()">Tap to retry</span></div>';
      });
  }

  function buildCards(matches, container) {
    const order = { live: 0, upcoming: 1, finished: 2 };
    matches.sort((a, b) => (order[a.status] ?? 2) - (order[b.status] ?? 2));

    container.innerHTML = matches.map(function(m) {
      const isLive = m.status === 'live';
      const isFt = m.status === 'finished';
      const score = (isLive || isFt) ? (m.hscore + ' - ' + m.ascore) : (m.time || 'TBC');
      const badgeColor = isLive ? '#ff3535' : isFt ? '#4a5a6a' : '#ffc107';
      const badgeText = isLive ? '🔴 LIVE ' + (m.minute || '') : isFt ? 'FT' : (m.time || 'Soon');
      const btnText = isLive ? '▶ Watch Live' : isFt ? '▶ Replay' : '⏰ Reminder';
      const btnBg = isLive ? '#00a854' : isFt ? '#1565c0' : '#b35c00';

      return `<div style="background:#0d1117;border:1px solid #1e2d3d;border-radius:12px;overflow:hidden;margin-bottom:10px;cursor:pointer" onclick="window._openMatch && window._openMatch('${m.id}')">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#131920;border-bottom:1px solid #1e2d3d">
          <span style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:.68rem;letter-spacing:1.5px;text-transform:uppercase;color:#8a9ab0">${m.comp || 'Football'}${m.round ? ' · ' + m.round : ''}</span>
          <span style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:.68rem;color:${badgeColor}">${badgeText}</span>
        </div>
        <div style="padding:16px 14px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
            <div style="flex:1;text-align:center">
              <div style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:.9rem;color:#e8edf2">${m.home}</div>
            </div>
            <div style="font-family:Bebas Neue,sans-serif;font-size:2rem;letter-spacing:4px;color:#e8edf2;padding:0 12px">${score}</div>
            <div style="flex:1;text-align:center">
              <div style="font-family:Barlow Condensed,sans-serif;font-weight:700;font-size:.9rem;color:#e8edf2">${m.away}</div>
            </div>
          </div>
          <button onclick="event.stopPropagation();window._openMatch && window._openMatch('${m.id}')" style="width:100%;background:${btnBg};color:#fff;border:none;border-radius:8px;padding:11px;font-family:Barlow Condensed,sans-serif;font-weight:900;font-size:.85rem;letter-spacing:2px;cursor:pointer">${btnText}</button>
        </div>
      </div>`;
    }).join('');

    // Store matches globally so watch modal can access them
    window._firebaseMatches = matches;
    window._openMatch = function(id) {
      const match = matches.find(x => x.id === id);
      if (match && typeof window.openWatch === 'function') {
        window.openWatch(match);
      }
    };
  }

})();
