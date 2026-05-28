// ============================================
// FIREBASE MATCH LOADER — instantlivefootball.com.ng
// Auto-status + sorted by time + multi-stream
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
      loadMatchesFromFirebase();
    });
  });

  // ===== AUTO STATUS CALCULATOR =====
  function calcAutoStatus(match) {
    // If admin already set a definitive status, respect it
    if (match.status === 'finished') return 'finished';

    try {
      const now = new Date();

      // Get match datetime
      let matchTime = null;
      if (match.date && match.date.seconds) {
        // Firestore timestamp
        matchTime = new Date(match.date.seconds * 1000);
      } else if (match.date) {
        // String date
        const timeStr = match.time || '00:00';
        matchTime = new Date(match.date + ' ' + timeStr);
        if (isNaN(matchTime)) {
          // Try parsing date only and add time
          matchTime = new Date(match.date);
          if (!isNaN(matchTime) && match.time) {
            const [h, m] = match.time.split(':').map(Number);
            matchTime.setHours(h, m, 0, 0);
          }
        }
      }

      if (!matchTime || isNaN(matchTime)) return match.status || 'upcoming';

      const diffMinutes = (now - matchTime) / 60000;

      if (diffMinutes < -5) {
        // More than 5 mins before kickoff → upcoming
        return 'upcoming';
      } else if (diffMinutes >= -5 && diffMinutes < 105) {
        // Between 5 mins before kickoff and 105 mins after → live
        // (90 mins match + 15 mins extra time buffer)
        if (match.status === 'finished') return 'finished'; // admin overrides
        return 'live';
      } else {
        // More than 105 mins after kickoff → finished
        return 'finished';
      }
    } catch(e) {
      return match.status || 'upcoming';
    }
  }

  // ===== AUTO MINUTE CALCULATOR =====
  function calcAutoMinute(match) {
    if (match.minute) return match.minute; // use admin-set minute
    try {
      let matchTime = null;
      if (match.date && match.date.seconds) {
        matchTime = new Date(match.date.seconds * 1000);
      } else if (match.date) {
        const timeStr = match.time || '00:00';
        matchTime = new Date(match.date + ' ' + timeStr);
      }
      if (!matchTime || isNaN(matchTime)) return null;
      const diffMinutes = Math.floor((new Date() - matchTime) / 60000);
      if (diffMinutes < 0) return null;
      if (diffMinutes <= 45) return diffMinutes;
      if (diffMinutes <= 60) return 45; // half time
      if (diffMinutes <= 105) return diffMinutes - 15; // 2nd half (minus half time break)
      return 90;
    } catch(e) { return null; }
  }

  // ===== LOAD MATCHES =====
  function loadMatchesFromFirebase() {
    const list = document.getElementById('match-list');
    if (!list) return;
    list.innerHTML = '<div class="ls-loading"><div class="ls-spinner"></div><span>Loading matches…</span></div>';

    const db = firebase.firestore();
    db.collection('matches').orderBy('date', 'desc').get()
      .then(function(snapshot) {
        const loaded = [];
        snapshot.forEach(function(doc) {
          const d = doc.data();
          if (!d.hidden) {
            const match = { id: doc.id, ...d };

            // Auto-calculate status based on time
            const autoStatus = calcAutoStatus(match);

            // Only upgrade status automatically — don't downgrade admin-set 'finished'
            if (match.status !== 'finished') {
              match.status = autoStatus;
            }

            // Auto-calculate minute if live and not set
            if (match.status === 'live' && !match.minute) {
              const autoMin = calcAutoMinute(match);
              if (autoMin) match.minute = autoMin;
            }

            // Build streams array
            if (!match.streams || !match.streams.length) {
              const streams = [];
              if (match.stream) streams.push({url: match.stream, label: 'Server 1'});
              if (match.stream2) streams.push({url: match.stream2, label: 'Server 2'});
              if (match.stream3) streams.push({url: match.stream3, label: 'Server 3'});
              if (streams.length) match.streams = streams;
            }

            loaded.push(match);
          }
        });

        window._matches = loaded;
        if (typeof window.matches !== 'undefined') window.matches = loaded;

        if (!loaded.length) {
          list.innerHTML = '<div class="empty-state"><p>No matches today</p></div>';
          updateCounts(loaded);
          return;
        }

        buildCards(loaded, list);
        updateCounts(loaded);
        updateFeatured(loaded);
        updateLiveScores(loaded);

        // Auto-refresh every 60 seconds to keep statuses current
        setTimeout(loadMatchesFromFirebase, 60000);
      })
      .catch(function(err) {
        console.error('Firebase error:', err);
        list.innerHTML = '<div class="ls-loading"><span style="color:#bb1919">Failed to load. <span onclick="location.reload()" style="cursor:pointer;text-decoration:underline">Retry</span></span></div>';
      });
  }

  // ===== COUNTS =====
  function updateCounts(matches) {
    const n = matches.filter(m => m.status === 'live').length;
    const liveEl = document.getElementById('live-count');
    if (liveEl) liveEl.textContent = n + ' Live';
    const mcEl = document.getElementById('mc');
    if (mcEl) mcEl.textContent = matches.length + ' match' + (matches.length !== 1 ? 'es' : '');
  }

  // ===== FEATURED =====
  function updateFeatured(matches) {
    const live = matches.filter(m => m.status === 'live');
    if (!live.length) return;
    const m = live[0];
    const card = document.getElementById('feat-card');
    if (card) { card.style.display = 'block'; window._featIdx = matches.indexOf(m); }
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('feat-comp', m.comp || '');
    set('feat-hname', m.home);
    set('feat-aname', m.away);
    set('feat-hs', m.hscore ?? 0);
    set('feat-as', m.ascore ?? 0);
    const hl = document.getElementById('feat-hlogo'); if (hl && m.hlogo) hl.src = m.hlogo;
    const al = document.getElementById('feat-alogo'); if (al && m.alogo) al.src = m.alogo;
  }

  window.openFeatWatch = function() {
    if (window._featIdx !== undefined) openMatchByIndex(window._featIdx);
  };

  window.openMatchByIndex = function(idx) {
    const m = window._matches && window._matches[idx];
    if (!m) return;
    if (typeof window.openWatch === 'function') {
      window.openWatch(m);
    } else if (m.status === 'upcoming') {
      if (typeof window.showToast === 'function') {
        window.showToast('⏰ Reminder set for ' + m.home + ' vs ' + m.away + '!', 3500);
      } else {
        alert('⏰ Reminder set!\n' + m.home + ' vs ' + m.away + '\nKick-off: ' + (m.time || 'TBC'));
      }
    }
  };

  // ===== BUILD CARDS =====
  function buildCards(matches, container) {
    // Sort: live first, then upcoming by time, then finished
    const order = { live: 0, upcoming: 1, finished: 2 };
    const sorted = [...matches].sort((a, b) => {
      const sa = order[a.status] ?? 1;
      const sb = order[b.status] ?? 1;
      if (sa !== sb) return sa - sb;
      // Same status: sort by time
      const getTime = m => {
        try {
          if (m.date && m.date.seconds) return m.date.seconds;
          const t = new Date((m.date || '') + ' ' + (m.time || '00:00'));
          return isNaN(t) ? 0 : t.getTime() / 1000;
        } catch(e) { return 0; }
      };
      return getTime(a) - getTime(b);
    });

    // Group by date
    const groups = {};
    sorted.forEach(m => {
      let dk = 'Today';
      try {
        let d;
        if (m.date && m.date.seconds) d = new Date(m.date.seconds * 1000);
        else if (m.date) d = new Date(m.date);
        if (d && !isNaN(d)) {
          const today = new Date();
          const tom = new Date(); tom.setDate(tom.getDate() + 1);
          if (d.toDateString() === today.toDateString()) dk = 'Today';
          else if (d.toDateString() === tom.toDateString()) dk = 'Tomorrow';
          else dk = d.toLocaleDateString('en-GB', {weekday:'long', day:'numeric', month:'long'});
        }
      } catch(e) {}
      if (!groups[dk]) groups[dk] = [];
      groups[dk].push(m);
    });

    let html = '';
    Object.entries(groups).forEach(([date, gMatches]) => {
      html += `<div class="date-header">
        <span class="date-header-txt">📅 ${date.toUpperCase()}</span>
        <div class="date-header-line"></div>
        <span class="date-header-count">${gMatches.length} match${gMatches.length !== 1 ? 'es' : ''}</span>
      </div>`;
      gMatches.forEach((m, i) => {
        const idx = matches.indexOf(m);
        const isLive = m.status === 'live';
        const isFt = m.status === 'finished';

        const badge = isLive
          ? `<div class="mc-status-badge live"><div class="ldot"></div>${m.minute ? m.minute + "'" : 'LIVE'}</div>`
          : isFt ? `<div class="mc-status-badge ft">FT</div>`
          : `<div class="mc-status-badge upcoming">${m.time || 'TBC'}</div>`;

        const center = isLive || isFt
          ? `<div class="mc-score">${m.hscore ?? 0}<span class="mc-score-sep"> - </span>${m.ascore ?? 0}</div>${isLive && m.minute ? `<div class="mc-minute">${m.minute}'</div>` : ''}`
          : `<div class="mc-kickoff">${m.time || 'TBC'}</div><div class="mc-kickoff-lbl">Kick off</div>`;

        const btnClass = isLive ? '' : isFt ? 'replay' : 'preview';
        const btnText = isLive ? '▶ WATCH LIVE' : isFt ? '▶ WATCH REPLAY' : '⏰ SET REMINDER';

        html += `<div class="match-card" style="animation-delay:${i * 0.04}s;margin-bottom:10px" onclick="openMatchByIndex(${idx})">
          <div class="mc-header">
            <span class="mc-league-name">${m.comp || 'Football'}${m.round ? ' · ' + m.round : ''}</span>
            ${badge}
          </div>
          <div class="mc-body">
            <div class="mc-teams-row">
              <div class="mc-team">
                <div class="mc-crest-wrap"><img src="${m.hlogo || ''}" onerror="this.style.display='none'" alt=""></div>
                <div class="mc-team-name">${m.home}</div>
              </div>
              <div class="mc-center">${center}</div>
              <div class="mc-team">
                <div class="mc-crest-wrap"><img src="${m.alogo || ''}" onerror="this.style.display='none'" alt=""></div>
                <div class="mc-team-name">${m.away}</div>
              </div>
            </div>
            <button class="mc-watch-btn ${btnClass}" onclick="event.stopPropagation();openMatchByIndex(${idx})">${btnText}</button>
          </div>
        </div>`;
      });
    });

    container.innerHTML = html;
  }

  // ===== LIVE SCORES =====
  function updateLiveScores(matches) {
    const list = document.getElementById('livescores-list');
    const count = document.getElementById('ls-count');
    if (!list) return;
    const live = matches.filter(m => m.status === 'live');
    if (count) count.textContent = live.length ? live.length + ' live' : 'None';
    if (!live.length) {
      list.innerHTML = '<div class="ls-loading"><span>No live matches right now</span></div>';
      return;
    }
    list.innerHTML = '<div class="ls-grid">' + live.map(m => {
      const idx = matches.indexOf(m);
      return `<div class="ls-card" onclick="openMatchByIndex(${idx})">
        <div class="ls-left">
          <div class="ls-comp">${m.comp || 'Football'}</div>
          <div class="ls-teams">
            <div class="ls-team-row"><span class="ls-team-name">${m.home}</span><span class="ls-score">${m.hscore ?? 0}</span></div>
            <div class="ls-team-row"><span class="ls-team-name">${m.away}</span><span class="ls-score">${m.ascore ?? 0}</span></div>
          </div>
        </div>
        <div class="ls-right">
          <span class="ls-min">${m.minute ? m.minute + "'" : 'LIVE'}</span>
          <span class="ls-status">LIVE</span>
        </div>
      </div>`;
    }).join('') + '</div>';
  }

})();
