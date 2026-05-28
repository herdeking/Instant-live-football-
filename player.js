// ============================================
// FULLTIME HLS + MULTI-FORMAT PLAYER
// Supports: .m3u8, iframe embeds, YouTube, Twitch
// Add to your repo and include in index.html:
// <script src="player.js"></script>
// ============================================

(function() {

  // Load HLS.js dynamically
  function loadHLS(cb) {
    if (window.Hls) { cb(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  // Load Video.js dynamically
  function loadVideoJS(cb) {
    if (window.videojs) { cb(); return; }
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/video.js@8/dist/video-js.min.css';
    document.head.appendChild(link);
    // Load JS
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/video.js@8/dist/video.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  // Detect stream type
  function detectStreamType(url) {
    if (!url) return 'none';
    const u = url.toLowerCase();
    if (u.includes('.m3u8')) return 'hls';
    if (u.includes('.mp4')) return 'mp4';
    if (u.includes('youtube.com/embed') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('youtube.com/watch')) return 'youtube_watch';
    if (u.includes('twitch.tv')) return 'twitch';
    if (u.includes('dailymotion.com/embed')) return 'iframe';
    if (u.includes('player.vimeo.com')) return 'iframe';
    if (u.startsWith('http')) return 'iframe';
    return 'none';
  }

  // Convert YouTube watch URL to embed URL
  function ytWatchToEmbed(url) {
    const match = url.match(/[?&]v=([^&]+)/);
    if (match) return 'https://www.youtube.com/embed/' + match[1] + '?autoplay=1';
    return url;
  }

  // Convert Twitch URL to embed
  function twitchToEmbed(url, domain) {
    const ch = url.split('twitch.tv/')[1]?.split('/')[0] || '';
    return `https://player.twitch.tv/?channel=${ch}&parent=${domain}&autoplay=true`;
  }

  // Main player function — override window.loadStreamUrl
  window.loadStreamUrl = function(url) {if (window.ftAds) window.ftAds.pause();
    const vidWrap = document.querySelector('.vid-wrap');
    const loading = document.getElementById('vid-loading');
    const ph = document.getElementById('vid-ph');
    const iframe = document.getElementById('stream-iframe');

    if (!vidWrap || !url) return;

    // Hide placeholder, show loading
    if (ph) ph.style.display = 'none';
    if (loading) loading.classList.add('show');
    if (iframe) { iframe.style.display = 'none'; iframe.src = ''; }

    // Remove any existing native player
    const existing = document.getElementById('ft-video-player');
    if (existing) existing.remove();

    const type = detectStreamType(url);
    console.log('Stream type:', type, url);

    if (type === 'hls' || type === 'mp4') {
      // Use native HLS player
      loadHLS(function() {
        buildNativePlayer(url, type, vidWrap, loading);
      });
    } else if (type === 'youtube_watch') {
      const embedUrl = ytWatchToEmbed(url);
      loadIframe(embedUrl, loading, iframe);
    } else if (type === 'twitch') {
      const domain = window.location.hostname || 'instantlivefootball.com.ng';
      const embedUrl = twitchToEmbed(url, domain);
      loadIframe(embedUrl, loading, iframe);
    } else {
      // Default iframe for all other URLs
      loadIframe(url, loading, iframe);
    }
  };

  function loadIframe(url, loading, iframe) {
    if (!iframe) return;
    iframe.src = url;
    iframe.style.display = 'block';
    iframe.onload = function() {
      if (loading) loading.classList.remove('show');
    };
    // Fallback: hide loading after 5s
    setTimeout(() => { if (loading) loading.classList.remove('show'); }, 5000);
  }

  function buildNativePlayer(url, type, container, loading) {
    // Create video element
    const video = document.createElement('video');
    video.id = 'ft-video-player';
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.style.cssText = 'width:100%;height:100%;position:absolute;top:0;left:0;background:#000;z-index:5';

    // Add quality selector overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:absolute;top:8px;right:8px;z-index:10;display:flex;gap:4px';
    ['SD','HD','AUTO'].forEach(q => {
      const btn = document.createElement('button');
      btn.textContent = q;
      btn.style.cssText = 'background:rgba(0,0,0,0.7);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:3px;padding:3px 7px;font-size:.6rem;cursor:pointer;font-family:Oswald,sans-serif;font-weight:700;letter-spacing:1px';
      btn.onclick = () => {
        document.querySelectorAll('#ft-player-overlay button').forEach(b => b.style.borderColor='rgba(255,255,255,0.3)');
        btn.style.borderColor = '#ffcc00';
      };
      overlay.appendChild(btn);
    });
    overlay.id = 'ft-player-overlay';
    container.appendChild(overlay);
    container.appendChild(video);

    if (loading) loading.classList.remove('show');

    if (type === 'hls' && window.Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, function(event, data) {
        if (data.fatal) {
          console.error('HLS error:', data);
          showPlayerError(container, url);
        }
      });
      // Store hls instance for cleanup
      video._hls = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS (Safari/iOS)
      video.src = url;
      video.play().catch(() => {});
    } else if (type === 'mp4') {
      video.src = url;
      video.play().catch(() => {});
    } else {
      // Fallback to iframe
      video.remove();
      overlay.remove();
      const iframe = document.getElementById('stream-iframe');
      if (iframe) loadIframe(url, loading, iframe);
    }

    // Sync with progress bar
    video.addEventListener('timeupdate', function() {
      const prog = document.getElementById('prog-fill');
      if (prog && video.duration) {
        prog.style.width = (video.currentTime / video.duration * 100) + '%';
      }
    });

    // Handle mute button
    document.getElementById('mute-btn') && (document.getElementById('mute-btn').onclick = function() {
      video.muted = !video.muted;
      this.textContent = video.muted ? '🔇' : '🔊';
      if (typeof showToast === 'function') showToast(video.muted ? '🔇 Muted' : '🔊 Unmuted');
    });

    // Handle fullscreen
    window._currentVideo = video;
  }

  function showPlayerError(container, url) {
    const err = document.createElement('div');
    err.style.cssText = 'position:absolute;inset:0;background:#1a0000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:20;padding:20px';
    err.innerHTML = `
      <div style="font-size:2rem">⚠️</div>
      <p style="font-family:Oswald,sans-serif;color:#fff;letter-spacing:1px;font-size:.85rem;text-align:center">Stream failed to load</p>
      <p style="font-family:Oswald,sans-serif;color:#aaa;font-size:.7rem;text-align:center">Try a different server or check the stream link</p>
      <button onclick="window.loadStreamUrl('${url}')" style="background:#bb1919;color:#fff;border:none;border-radius:5px;padding:8px 18px;font-family:Oswald,sans-serif;font-weight:700;font-size:.75rem;letter-spacing:1.5px;cursor:pointer;margin-top:4px">↺ RETRY</button>`;
    container.appendChild(err);
  }

  // Override fullscreen to support native video
  window.openFullscreen = function() {
    const video = document.getElementById('ft-video-player');
    const wrap = document.querySelector('.vid-wrap');
    const target = video || wrap;
    if (target) {
      if (target.requestFullscreen) target.requestFullscreen();
      else if (target.webkitRequestFullscreen) target.webkitRequestFullscreen();
      else if (target.webkitEnterFullscreen) target.webkitEnterFullscreen();
    }
  };

  // Cleanup when watch modal closes
  const origClose = window.closeWatch;
  window.closeWatch = function() {if (window.ftAds) window.ftAds.resume();
    const video = document.getElementById('ft-video-player');
    if (video) {
      if (video._hls) video._hls.destroy();
      video.pause();
      video.src = '';
      video.remove();
    }
    const overlay = document.getElementById('ft-player-overlay');
    if (overlay) overlay.remove();
    if (origClose) origClose();
  };

  console.log('✅ FullTime Player loaded — supports HLS, MP4, YouTube, Twitch, iframes');
})();
