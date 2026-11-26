/* ── 芒果基地 · 落樱效果 ─────────────────────────────
   轻量 canvas 实现：低数量、低功耗，页面切到后台自动暂停，
   尊重系统"减少动态效果"设置，手机端自动减少花瓣数量。 */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var canvas = document.createElement('canvas');
  canvas.id = 'sakura-canvas';
  canvas.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:999;';
  document.body.appendChild(canvas);
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var W, H, petals = [];

  var COLORS = [
    'rgba(255,183,210,',
    'rgba(255,158,196,',
    'rgba(255,201,225,',
    'rgba(247,170,200,'
  ];

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function Petal() { this.reset(true); }

  Petal.prototype.reset = function (init) {
    this.x = Math.random() * (W + 120) - 60;
    this.y = init ? Math.random() * H : -24;
    this.size = 4 + Math.random() * 6;
    this.speedY = 0.5 + Math.random() * 1.1;
    this.speedX = 0.2 + Math.random() * 0.7;
    this.swayFreq = 0.03 + Math.random() * 0.05;
    this.phase = Math.random() * Math.PI * 2;
    this.rot = Math.random() * Math.PI * 2;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
    this.color = COLORS[(Math.random() * COLORS.length) | 0];
    this.opacity = 0.45 + Math.random() * 0.4;
  };

  Petal.prototype.step = function () {
    this.y += this.speedY;
    this.phase += this.swayFreq;
    this.x += this.speedX + Math.sin(this.phase) * 0.6;
    this.rot += this.rotSpeed;
    if (this.y > H + 24 || this.x < -70 || this.x > W + 70) {
      this.reset(false);
      return;
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot + Math.sin(this.phase) * 0.3);
    ctx.fillStyle = this.color + this.opacity + ')';
    ctx.beginPath();
    ctx.ellipse(0, 0, this.size, this.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  function loop() {
    if (!document.hidden) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < petals.length; i++) petals[i].step();
    }
    requestAnimationFrame(loop);
  }

  resize();
  window.addEventListener('resize', resize);
  var count = W < 768 ? 10 : 22;
  for (var i = 0; i < count; i++) petals.push(new Petal());
  requestAnimationFrame(loop);
})();
