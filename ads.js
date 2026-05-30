// ============================================
// FULLTIME ADS MANAGER
// - Shows ad immediately on page load
// - Then every 2 minutes
// - Never shows during stream playback
// - Auto-closes after 10 seconds
// - Subscribers see zero ads
// ============================================

(function() {

  let adTimer = null;
  let lastAdTime = 0;
  let isStreamPlaying = false;
  let isSubscribed = false;
  const AD_INTERVAL = 120000; // 2 minutes between ads
  const AD_DURATION = 10000;  // auto-close after 10 seconds

  // Check subscription
  try {
    const data = JSON.parse(localStorage.getItem('ft_sub_data') || '{}');
    if (data.active && new Date(data.expiresAt) > new Date()) {
      isSubscribed = true;
    }
  } catch(e) {}

  // Don't run ads for subscribers
  if (isSubscribed) {
    hideStaticAds();
    return;
  }

  function hideStaticAds() {
    const adEl = document.getElementById('ad-top');
    if (adEl) adEl.style.display = 'none';
  }

  // ===== CREATE AD BANNER =====
  function createAdBanner() {
    // Remove existing
    const existing = document.getElementById('ft-smart-ad');
    if (existing) existing.remove();

    const ad = document.createElement('div');
    ad.id = 'ft-smart-ad';
    ad.style.cssText = `
      position: fixed;
      bottom: 70px;
      left: 0; right: 0;
      background: linear-gradient(135deg, #1a1a2e, #0f3460);
      border-top: 2px solid #ffcc00;
      border-bottom: 2px solid rgba(255,204,0,0.3);
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 300;
      transform: translateY(100px);
      transition: transform 0.4s ease;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.4);
    `;

    // Countdown bar
    const bar = document.createElement('div');
    bar.id = 'ft-ad-bar';
    bar.style.cssText = 'position:absolute;top:0;left:0;height:2px;background:#ffcc00;transition:width linear;width:100%';
    ad.appendChild(bar);

    // Countdown text
    let countdown = Math.floor(AD_DURATION / 1000);
    const countEl = document.createElement('span');
    countEl.id = 'ft-ad-count';
    countEl.style.cssText = 'font-family:Oswald,sans-serif;font-size:.6rem;color:rgba(255,255,255,0.4);flex-shrink:0;min-width:20px;text-align:center';
    countEl.textContent = countdown + 's';

    ad.innerHTML += `
      <div style="font-size:1.3rem;flex-shrink:0">🎯</div>
      <div style="flex:1">
        <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:.82rem;color:#fff;letter-spacing:.5px">Go Ad-Free from ₦300/wk</div>
        <div style="font-size:.68rem;color:#8a8ab0;margin-top:1px">Watch all matches without interruptions</div>
      </div>
      <button id="ft-ad-sub" style="background:#ffcc00;color:#111;border:none;border-radius:4px;padding:6px 12px;font-family:Oswald,sans-serif;font-weight:700;font-size:.68rem;letter-spacing:1px;cursor:pointer;flex-shrink:0">SUBSCRIBE</button>
      <button id="ft-ad-close" style="background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;font-size:.9rem;padding:4px;flex-shrink:0">✕</button>
    `;

    ad.appendChild(countEl);
    document.body.appendChild(ad);

    // Slide in
    setTimeout(() => { ad.style.transform = 'translateY(0)'; }, 50);

    // Countdown bar animation
    setTimeout(() => {
      bar.style.transition = `width ${AD_DURATION}ms linear`;
      bar.style.width = '0%';
    }, 100);

    // Countdown number
    const countInterval = setInterval(() => {
      countdown--;
      const el = document.getElementById('ft-ad-count');
      if (el) el.textContent = countdown + 's';
      if (countdown <= 0) clearInterval(countInterval);
    }, 1000);

    // Subscribe button
    document.getElementById('ft-ad-sub').onclick = function(e) {
      e.stopPropagation();
      closeAd(ad);
      if (typeof openSub === 'function') openSub();
    };

    // Close button
    document.getElementById('ft-ad-close').onclick = function(e) {
      e.stopPropagation();
      closeAd(ad);
    };

    // Auto close
    const autoClose = setTimeout(() => closeAd(ad), AD_DURATION);
    ad.dataset.autoClose = autoClose;

    lastAdTime = Date.now();
  }

  function closeAd(ad) {
    if (!ad) return;
    clearTimeout(parseInt(ad.dataset.autoClose));
    ad.style.transform = 'translateY(100px)';
    setTimeout(() => { if (ad && ad.parentNode) ad.remove(); }, 400);
  }

  // ===== TRACK STREAM STATE =====
  const watchOverlay = document.getElementById('watch-overlay');
  if (watchOverlay) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          isStreamPlaying = watchOverlay.classList.contains('open');
          if (isStreamPlaying) {
            const ad = document.getElementById('ft-smart-ad');
            if (ad) closeAd(ad);
          }
        }
      });
    });
    observer.observe(watchOverlay, { attributes: true });
  }

  // ===== SHOW AD =====
  function showAd() {
    const now = Date.now();
    if (isStreamPlaying) return;
    if (isSubscribed) return;
    const watchOverlay = document.getElementById('watch-overlay');
    if (watchOverlay && watchOverlay.classList.contains('open')) return;
    if (now - lastAdTime < AD_INTERVAL) return;
    createAdBanner();
  }

  // ===== INIT — Show immediately on load =====
  function init() {
    // Hide static top ad — replace with smart banner
    hideStaticAds();

    // Show ad IMMEDIATELY on page load
    createAdBanner();

    // Then show every 2 minutes
    adTimer = setInterval(showAd, AD_INTERVAL);
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already ready — show after tiny delay so page renders first
    setTimeout(init, 500);
  }

  // ===== EXPOSE FOR EXTERNAL USE =====
  window.ftAds = {
    pause: () => { isStreamPlaying = true; const ad = document.getElementById('ft-smart-ad'); if (ad) closeAd(ad); },
    resume: () => { isStreamPlaying = false; },
    hide: () => { isSubscribed = true; hideStaticAds(); clearInterval(adTimer); const ad = document.getElementById('ft-smart-ad'); if (ad) closeAd(ad); }
  };

})();
