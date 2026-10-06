/* Gunakan PNG kapal lanun baharu dan laraskan Kapten Arif supaya benar-benar
   kelihatan berada di dalam kapal. Kandungan permainan kekal. */
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

  kapal.src = 'assets/pirate_ship.png?v=3';

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

    // Bayang kecil di bawah badan kapal supaya nampak berpijak pada air.
    ctx.fillStyle = 'rgba(29, 63, 73, .20)';
    ctx.beginPath();
    ctx.ellipse(x, y + u.h * 0.27, u.w * 0.40, Math.max(4, u.h * 0.045), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(kapalBersih, u.drawX, u.drawY, u.w, u.h);
    ctx.restore();
  };

  /* Lukis semula bahagian hadapan badan kapal selepas watak.
     Ini menutup kaki/bahagian bawah badan dan menghasilkan ilusi watak
     benar-benar berada di dalam kapal, bukannya terapung di atas kapal. */
  function lukisBadanKapalDepan(x, y, scale) {
    const u = ukuranKapal(x, y, scale);
    if (!u) return;

    ctx.save();
    ctx.beginPath();
    ctx.rect(u.drawX - 2, y - Math.max(3, u.h * 0.018), u.w + 4, u.h * 0.48);
    ctx.clip();
    ctx.drawImage(kapalBersih, u.drawX, u.drawY, u.w, u.h);
    ctx.restore();
  }

  if (drawCaptainAsal) {
    drawCaptain = function (x, y, name, isArif, cheer) {
      let xBaharu = x;
      let yBaharu = y;
      let kapalDepan = null;

      if (isArif) {
        // Scene pembukaan: kaki Arif berada sedikit di bawah paras dek.
        if (state.screen === 'title' || state.screen === 'intro') {
          xBaharu += 10;
          yBaharu += 52;
          kapalDepan = { x: 1050, y: 495, scale: 0.92 };
        }

        // Scene perjalanan: Arif berada di bahagian tengah dek kapal kecil.
        if (state.screen === 'travel') {
          xBaharu -= 8;
          yBaharu += 22;
          kapalDepan = { x: x - 24, y: y + 46, scale: 0.34 };
        }
      }

      drawCaptainAsal(xBaharu, yBaharu, name, isArif, cheer);

      if (kapalDepan) {
        lukisBadanKapalDepan(kapalDepan.x, kapalDepan.y, kapalDepan.scale);
      }
    };
  }
})();
