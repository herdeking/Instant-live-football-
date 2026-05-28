// ============================================
// AUTO STATUS UPDATER — Admin Dashboard
// Adds "Mark LIVE" and "Mark FT" quick buttons
// Add this to admin-dashboard.html before </body>
// <script src="auto-status-updater.js"></script>
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

  function waitForFirebase(cb) {
    if (typeof firebase !== 'undefined' && firebase.firestore) cb();
    else setTimeout(() => waitForFirebase(cb), 100);
  }

  window.addEventListener('load', function() {
    waitForFirebase(function() {
      try {
        if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
      } catch(e) {}
      injectQuickButtons();
      startAutoUpdater();
    });
  });

  // ===== INJECT QUICK BUTTONS INTO MATCH CARDS =====
  function injectQuickButtons() {
    // Run every 2 seconds to catch newly rendered cards
    setInterval(addButtonsToCards, 2000);
    addButtonsToCards();
  }

  function addButtonsToCards() {
    // Find all match cards that don't have quick buttons yet
    const cards = document.querySelectorAll('[data-match-id]:not([data-quick-added])');
    cards.forEach(card => {
      const matchId = card.getAttribute('data-match-id');
      const status = card.getAttribute('data-status') || '';
      if (!matchId) return;

      card.setAttribute('data-quick-added', '1');

      // Create quick action bar
      const bar = document.createElement('div');
      bar.style.cssText = 'display:flex;gap:6px;padding:6px 10px;background:rgba(0,0,0,0.2);border-top:1px solid rgba(255,255,255,0.05);flex-wrap:wrap';

      if (status !== 'live') {
        const liveBtn = makeBtn('🔴 MARK LIVE', '#bb1919', () => updateStatus(matchId, 'live', card));
        bar.appendChild(liveBtn);
      }
      if (status !== 'finished') {
        const ftBtn = makeBtn('✅ MARK FT', '#007a3d', () => updateStatus(matchId, 'finished', card));
        bar.appendChild(ftBtn);
      }
      if (status !== 'upcoming') {
        const upBtn = makeBtn('⏰ MARK UPCOMING', '#b35c00', () => updateStatus(matchId, 'upcoming', card));
        bar.appendChild(upBtn);
      }

      if (bar.children.length > 0) card.appendChild(bar);
    });
  }

  function makeBtn(label, color, onClick) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.style.cssText = `background:${color};color:#fff;border:none;border-radius:4px;padding:5px 10px;font-size:.65rem;font-weight:700;cursor:pointer;letter-spacing:1px;font-family:Oswald,Barlow Condensed,sans-serif`;
    btn.onclick = onClick;
    return btn;
  }

  // ===== UPDATE STATUS IN FIREBASE =====
  function updateStatus(matchId, newStatus, card) {
    if (!confirm(`Mark this match as "${newStatus.toUpperCase()}"?`)) return;
    const db = firebase.firestore();
    const update = { status: newStatus };
    if (newStatus === 'finished') {
      update.minute = 90;
    } else if (newStatus === 'live') {
      update.minute = update.minute || 1;
    }
    db.collection('matches').doc(matchId).update(update)
      .then(() => {
        showAdminToast(`✅ Match marked as ${newStatus.toUpperCase()}!`);
        // Update card attribute and refresh buttons
        card.setAttribute('data-status', newStatus);
        const bar = card.querySelector('[data-quick-added]');
        if (bar) bar.remove();
        card.removeAttribute('data-quick-added');
        setTimeout(addButtonsToCards, 100);
      })
      .catch(err => {
        showAdminToast('❌ Update failed: ' + err.message);
      });
  }

  // ===== AUTO UPDATER — scans all matches every minute =====
  function startAutoUpdater() {
    autoScanAndUpdate();
    setInterval(autoScanAndUpdate, 60000); // every 60 seconds
  }

  function autoScanAndUpdate() {
    const db = firebase.firestore();
    db.collection('matches').get().then(snapshot => {
      const now = new Date();
      const batch = db.batch();
      let updateCount = 0;

      snapshot.forEach(doc => {
        const m = doc.data();
        if (m.status === 'finished') return; // don't touch finished matches

        let matchTime = null;
        try {
          if (m.date && m.date.seconds) {
            matchTime = new Date(m.date.seconds * 1000);
          } else if (m.date) {
            const timeStr = m.time || '00:00';
            matchTime = new Date(m.date + ' ' + timeStr);
          }
        } catch(e) {}

        if (!matchTime || isNaN(matchTime)) return;

        const diffMinutes = (now - matchTime) / 60000;

        // Auto mark as LIVE if kickoff time has passed (within 105 mins)
        if (diffMinutes >= -5 && diffMinutes < 105 && m.status !== 'live') {
          const autoMinute = Math.min(Math.max(Math.floor(diffMinutes), 1), 90);
          batch.update(doc.ref, { status: 'live', minute: autoMinute });
          updateCount++;
        }

        // Auto mark as FINISHED after 105 minutes
        if (diffMinutes >= 105 && m.status !== 'finished') {
          batch.update(doc.ref, { status: 'finished', minute: 90 });
          updateCount++;
        }
      });

      if (updateCount > 0) {
        batch.commit().then(() => {
          console.log(`✅ Auto-updated ${updateCount} match(es)`);
          showAdminToast(`🔄 Auto-updated ${updateCount} match status${updateCount > 1 ? 'es' : ''}`, 3000);
        });
      }
    });
  }

  // ===== ADMIN TOAST =====
  function showAdminToast(msg, duration = 2500) {
    let toast = document.getElementById('admin-auto-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-auto-toast';
      toast.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(20px);background:#1a1a1a;color:#fff;border-radius:8px;padding:10px 20px;font-family:Oswald,sans-serif;font-size:.82rem;letter-spacing:1px;z-index:9999;opacity:0;transition:all .3s;pointer-events:none;white-space:nowrap;border-left:3px solid #ffcc00';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, duration);
  }

})();
