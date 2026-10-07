/* PNG premium untuk dialog; teks kekal dinamik dan dilukis di hadapan hiasan. */
(function () {
  'use strict';
  if (typeof ctx === 'undefined' || typeof state === 'undefined') return;

  const imgTag = new Image();
  imgTag.src = 'assets/ui/name_tag.png?v=2';
  const imgBubble = new Image();
  imgBubble.src = 'assets/ui/dialog_frame.png?v=2';

  function ready(img) {
    return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
  }

  /* Lukisan sembilan bahagian supaya ruang kertas tidak terpotong. */
  function nineSlice(img, x, y, w, h) {
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const L = 310, R = 175, T = 365, B = 270;
    const l = 95, r = 42, t = 62, b = 48;
    const sx = [0, L, iw - R], sy = [0, T, ih - B];
    const sw = [L, iw - L - R, R], sh = [T, ih - T - B, B];
    const dx = [x, x + l, x + w - r], dy = [y, y + t, y + h - b];
    const dw = [l, w - l - r, r], dh = [t, h - t - b, b];
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        if (dw[i] > 0 && dh[j] > 0) {
          ctx.drawImage(img, sx[i], sy[j], sw[i], sh[j], dx[i], dy[j], dw[i], dh[j]);
        }
      }
    }
  }

  function wrapText(text, maxWidth) {
    const words = String(text || '').trim().split(/\s+/);
    const lines = [];
    let line = '';
    words.forEach(function (word) {
      const test = line ? line + ' ' + word : word;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  const oldCaptain = typeof drawCaptain === 'function' ? drawCaptain : null;
  if (oldCaptain) {
    drawCaptain = function (x, y, name, isArif, cheer) {
      // Fungsi terdahulu kekal menjaga kapal dan kedudukan avatar.
      oldCaptain(x, y, '', isArif, cheer);
      if (!name) return;
      let px = x, py = y;
      if (isArif && (state.screen === 'intro' || state.screen === 'title')) {
        px += 8; py += 78;
      } else if (isArif && state.screen === 'travel') {
        px -= 8; py += 26;
      }
      const w = 210, h = 60;
      const top = py - (isArif ? 229 : 223);
      ctx.save();
      if (ready(imgTag)) {
        ctx.drawImage(imgTag, px - w / 2, top, w, h);
      } else {
        ctx.fillStyle = '#fff7df';
        ctx.strokeStyle = '#bf852c';
        ctx.lineWidth = 4;
        ctx.fillRect(px - w / 2, top + 7, w, h - 14);
        ctx.strokeRect(px - w / 2, top + 7, w, h - 14);
      }
      ctx.font = '900 16px Arial';
      ctx.fillStyle = '#18394a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(name), px + 21, top + 31, 130);
      ctx.restore();
    };
  }

  const oldBubble = typeof drawSpeechBubble === 'function' ? drawSpeechBubble : null;
  drawSpeechBubble = function (x, y, w, h, text, side) {
    if (!ready(imgBubble)) {
      if (oldBubble) oldBubble(x, y, w, h, text, side);
      return;
    }
    ctx.save();
    const bw = Math.max(470, w);
    const bx = Math.min(x, canvas.width - bw - 24);
    const isRight = side === 'right';
    const textX = bx + (isRight ? 32 : 108);
    const avail = bw - 150;
    ctx.font = '900 19px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    const lines = wrapText(text, avail);
    const bh = Math.max(190, 114 + lines.length * 27);
    const by = Math.min(y, canvas.height - bh - 165);
    // Cerminkan bingkai untuk ekor sebelah kanan, bukan teksnya.
    if (isRight) {
      ctx.translate(2 * bx + bw, 0);
      ctx.scale(-1, 1);
    }
    nineSlice(imgBubble, bx, by, bw, bh);
    if (isRight) {
      ctx.restore();
      ctx.save();
    }
    // Lukis semua ayat terakhir, supaya hiasan tidak menutup tulisan.
    ctx.fillStyle = '#17384a';
    ctx.font = '900 19px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    lines.forEach(function (line, i) {
      ctx.fillText(line, textX, by + 82 + i * 27, avail);
    });
    ctx.restore();
  };

  // Pastikan butang akhir guna PNG belayar tetapi teks HTML kekal berfungsi.
  const layer = document.getElementById('overlay');
  function updateIntroButton() {
    const button = document.getElementById('nextDialog');
    if (!button) return;
    const sailing = button.textContent.includes('Belayar ke Pulau 1');
    button.classList.toggle('premium-sail-button', sailing);
    button.setAttribute('aria-label', sailing ? 'Belayar ke Pulau 1' : 'Seterusnya');
  }
  if (layer) {
    new MutationObserver(updateIntroButton).observe(layer, {childList: true});
    updateIntroButton();
  }
})();
