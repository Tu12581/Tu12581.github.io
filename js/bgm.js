/* ── 芒果基地 · BGM 悬浮播放器 ───────────────────────
   读取 /api/settings 的 bgm 配置；设置台（/settings/）可视化调整。 */
(function () {
  'use strict';
  if (window.__mangoBGM) return;
  window.__mangoBGM = true;

  // 配置来源：本地读 /api/settings（实时）；线上读构建时生成的 /settings.json
  function loadSettings() {
    return fetch('/api/settings')
      .then(function (r) { return r.json(); })
      .then(function (j) { return j.settings; })
      .catch(function () {
        return fetch('/settings.json')
          .then(function (r) { return r.json(); })
          .catch(function () { return null; });
      });
  }

  loadSettings().then(function (cfg) {
    var s = cfg && cfg.bgm;
    if (!s || !s.enable) return;

    var audio = null;
    var iframeWrap = null;

    var widget = document.createElement('div');
    widget.id = 'bgm-widget';
    widget.title = '背景音乐';
    widget.innerHTML = '<span class="bgm-disc">🎵</span>';
    document.body.appendChild(widget);

    var style = document.createElement('style');
    style.textContent =
      '#bgm-widget{position:fixed;left:16px;bottom:16px;z-index:1200;width:46px;height:46px;' +
      'border-radius:50%;background:rgba(255,255,255,.85);backdrop-filter:blur(10px);' +
      'border:1px solid rgba(255,158,196,.5);display:flex;align-items:center;justify-content:center;' +
      'font-size:20px;cursor:pointer;box-shadow:0 6px 18px rgba(255,123,169,.3);user-select:none;transition:transform .2s;}' +
      '#bgm-widget:hover{transform:scale(1.1);}' +
      '#bgm-widget .bgm-disc{display:inline-block;}' +
      '#bgm-widget.playing .bgm-disc{animation:bgm-spin 3s linear infinite;}' +
      '@keyframes bgm-spin{to{transform:rotate(360deg);}}' +
      '#bgm-widget.attract{animation:bgm-pulse 1.6s ease-in-out infinite;}' +
      '@keyframes bgm-pulse{0%,100%{box-shadow:0 6px 18px rgba(255,123,169,.3);}50%{box-shadow:0 6px 26px rgba(255,123,169,.65);transform:scale(1.08);}}' +
      '#bgm-framebox{position:fixed;left:16px;bottom:72px;z-index:1200;width:320px;max-width:86vw;display:none;' +
      'background:rgba(255,255,255,.92);border:1px solid rgba(255,158,196,.45);border-radius:14px;padding:8px;' +
      'box-shadow:0 10px 30px rgba(255,123,169,.25);}' +
      '#bgm-framebox.open{display:block;}' +
      '#bgm-framebox iframe{width:100%;border:0;display:block;border-radius:8px;}';
    document.head.appendChild(style);

    var framebox = null;
    function toggleFrame() {
      if (!framebox) {
        framebox = document.createElement('div');
        framebox.id = 'bgm-framebox';
        framebox.innerHTML = '<iframe frameborder="no" marginwidth="0" marginheight="0" src="https://music.163.com/outchain/player?type=0&id=' +
          encodeURIComponent(s.netease_id) + '&auto=1&height=90&bg=ffffff"></iframe>';
        document.body.appendChild(framebox);
      }
      framebox.classList.toggle('open');
    }

    if (s.mode === 'netease' && s.netease_id) {
      widget.addEventListener('click', toggleFrame);
      widget.classList.add('attract');
      return; // 网易云歌单模式：点开 iframe 由用户手动播放
    }

    if (!s.url) return;
    audio = new Audio(s.url);
    audio.loop = true;
    audio.volume = Math.min(1, Math.max(0, parseFloat(s.volume)));
    if (isNaN(audio.volume)) audio.volume = 0.3;

    function setPlaying(on) {
      widget.classList.toggle('playing', on);
      widget.querySelector('.bgm-disc').textContent = on ? '🎵' : '⏸';
    }

    widget.addEventListener('click', function () {
      if (audio.paused) { audio.play().catch(function () {}); } else { audio.pause(); }
    });
    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });

    function tryPlay() {
      audio.play().then(function () { setPlaying(true); }).catch(function () {
        // 自动播放被拦截：吸引点击，首点全站任意处即开播
        widget.classList.add('attract');
        var kick = function () {
          document.removeEventListener('click', kick);
          audio.play().then(function () { widget.classList.remove('attract'); }).catch(function () {});
        };
        document.addEventListener('click', kick);
      });
    }

    if (s.autoplay) tryPlay();
    else widget.classList.add('attract');
  }).catch(function () { });
})();
