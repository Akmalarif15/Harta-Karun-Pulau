/* Jadikan assets/ocean_background.png sebagai LATAR SAHAJA pada skrin perjalanan.
   Pulau, pesisiran mula, laluan, kapal, watak dan bar kemajuan kekal dilukis di atasnya. */
(function () {
  if (typeof drawTravel !== 'function' || typeof ctx === 'undefined' || typeof canvas === 'undefined') return;

  const drawTravelAsal = drawTravel;
  const drawSkySeaAsal = (typeof drawSkySea === 'function') ? drawSkySea : null;
  const oceanBackground = new Image();
  let oceanReady = false;

  oceanBackground.onload = function () {
    oceanReady = true;
  };

  oceanBackground.onerror = function () {
    oceanReady = false;
  };

  oceanBackground.src = 'assets/ocean_background.png?v=1';

  function drawOceanBackground() {
    if (!oceanReady || !oceanBackground.naturalWidth) {
      if (drawSkySeaAsal) {
        drawSkySeaAsal('#8fb9d1', '#579493');
      } else {
        ctx.fillStyle = '#8fb9d1';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Gaya cover: penuhkan canvas tanpa herotkan nisbah imej.
    const scale = Math.max(
      canvas.width / oceanBackground.naturalWidth,
      canvas.height / oceanBackground.naturalHeight
    );

    const w = oceanBackground.naturalWidth * scale;
    const h = oceanBackground.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.save();
    ctx.drawImage(oceanBackground, x, y, w, h);
    ctx.restore();
  }

  drawTravel = function (progress) {
    const currentDrawSkySea = (typeof drawSkySea === 'function') ? drawSkySea : null;

    try {
      // travel-islands-png.js memanggil drawSkySea paling awal.
      // Gantikan panggilan itu dengan latar laut PNG sahaja untuk satu frame ini.
      drawSkySea = function () {
        drawOceanBackground();
      };

      drawTravelAsal(progress);
    } finally {
      if (currentDrawSkySea) {
        drawSkySea = currentDrawSkySea;
      }
    }
  };
})();
