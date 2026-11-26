/* ── 芒果基地 · 右下角快捷新增（管理员组件）────────────
   渲染页由 render-cards.js 注入引用；独立静态页（home/ideas/settings）直接 <script> 引入。 */
(function () {
  'use strict';
  // 管理员组件：只在本地环境显示，线上访客不可见不可用
  var host = location.hostname;
  if (host !== 'localhost' && host !== '127.0.0.1') return;
  if (document.getElementById('mango-fab')) return;

  // 记录当前位置，供写作台/灵感笔记本的"智能返回"使用
  try { sessionStorage.setItem('mango-last', location.pathname); } catch (e) {}

  var STATUS = { bangumi: ['在看', '看完', '弃'], galgame: ['想玩', '在玩', '通关', '弃坑'] };
  var cur = null;

  var style = document.createElement('style');
  style.textContent =
    '#mango-fab{position:fixed;right:28px;bottom:96px;width:52px;height:52px;border-radius:50%;' +
    'background:linear-gradient(135deg,#ff9ec4,#c7b3f5);color:#fff;font-size:24px;display:flex;' +
    'align-items:center;justify-content:center;cursor:pointer;z-index:1002;box-shadow:0 6px 18px rgba(255,123,169,.4);' +
    'transition:all .25s;user-select:none;}' +
    '#mango-fab:hover{transform:scale(1.08) rotate(90deg);}' +
    '#mango-quick{position:fixed;right:28px;bottom:160px;width:300px;max-height:70vh;overflow:auto;' +
    'background:rgba(255,255,255,.94);backdrop-filter:blur(12px);border:1px solid rgba(255,158,196,.4);' +
    'border-radius:16px;padding:14px;z-index:1002;box-shadow:0 10px 30px rgba(255,123,169,.25);' +
    'display:none;flex-direction:column;gap:10px;}' +
    '#mango-quick.open{display:flex;}' +
    '.mq-head{display:flex;justify-content:space-between;align-items:center;font-weight:700;}' +
    '.mq-close{border:none;background:none;font-size:20px;cursor:pointer;color:#b08ea0;}' +
    '.mq-types{display:flex;flex-wrap:wrap;gap:6px;}' +
    '.mq-t{padding:6px 10px;border-radius:999px;border:1.5px solid #ffd3e3;background:#fff;cursor:pointer;' +
    'font-size:13px;color:#9a6d84;font-family:inherit;}' +
    '.mq-t.on{background:linear-gradient(135deg,#ff9ec4,#c7b3f5);color:#fff;border-color:transparent;}' +
    '.mq-i{width:100%;padding:9px 12px;border-radius:10px;border:1.5px solid #ffd3e3;font-size:13.5px;' +
    'outline:none;font-family:inherit;background:#fff;}' +
    '.mq-i:focus{border-color:#ff9ec4;}textarea.mq-i{min-height:56px;resize:vertical;}' +
    '.mq-save{width:100%;padding:10px;border:none;border-radius:10px;' +
    'background:linear-gradient(135deg,#ff9ec4,#c7b3f5);color:#fff;font-weight:700;cursor:pointer;font-family:inherit;}' +
    '.mq-msg{font-size:13px;display:none;padding:8px 10px;border-radius:8px;}' +
    '.mq-msg.ok{display:block;background:rgba(163,230,193,.3);color:#217a5b;}' +
    '.mq-msg.err{display:block;background:rgba(255,190,190,.4);color:#b03a3a;}' +
    '.mq-gowrite{font-size:12.5px;color:#a06bb8;text-align:center;}' +
    '[data-theme="dark"] #mango-quick{background:rgba(36,32,40,.94);}' +
    '@media(max-width:768px){#mango-fab{right:18px;bottom:88px;width:46px;height:46px;font-size:20px;}' +
    '#mango-quick{right:14px;left:14px;width:auto;bottom:146px;}}';
  document.head.appendChild(style);

  var fab = document.createElement('div');
  fab.id = 'mango-fab';
  fab.title = '快速新增';
  fab.textContent = '➕';

  var panel = document.createElement('div');
  panel.id = 'mango-quick';
  panel.innerHTML =
    '<div class="mq-head"><span>🥭 快速新增</span><button class="mq-close" id="mq-close">×</button></div>' +
    '<div class="mq-types">' +
    '<button class="mq-t" data-t="post">✍️ 文章</button>' +
    '<button class="mq-t" data-t="bangumi">📺 番剧</button>' +
    '<button class="mq-t" data-t="galgame">🎮 Galgame</button>' +
    '<button class="mq-t" data-t="works">🎨 作品</button>' +
    '<button class="mq-t" data-t="music">🎵 音乐</button>' +
    '<button class="mq-t" data-t="idea">💡 灵感</button>' +
    '</div>' +
    '<input class="mq-i" id="mq-title" placeholder="标题 / 歌名">' +
    '<div id="mq-fields"></div>' +
    '<button class="mq-save" id="mq-save">保存</button>' +
    '<div id="mq-msg" class="mq-msg"></div>' +
    '<a class="mq-gowrite" href="/write/">需要更多选项？打开写作台 →</a>' +
    '<a class="mq-gowrite" href="/settings/">⚙️ 站点设置（BGM / 公告）</a>';

  function mount() {
    document.body.appendChild(fab);
    document.body.appendChild(panel);
  }
  if (document.body) mount();
  else document.addEventListener('DOMContentLoaded', mount);

  function $(id) { return document.getElementById(id); }
  function mqMsg(t, err) {
    var m = $('mq-msg');
    m.textContent = t;
    m.className = 'mq-msg ' + (err ? 'err' : 'ok');
  }
  function fld(html) { $('mq-fields').insertAdjacentHTML('beforeend', html); }
  function v(id) { var el = $(id); return el ? el.value : ''; }

  fab.addEventListener('click', function () { panel.classList.toggle('open'); });
  $('mq-close').addEventListener('click', function () { panel.classList.remove('open'); });

  document.querySelectorAll('.mq-t').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.mq-t').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      if (b.dataset.t === 'post') { location.href = '/write/'; return; }
      $('mq-title').style.display = (b.dataset.t === 'idea') ? 'none' : '';
      cur = b.dataset.t;
      var f = $('mq-fields');
      f.innerHTML = '';
      if (cur === 'bangumi' || cur === 'galgame') {
        fld('<select class="mq-i" id="mq-status">' + STATUS[cur].map(function (s) { return '<option>' + s + '</option>'; }).join('') + '</select>');
        fld('<input class="mq-i" id="mq-score" placeholder="评分 0-5（可留空）">');
      }
      if (cur === 'works') {
        fld('<input class="mq-i" id="mq-cat" placeholder="分类（MAD / 建模 / 文章…可自定义）">');
        fld('<input class="mq-i" id="mq-link" placeholder="链接（B站视频 / 网盘 / 站内文章）">');
      }
      if (cur === 'music') {
        fld('<input class="mq-i" id="mq-artist" placeholder="歌手">');
        fld('<select class="mq-i" id="mq-server"><option value="netease">网易云</option><option value="tencent">QQ 音乐</option></select>');
        fld('<input class="mq-i" id="mq-id" placeholder="歌曲 ID（纯数字）">');
      }
      fld('<textarea class="mq-i" id="mq-note" placeholder="' + (cur === 'idea' ? '灵感内容（必填）' : '短评 / 备注（可留空）') + '"></textarea>');
    });
  });

  $('mq-save').addEventListener('click', function () {
    if (!cur) { mqMsg('先选一个类型', true); return; }
    if (cur === 'idea') {
      fetch('/api/inspiration', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: v('mq-note') })
      }).then(function (r) { return r.json(); }).then(function (res) {
        mqMsg(res.ok ? '💡 ' + res.message : '😢 ' + res.message, !res.ok);
        if (res.ok) $('mq-note').value = '';
      }).catch(function () { mqMsg('请求失败，请确认服务已启动', true); });
      return;
    }
    if (!v('mq-title')) { mqMsg('标题不能为空', true); return; }
    var data = { type: cur, title: v('mq-title') };
    if (cur === 'works') { data.category = v('mq-cat'); data.link = v('mq-link'); data.desc = v('mq-note'); }
    else if (cur === 'music') { data.artist = v('mq-artist'); data.server = v('mq-server'); data.id = v('mq-id'); data.comment = v('mq-note'); }
    else { data.status = v('mq-status'); data.score = v('mq-score'); data.comment = v('mq-note'); }
    fetch('/api/record', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function (r) { return r.json(); }).then(function (res) {
      mqMsg(res.ok ? '✅ ' + res.message : '😢 ' + res.message, !res.ok);
      if (res.ok) {
        $('mq-title').value = '';
        $('mq-fields').innerHTML = '';
        cur = null;
        document.querySelectorAll('.mq-t').forEach(function (x) { x.classList.remove('on'); });
      }
    }).catch(function () { mqMsg('请求失败，请确认博客服务已启动', true); });
  });

  // pjax 切换后：更新垂直栏高亮 + 刷新位置记录
  document.addEventListener('pjax:complete', function () {
    var p = location.pathname;
    try { sessionStorage.setItem('mango-last', p); } catch (e) {}
    document.querySelectorAll('#mango-rail a').forEach(function (a) {
      var u = a.getAttribute('href');
      a.classList.toggle('active', u === '/' ? (p === '/' || p === '/index.html') : p.indexOf(u) === 0);
    });
  });
})();
