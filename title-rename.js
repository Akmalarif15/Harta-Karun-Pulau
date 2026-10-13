/* Selaraskan nama produk kepada "Misi Pena Lanun" tanpa mengubah logik permainan. */
(function () {
  'use strict';

  const OLD_TITLE = 'Misi Harta Karun';
  const NEW_TITLE = 'Misi Pena Lanun';

  function replaceText(element) {
    if (!element || !element.textContent || !element.textContent.includes(OLD_TITLE)) return;
    element.textContent = element.textContent.replace(OLD_TITLE, NEW_TITLE);
  }

  function applyTitleRename() {
    if (document.title.includes(OLD_TITLE)) {
      document.title = document.title.replace(OLD_TITLE, NEW_TITLE);
    }

    document.querySelectorAll('.brand h1').forEach(replaceText);

    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.querySelectorAll('h1, h2, h3').forEach(replaceText);
    }
  }

  applyTitleRename();

  const overlay = document.getElementById('overlay');
  if (overlay) {
    new MutationObserver(applyTitleRename).observe(overlay, {
      childList: true,
      subtree: true
    });
  }
})();
