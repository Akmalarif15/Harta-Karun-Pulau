/* Paparkan lima PNG pulau pada skrin perjalanan.
   Perjalanan hanya bermula selepas semua imej pulau siap dimuat dan diproses. */
(function () {
  const sources = [
    'assets/islands/island_1.png?v=3',
    'assets/islands/island_2.png?v=3',
    'assets/islands/island_3.png?v=3',
    'assets/islands/island_4.png?v=3',
    'assets/islands/island_5.png?v=3'
  ];

  const islandAssets = new Array(5).fill(null);
  let assetsReady = false;

  function removeWhiteBackground(img) {
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

  function loadAsset(src, index) {
    return new Promise(function (resolve) {
      const img = new Image();

      img.onload = function () {
        islandAssets[index] = removeWhiteBackground(img);
        resolve(true);
      };

      img.onerror = function () {
        islandAssets[index] = null;
        resolve(false);
      };

      img.src = src;
    });
  }

  const readyPromise = Promise.all(
    sources.map(function (src, index) {
      return loadAsset(src, index);
    })
  ).then(function () {
    assetsReady = true;
  });

  /* PNG asal agak besar. Pastikan peta tidak bermula ketika aset masih null,
     kerana keadaan itu menyebabkan pulau fallback lama dipaparkan. */
  if (typeof startTravel === 'function') {
    const originalStartTravel = startTravel;

    startTravel = function (from, to) {
      if (assetsReady) {
        originalStartTravel(from, to);
        return;
      }

      const nextButton = document.getElementById('nextDialog');
      if (nextButton) nextButton.disabled = true;

      readyPromise.then(function () {
        if (nextButton) nextButton.disabled = false;
        originalStartTravel(from, to);
      });
    };
  }

  function roundedRect(x, y, w, h, r, fill, stroke, lineWidth) {
    const q = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + q, y);
    ctx.arcTo(x + w, y, x + w, y + h, q);
    ctx.arcTo(x + w, y + h, x, y + h, q);
    ctx.arcTo(x, y + h, x, y, q);
    ctx.arcTo(x, y, x + w, y, q);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth || 2;
      ctx.stroke();
    }
  }

  function fallbackIsland(p, number) {
    ctx.fillStyle = '#e8d981';
    ctx.strokeStyle = '#657c64';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 76, 36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#314954';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), p.x, p.y + 5);
  }

  function drawIslandPng(p, number) {
    const asset = islandAssets[number - 1];

    if (!asset) {
      fallbackIsland(p, number);
      return;
    }

    const ratio = asset.width / asset.height;
    let w = 205;
    let h = w / ratio;

    if (h > 155) {
      h = 155;
      w = h * ratio;
    }

    ctx.save();
    ctx.drawImage(asset, p.x - w / 2, p.y - h * 0.72, w, h);

    ctx.fillStyle = 'rgba(255,255,255,.94)';
    ctx.strokeStyle = '#355866';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 27, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#284957';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), p.x, p.y + 27);
    ctx.restore();
  }

  drawTravel = function (progress) {
    if (typeof drawSkySea === 'function') {
      drawSkySea('#8fb9d1', '#579493');
    } else {
      ctx.fillStyle = '#8fb9d1';
      ctx.fillRect(0, 0, canvas.width, 430);
      ctx.fillStyle = '#579493';
      ctx.fillRect(0, 430, canvas.width, canvas.height - 430);
    }

    const pts = [
      { x: 135, y: 620 },
      { x: 340, y: 500 },
      { x: 550, y: 625 },
      { x: 770, y: 485 },
      { x: 995, y: 610 },
      { x: 1240, y: 490 }
    ];

    ctx.save();
    ctx.strokeStyle = '#f8f1c5';
    ctx.lineWidth = 5;
    ctx.setLineDash([11, 14]);
    ctx.beginPath();
    pts.forEach(function (p, i) {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    roundedRect(55, 590, 160, 64, 30, '#efd27b', '#9b7a3d', 3);
    ctx.fillStyle = '#314954';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Mula', 135, 622);

    for (let i = 1; i < pts.length; i++) {
      drawIslandPng(pts[i], i);
    }

    const fromIndex = Math.max(0, Math.min(state.travelFrom + 1, pts.length - 1));
    const toIndex = Math.max(0, Math.min(state.travelTo + 1, pts.length - 1));
    const a = pts[fromIndex];
    const b = pts[toIndex];
    const e = progress < .5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    const x = a.x + (b.x - a.x) * e;
    const y = a.y + (b.y - a.y) * e - 32 * Math.sin(Math.PI * e);

    if (typeof drawShip === 'function') drawShip(x, y, .34);
    if (typeof drawCaptain === 'function') {
      drawCaptain(x - 18, y - 46, '', false, false);
      drawCaptain(x + 24, y - 46, '', true, false);
    }

    roundedRect(500, 700, 440, 42, 18, '#f8fbf6', '#334b59', 3);
    ctx.fillStyle = '#e7d05d';
    ctx.fillRect(515, 714, 410 * progress, 14);
    ctx.strokeStyle = '#739094';
    ctx.lineWidth = 2;
    ctx.strokeRect(515, 714, 410, 14);
    ctx.fillStyle = '#314954';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(Math.round(progress * 100) + '%', 720, 690);
  };
})();
