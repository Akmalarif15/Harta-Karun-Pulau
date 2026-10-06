/* Gunakan PNG kapal lanun baharu dan laraskan kedudukan Kapten Arif supaya
   kelihatan berdiri di atas dek, bukan terapung. Kandungan permainan kekal. */
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

  kapal.src = 'assets/pirate_ship.png?v=2';

  drawShip = function (x, y, scale) {
    if (!kapalSiap || !kapalBersih) {
      if (drawShipAsal) drawShipAsal(x, y, scale);
      return;
    }

    const ratio = kapalBersih.width / kapalBersih.height;
    const w = 410 * scale;
    const h = w / ratio;

    /* Dalam kod asal, nilai y bertindak hampir sebagai paras dek.
       Kekalkan semantik itu supaya semua scene lama masih sejajar. */
    const deckRatio = 0.61;
    const drawX = x - w / 2;
    const drawY = y - h * deckRatio;

    ctx.save();

    // Bayang kecil di bawah badan kapal supaya nampak berpijak pada air.
    ctx.fillStyle = 'rgba(29, 63, 73, .20)';
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.27, w * 0.40, Math.max(4, h * 0.045), 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.drawImage(kapalBersih, drawX, drawY, w, h);
    ctx.restore();
  };

  if (drawCaptainAsal) {
    drawCaptain = function (x, y, name, isArif, cheer) {
      let yBaharu = y;

      if (isArif) {
        // Scene pembukaan: turunkan kaki Arif tepat ke paras dek kapal.
        if (state.screen === 'title' || state.screen === 'intro') {
          yBaharu += 46;
        }

        // Scene perjalanan: rapatkan Arif sedikit kepada dek kapal kecil.
        if (state.screen === 'travel') {
          yBaharu += 18;
        }
      }

      drawCaptainAsal(x, yBaharu, name, isArif, cheer);
    };
  }
})();
