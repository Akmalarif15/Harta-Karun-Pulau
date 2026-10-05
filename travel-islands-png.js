/* Paparkan lima PNG pulau pada skrin perjalanan.
   Fail ini hanya menukar grafik peta perjalanan; kandungan dan logik permainan kekal. */
(function () {
  const sources = [
    'assets/islands/island_1.png?v=2',
    'assets/islands/island_2.png?v=2',
    'assets/islands/island_3.png?v=2',
    'assets/islands/island_4.png?v=2',
    'assets/islands/island_5.png?v=2'
  ];

  const islandAssets = new Array(5).fill(null);

  function removeWhiteBackground(img) {
    const off = document.createElement('canvas');
    off.width = img.naturalWidth;
    off.height = img.naturalHeight;
    const ox = off.getContext('2d');
    ox.drawImage(img, 0, 0);

    try {
      const imageData = ox.getImageData(0, 0, off.width, off.height);
      const d = imageData.data;
      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const min = Math.min(r, g, b);
        if (min > 248) {
          d[i + 3] = 0;
        } else if (min > 238) {
          d[i + 3] = Math.min(d[i + 3], Math.round((248 - min) * 25.5));
        }
      }
      ox.putImageData(imageData, 0, 0);
    } catch (e) {
      // Jika pemprosesan piksel gagal, gunakan imej asal.
      return img;
    }
    return off;
  }

  sources.forEach(function (src, index) {
    const img = new Image();
    img.onload = function () {
      islandAssets[index] = removeWhiteBackground(img);
    };
    img.src = src;
  });

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

    ctx.fillStyle = '#2f8f4c';
    ctx.beginPath();
    ctx.arc(p.x - 18, p.y - 31, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p.x + 15, p.y - 32, 18, 0, Math.PI * 2);
    ctx.fill();

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
    let w = 188;
    let h = w / ratio;
    if (h > 145) {
      h = 145;
      w = h * ratio;
    }

    ctx.save();
    ctx.drawImage(asset, p.x - w / 2, p.y - h * 0.72, w, h);

    // Nombor pulau supaya laluan masih jelas.
    ctx.fillStyle = 'rgba(255,255,255,.93)';
    ctx.strokeStyle = '#355866';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 25, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#284957';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(number), p.x, p.y + 25);
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

    // Laluan bertitik.
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

    // Titik mula.
    roundedRect(55, 590, 160, 64, 30, '#efd27b', '#9b7a3d', 3);
    ctx.fillStyle = '#314954';
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Mula', 135, 622);

    // Lima pulau PNG.
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

    // Bar kemajuan: peratus sahaja.
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
