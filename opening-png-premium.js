/* Hanya tandakan panel Mula Permainan untuk tema PNG premium.
   Tidak mengubah onclick, aliran permainan atau teks misi. */
(function () {
  'use strict';
  const root = document.getElementById('overlay');
  if (!root) return;

  function decorateOpening() {
    const startButton = root.querySelector('#startGame');
    if (!startButton) return;
    const panel = startButton.closest('.panel.compact');
    if (!panel) return;
    panel.classList.add('pirate-start-panel');

    // PNG lencana sudah ada, jadi buang emoji pendua pada tajuk sahaja.
    const title = panel.querySelector('h2');
    if (title && title.textContent.includes('🏴‍☠️')) {
      title.textContent = title.textContent.replace(/^🏴‍☠️\s*/, '');
    }
  }

  // Halaman mula mungkin diwujudkan semula selepas pengguna tekan Menu.
  new MutationObserver(decorateOpening).observe(root, { childList: true });
  decorateOpening();
})();
