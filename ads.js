// ============================================
// FULLTIME ADS MANAGER
// - Ads never show during stream playback
// - Ads show every 2 minutes max
// - Ads auto-close after 8 seconds
// - Never blocks the play button
// ============================================

(function() {

  let adTimer = null;
  let lastAdTime = 0;
  let isStreamPlaying = false;
  let isSubscribed = false;
  const AD_INTERVAL = 120000; // 2 minutes between ads
  const AD_DURATION = 8000;   // auto-close after 8 seconds

  // Check subscription
  try {
    const data = JSON.parse(localStorage.getItem('ft_sub_data') || '{}');
    if (data.active && new Date(data.expiresAt) > new Date()) {
      isSubscribed = true;
    }
  } catch(e) {}

  // Don't run ads for subscribers
  if (isSubscribed) {
    hideAllAds();
    return;
  }

  // ===== HIDE ALL EXISTING ADS =====
  function hideAllAds() {
    const adEl = document.getElementById('ad-top');
    if (adEl) adEl.style.display = 'none';
  }

  // ===== SMART AD BANNER =====
  // Create a non-intrusive floating ad banner
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
      padding: 10px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 300;
      transform: translateY(100px);
      transition: transform 0.4s ease;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
    `;

    // Countdown bar
    const bar = document.createElement('div');
    bar.style.cssText = 'position:absolute;top:0;left:0;height:2px;background:#ffcc00;transition:width linear;width:100%';
    ad.appendChild(bar);

    ad.innerHTML += `
      <div style="font-size:1.3rem;flex-shrink:0">🎯</div>
      <div style="flex:1">
        <div style="font-family:Oswald,sans-serif;font-weight:700;font-size:.82rem;color:#fff;letter-spacing:.5px">Go Ad-Free from ₦300/wk</div>
        <div style="font-size:.68rem;color:#8a8ab0;margin-top:1px">Watch all matches without interruptions</div>
      </div>
      <button onclick="if(typeof openSub==='function')openSub()" style="background:#ffcc00;color:#111;border:none;border-radius:4px;padding:6px 12px;font-family:Oswald,sans-serif;font-weight:700;font-size:.68rem;letter-spacing:1px;cursor:pointer;flex-shrink:0">SUBSCRIBE</button>
      <button id="ft-ad-close" style="background:none;border:none;color:rgba(255,255,255,0.5);cursor:pointer;font-size:1rem;padding:4px;flex-shrink:0">✕</button>
    `;

    document.body.appendChild(ad);

    // Slide in
    setTimeout(() => { ad.style.transform = 'translateY(0)'; }, 50);

    // Countdown bar animation
    setTimeout(() => {
      bar.style.transition = `width ${AD_DURATION}ms linear`;
      bar.style.width = '0%';
    }, 100);

    // Close button
    document.getElementById('ft-ad-close').onclick = function(e) {
      e.stopPropagation();
      closeAd(ad);
    };

    // Auto close after AD_DURATION
    const autoClose = setTimeout(() => closeAd(ad), AD_DURATION);
    ad.dataset.autoClose = autoClose;

    lastAdTime = Date.now();
  }

  function closeAd(ad) {
    if (!ad) return;
    clearTimeout(parseInt(ad.dataset.autoClose));
    ad.style.transform = 'translateY(100px)';
    setTimeout(() => { if (ad.parentNode) ad.remove(); }, 400);
  }

  // ===== TRACK STREAM PLAYING STATE =====
  // Watch modal open = no ads
  const watchOverlay = document.getElementById('watch-overlay');
  if (watchOverlay) {
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          isStreamPlaying = watchOverlay.classList.contains('open');
          if (isStreamPlaying) {
            // Hide any showing ad immediately
            const ad = document.getElementById('ft-smart-ad');
            if (ad) closeAd(ad);
          }
        }
      });
    });
    observer.observe(watchOverlay, { attributes: true });
  }

  // ===== AD SCHEDULER =====
  function scheduleAds() {
    // Show first ad after 30 seconds
    setTimeout(() => {
      if (!isStreamPlaying && !isSubscribed) showAd();
    }, 30000);

    // Then every AD_INTERVAL
    adTimer = setInterval(() => {
      if (!isStreamPlaying && !isSubscribed) showAd();
    }, AD_INTERVAL);
  }

  function showAd() {
    const now = Date.now();
    // Don't show if ad was shown recently
    if (now - lastAdTime < AD_INTERVAL) return;
    // Don't show if stream is playing
    if (isStreamPlaying) return;
    // Don't show if watch overlay is open
    const watchOverlay = document.getElementById('watch-overlay');
    if (watchOverlay && watchOverlay.classList.contains('open')) return;
    createAdBanner();
  }

  // ===== HIDE THE STATIC TOP AD (replace with smart ads) =====
  window.addEventListener('DOMContentLoaded', function() {
    // Hide the always-visible top ad
    const topAd = document.getElementById('ad-top');
    if (topAd) topAd.style.display = 'none';

    // Start smart ad system
    scheduleAds();
  });

  // Also handle if DOM already loaded
  if (document.readyState !== 'loading') {
    const topAd = document.getElementById('ad-top');
    if (topAd) topAd.style.display = 'none';
    scheduleAds();
  }

  // ===== EXPOSE FOR EXTERNAL USE =====
  window.ftAds = {
    pause: () => { isStreamPlaying = true; },
    resume: () => { isStreamPlaying = false; },
    hide: () => { isSubscribed = true; hideAllAds(); clearInterval(adTimer); }
  };

  console.log('✅ FullTime Ads Manager loaded — ads every 2 mins, never during streams');

})();
