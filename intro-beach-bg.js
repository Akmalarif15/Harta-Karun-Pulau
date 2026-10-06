/* Ganti latar scene pembukaan dengan assets/beach_intro.png.
   Watak, kapal dan dialog kekal dilukis di atas gambar latar. */
(function () {
  if (typeof drawIntroScene !== 'function' || typeof ctx === 'undefined' || typeof canvas === 'undefined') return;

  const drawIntroSceneAsal = drawIntroScene;
  const bgPantai = new Image();
  bgPantai.src = 'assets/beach_intro.png?v=2';

  drawIntroScene = function () {
    // Gunakan scene asal sementara imej belum siap dimuat.
    if (!bgPantai.complete || !bgPantai.naturalWidth) {
      drawIntroSceneAsal();
      return;
    }

    // Cover seluruh canvas tanpa mengubah nisbah imej.
    const scale = Math.max(
      canvas.width / bgPantai.naturalWidth,
      canvas.height / bgPantai.naturalHeight
    );
    const w = bgPantai.naturalWidth * scale;
    const h = bgPantai.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    // Lapisan 1: background pantai.
    ctx.drawImage(bgPantai, x, y, w, h);

    // Lapisan 2: kapal.
    if (typeof drawShip === 'function') {
      drawShip(1050, 495, .92);
    }

    // Lapisan 3: watak.
    if (typeof drawCaptain === 'function') {
      drawCaptain(320, 650, 'Kapten Akmal', false, false);
      drawCaptain(1035, 420, 'Kapten Arif', true, false);
    }

    // Lapisan 4: dialog canvas. Overlay HTML sedia ada kekal di atas canvas.
    if (state.screen === 'intro' && typeof drawSpeechBubble === 'function') {
      const d = introLines[state.introIndex];
      if (d.speaker === 'Kapten Akmal') {
        drawSpeechBubble(375, 405, 400, 108, d.text, 'left');
      } else {
        drawSpeechBubble(655, 175, 520, 112, d.text, 'right');
      }
    }
  };
})();
