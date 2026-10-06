/* Gunakan PNG kapal lanun baharu dan laraskan Kapten Arif supaya benar-benar
   kelihatan berada di dalam kapal tanpa muka dilindungi palang layar. */
(function () {
  if (typeof ctx === 'undefined' || typeof state === 'undefined') return;

  const drawShipAsal = (typeof drawShip === 'function') ? drawShip : null;
  const drawCaptainAsal = (typeof drawCaptain === 'function') ? drawCaptain : null;

  const kapal = new Image();
  let kapalSiap = false;
  let kapalBersih = null;

  function buangLatarPutih(img) {
    const off = document.createElement('canvas');
    off.width = img.naturalWidth;
    off.height = img.naturalHeight;
    const ox = off.getContext('2d');
    if (!ox) return img;

    try {
      ox.drawImage(img, 0, 0);
      const imageData = ox.getImageData(0, 0, off.width, off.height);
      const d = imageData.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i];
        const g = d[i + 1];
        const b = d[i + 2];
        const min = Math.min(r, g, b);

        if (min > 248) {
          d[i + 3] = 0;
        } else if (min > 238) {
          d[i + 3] = Math.min(d[i + 3], Math.round((248 - min) * 25.5));
        }
      }

      ox.putImageData(imageData, 0, 0);
      return off;
    } catch (e) {
      return img;
    }
  }

  kapal.onload = function () {
    kapalBersih = buangLatarPutih(kapal);
    kapalSiap = true;
  };

  kapal.onerror = function () {
    kapalSiap = false;
    kapalBersih = null;
  };

  kapal.src = 'assets/pirate_ship.png?v=5';

  function ukuranKapal(x, y, scale) {
    if (!kapalSiap || !kapalBersih) return null;

    const ratio = kapalBersih.width / kapalBersih.height;
    const w = 410 * scale;
    const h = w / ratio;
    const deckRatio = 0.61;

    return {
      x: x,
      y: y,
      scale: scale,
      w: w,
      h: h,
      drawX: x - w / 2,
      drawY: y - h * deckRatio
    };
  }

  drawShip = function (x, y, scale) {
    const u = ukuranKapal(x, y, scale);

    if (!u) {
      if (drawShipAsal) drawShipAsal(x, y, scale);
      return;
    }

    ctx.save();
    ctx.fillStyle = 'rgba(29, 63, 73, .20)';
    ctx.beginPath();
    ctx.ellipse(x, y + u.h * 0.27, u.w * 0.40, Math.max(4, u.h * 0.045), 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.drawImage(kapalBersih, u.drawX, u.drawY, u.w, u.h);
    ctx.restore();
  };

  /* Hanya bahagian bawah PNG kapal dilukis semula di hadapan watak.
     Ini penting supaya badan kayu kapal menutup kaki Arif, tetapi layar,
     palang layar dan tali tidak dilukis semula di atas muka. */
  function lukisBadanKapalDepan(x, y, scale, mulaBadan) {
    const u = ukuranKapal(x, y, scale);
    if (!u) return;

    const nisbahMula = mulaBadan || 0.60;
    const sw = kapalBersih.width;
    const sh = kapalBersih.height;
    const sy = Math.floor(sh * nisbahMula);
    const sourceH = sh - sy;

    const destY = u.drawY + u.h * nisbahMula;
    const destH = u.h * (1 - nisbahMula);

    ctx.save();
    ctx.drawImage(
      kapalBersih,
      0, sy, sw, sourceH,
      u.drawX, destY, u.w, destH
    );
    ctx.restore();
  }

  if (drawCaptainAsal) {
    drawCaptain = function (x, y, name, isArif, cheer) {
      let xBaharu = x;
      let yBaharu = y;
      let kapalDepan = null;

      if (isArif) {
        /* Scene pembukaan: Arif diturunkan secukupnya supaya kaki berada
           di dalam kapal, tetapi muka kekal jauh di atas sisi kapal. */
        if (state.screen === 'title' || state.screen === 'intro') {
          xBaharu += 8;
          yBaharu += 78;
          kapalDepan = { x: 1050, y: 495, scale: 0.92, mulaBadan: 0.60 };
        }

        /* Scene perjalanan: gunakan kesan sama pada kapal kecil. */
        if (state.screen === 'travel') {
          xBaharu -= 8;
          yBaharu += 26;
          kapalDepan = { x: x - 24, y: y + 46, scale: 0.34, mulaBadan: 0.60 };
        }
      }

      drawCaptainAsal(xBaharu, yBaharu, name, isArif, cheer);

      if (kapalDepan) {
        lukisBadanKapalDepan(
          kapalDepan.x,
          kapalDepan.y,
          kapalDepan.scale,
          kapalDepan.mulaBadan
        );
      }
    };
  }
})();
