
(function() {
  const firebaseConfig = {
    apiKey: "AIzaSyC7DzEQEgpeyBcsUo_QaKl7faeYRer8e2E",
    authDomain: "instantlivefootball.firebaseapp.com",
    projectId: "instantlivefootball",
    storageBucket: "instantlivefootball.firebasestorage.app",
    messagingSenderId: "584488048641",
    appId: "1:584488048641:web:7adf83799426222a5fc800"
  };

  const STREAM_API = 'https://api.embedsportex.site/api/streams';
  let autoStreams = [];

  function waitForFirebase(cb) {
    if (typeof firebase !== 'undefined' && firebase.firestore) cb();
    else setTimeout(() => waitForFirebase(cb), 100);
  }

  window.addEventListener('load', function() {
    waitForFirebase(function() {
      try {
        if (!firebase.apps || !firebase.apps.length) firebase.initializeApp(firebaseConfig);
      } catch(e) {}
      fetchAutoStreams().then(() => loadMatchesFromFirebase());
    });
  });

  async function fetchAutoStreams() {
    try {
      const res = await fetch(STREAM_API);
      const data = await res.json();
      if (data.football) autoStreams = data.football;
    } catch(e) {}
  }

  function findAutoStream(match) {
    if (!autoStreams.length) return null;
    const h = (match.home || '').toLowerCase();
    const a = (match.away || '').toLowerCase();
    const found = autoStreams.find(s => {
      const tag = (s.tag || '').toLowerCase();
      return tag.includes(h.split(' ')[0]) || tag.includes(a.split(' ')[0]);
    });
    if (found && found.iframes && found.iframes.length) return found.iframes[0].url;
    return null;
 }function loadMatchesFromFirebase() {
    const list = document.getElementById('match-list');
    if (!list) return;
    list.innerHTML = '<div class="ls-loading"><div class="ls-spinner"></div><span>Loading matches…</span></div>';
    const db = firebase.firestore();
    db.collection('matches').orderBy('date','desc').get()
      .then(function(snapshot) {
        const loaded = [];
        snapshot.forEach(function(doc) {
          const d = doc.data();
          if (!d.hidden) {
            const match = { id: doc.id, ...d };
            if (!match.stream && match.status === 'live') {
              const auto = findAutoStream(match);
              if (auto) { match.stream = auto; match.autoStream = true; }
            }
            if (!match.streams || !match.streams.length) {
              const streams = [];
              if (match.stream) streams.push({url:match.stream,label:'Server 1'});
              if (match.stream2) streams.push({url:match.stream2,label:'Server 2'});
              if (match.stream3) streams.push({url:match.stream3,label:'Server 3'});
              if (streams.length) match.streams = streams;
            }
            loaded.push(match);
          }
        });
        window._matches = loaded;
        if (typeof window.matches !== 'undefined') window.matches = loaded;
        if (!loaded.length) {
          list.innerHTML = '<div class="empty-state"><p>No matches today</p></div>';
          updateCounts(loaded); return;
        }
        buildCards(loaded, list);
        updateCounts(loaded);
        updateFeatured(loaded);
        updateLiveScores(loaded);
      })
      .catch(function(err) {
        list.innerHTML = '<div class="ls-loading"><span style="color:#bb1919">Failed to load. <span onclick="location.reload()" style="cursor:pointer;text-decoration:underline">Retry</span></span></div>';
      });
  }

  function updateCounts(matches) {
    const n = matches.filter(m => m.status==='live').length;
    const el = document.getElementById('live-count');
    if (el) el.textContent = n + ' Live';
    const mc = document.getElementById('mc');
    if (mc) mc.textContent = matches.length + ' match' + (matches.length!==1?'es':'');
  }

  function updateFeatured(matches) {
    const live = matches.filter(m => m.status==='live');
    if (!live.length) return;
    const m = live[0];
    const card = document.getElementById('feat-card');
    if (card) { card.style.display='block'; window._featIdx=matches.indexOf(m); }
    const set = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
    set('feat-comp',m.comp||''); set('feat-hname',m.home); set('feat-aname',m.away);
    set('feat-hs',m.hscore??0); set('feat-as',m.ascore??0);
    const hl=document.getElementById('feat-hlogo'); if(hl&&m.hlogo) hl.src=m.hlogo;
    const al=document.getElementById('feat-alogo'); if(al&&m.alogo) al.src=m.alogo;
  }

  window.openFeatWatch = function() {
    if (window._featIdx!==undefined) openMatchByIndex(window._featIdx);
  };

  window.openMatchByIndex = function(idx) {
    const m = window._matches && window._matches[idx];
    if (!m) return;
    if (typeof window.openWatch==='function') window.openWatch(m);
    else if (m.status==='upcoming') {
      if (typeof window.showToast==='function') window.showToast('⏰ Reminder set for '+m.home+' vs '+m.away+'!',3500);
      else alert('⏰ Reminder set!\n'+m.home+' vs '+m.away+'\nKick-off: '+(m.time||'TBC'));
    }
  };

  function buildCards(matches, container) {
    const order = {live:0,upcoming:1,finished:2};
    const sorted = [...matches].sort((a,b)=>(order[a.status]??1)-(order[b.status]??1));
    container.innerHTML = sorted.map(function(m,i) {
      const idx = matches.indexOf(m);
      const isLive = m.status==='live';
      const isFt = m.status==='finished';
      const badge = isLive
        ? `<div class="mc-status-badge live"><div class="ldot"></div>${m.minute?m.minute+"'":'LIVE'}</div>`
        : isFt ? `<div class="mc-status-badge ft">FT</div>`
        : `<div class="mc-status-badge upcoming">${m.time||'TBC'}</div>`;
      const center = isLive||isFt
        ? `<div class="mc-score">${m.hscore??0}<span class="mc-score-sep"> - </span>${m.ascore??0}</div>${isLive&&m.minute?`<div class="mc-minute">${m.minute}'</div>`:''}`
        : `<div class="mc-kickoff">${m.time||'TBC'}</div><div class="mc-kickoff-lbl">Kick off</div>`;
      const btnClass = isLive?'':isFt?'replay':'preview';
      const btnText = isLive?'▶ WATCH LIVE':isFt?'▶ WATCH REPLAY':'⏰ SET REMINDER';
      const autoBadge = m.autoStream?`<span style="font-size:.55rem;background:#007a3d;color:#fff;padding:1px 6px;border-radius:3px;font-family:Oswald,sans-serif;letter-spacing:1px;margin-left:6px">AUTO</span>`:'';
      return `<div class="match-card" style="animation-delay:${i*0.04}s" onclick="openMatchByIndex(${idx})">
        <div class="mc-header">
          <span class="mc-league-name">${m.comp||'Football'}${m.round?' · '+m.round:''}${autoBadge}</span>
          ${badge}
        </div>
        <div class="mc-body">
          <div class="mc-teams-row">
            <div class="mc-team">
              <div class="mc-crest-wrap"><img src="${m.hlogo||''}" onerror="this.style.display='none'" alt=""></div>
              <div class="mc-team-name">${m.home}</div>
            </div>
            <div class="mc-center">${center}</div>
            <div class="mc-team">
              <div class="mc-crest-wrap"><img src="${m.alogo||''}" onerror="this.style.display='none'" alt=""></div>
              <div class="mc-team-name">${m.away}</div>
            </div>
          </div>
          <button class="mc-watch-btn ${btnClass}" onclick="event.stopPropagation();openMatchByIndex(${idx})">${btnText}</button>
        </div>
      </div>`;
    }).join('');
  }

  function updateLiveScores(matches) {
    const list = document.getElementById('livescores-list');
    const count = document.getElementById('ls-count');
    if (!list) return;
    const live = matches.filter(m => m.status==='live');
    if (count) count.textContent = live.length ? live.length+' live' : 'None';
    if (!live.length) { list.innerHTML='<div class="ls-loading"><span>No live matches right now</span></div>'; return; }
    list.innerHTML = '<div class="ls-grid">'+live.map(m => {
      const idx = matches.indexOf(m);
      return `<div class="ls-card" onclick="openMatchByIndex(${idx})">
        <div class="ls-left">
          <div class="ls-comp">${m.comp||'Football'}</div>
          <div class="ls-teams">
            <div class="ls-team-row"><span class="ls-team-name">${m.home}</span><span class="ls-score">${m.hscore??0}</span></div>
            <div class="ls-team-row"><span class="ls-team-name">${m.away}</span><span class="ls-score">${m.ascore??0}</span></div>
          </div>
        </div>
        <div class="ls-right"><span class="ls-min">${m.minute?m.minute+"'":'LIVE'}</span><span class="ls-status">LIVE</span></div>
      </div>`;
    }).join('')+'</div>';
  }

})();
