/* ============================================================
   WilleAI工具实验室 · Demo 交互库
   纯原生 JS，无依赖。提供演示用的假交互动效工具函数。
   ============================================================ */
(function () {
  const Demo = {
    /* 流式打字：把文字逐字写入元素 */
    typeWriter(el, text, speed = 18, done) {
      if (!el) return;
      el.textContent = '';
      el.classList.add('typing');
      let i = 0;
      const tick = () => {
        if (i < text.length) {
          el.textContent += text[i++];
          // 换行符处理
          if (text[i - 1] === '\n') {
            el.innerHTML = el.textContent.replace(/\n/g, '<br>');
          }
          setTimeout(tick, speed + Math.random() * 30);
        } else {
          el.classList.remove('typing');
          el.innerHTML = text.replace(/\n/g, '<br>');
          if (done) done();
        }
      };
      tick();
    },

    /* 进度条/数字递增：从当前值到目标值 */
    progressTo(barEl, numEl, to, duration = 3000, done) {
      const start = performance.now();
      const from = 0;
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3); // easeOutCubic
        const val = Math.round(from + (to - from) * ease);
        if (barEl) barEl.style.width = val + '%';
        if (numEl) numEl.textContent = val + '%';
        if (t < 1) requestAnimationFrame(step);
        else if (done) done();
      };
      requestAnimationFrame(step);
    },

    /* 数字 count-up：元素从 0 滚到目标值 */
    countUp(el, to, duration = 1600) {
      if (!el) return;
      const start = performance.now();
      const fmt = (n) => {
        if (to >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + 'w';
        if (to >= 1000) return n.toLocaleString();
        return n + (el.dataset.suffix || '');
      };
      const step = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = fmt(Math.round(to * ease));
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = fmt(to);
      };
      requestAnimationFrame(step);
    },

    /* 依次淡入：selector 选中的元素逐个显示 */
    staggerFadeIn(selector, interval = 300, done) {
      const els = document.querySelectorAll(selector);
      els.forEach(el => el.classList.add('demo-hidden'));
      let i = 0;
      const show = () => {
        if (i < els.length) {
          els[i].classList.remove('demo-hidden');
          els[i].classList.add('demo-fade-in');
          i++;
          setTimeout(show, interval);
        } else if (done) done();
      };
      show();
    },

    /* loading 态：按钮转圈 */
    btnLoading(btn, loadingText) {
      if (!btn) return;
      btn.dataset.origText = btn.innerHTML;
      btn.disabled = true;
      btn.classList.add('btn-loading');
      btn.innerHTML = `<span class="spinner"></span> ${loadingText || '处理中…'}`;
    },
    btnDone(btn, doneText) {
      if (!btn) return;
      btn.classList.remove('btn-loading');
      btn.innerHTML = doneText || btn.dataset.origText;
      btn.disabled = false;
    },

    /* toast 提示 */
    toast(msg, type = 'success') {
      const t = document.createElement('div');
      t.className = 'demo-toast ' + type;
      t.innerHTML = `<span class="toast-ic">${type === 'success' ? '✓' : '·'}</span> ${msg}`;
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
    },

    /* 演示态浮标（右下角，标注"数据为模拟"） */
    injectDemoBadge() {
      if (document.querySelector('.demo-badge')) return;
      const b = document.createElement('div');
      b.className = 'demo-badge';
      b.innerHTML = '<span class="dot"></span> 演示模式 · 数据为模拟';
      document.body.appendChild(b);
    }
  };

  window.Demo = Demo;
  document.addEventListener('DOMContentLoaded', Demo.injectDemoBadge);
})();
