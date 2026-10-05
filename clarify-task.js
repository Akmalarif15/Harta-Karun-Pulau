'use strict';

(function () {
  const meanings = {
    'ringan tulang': 'suka menolong dan rajin bekerja',
    'buah tangan': 'hadiah yang dibawa pulang daripada sesuatu tempat',
    'kaki bangku': 'tidak pandai bermain bola',
    'makan angin': 'bersiar-siar atau melancong untuk berehat',
    'hati batu': 'degil atau tidak mahu menerima nasihat'
  };

  function enhanceMissionText() {
    const supportBox = document.querySelector('.mission-head + .support-box');
    const taskOne = document.getElementById('task1');
    const idiomLabel = document.getElementById('idiomLabel');

    if (!supportBox || !taskOne || !idiomLabel) return;

    const idiom = idiomLabel.textContent.trim().toLowerCase();
    const meaning = meanings[idiom];
    if (!meaning) return;

    if (supportBox.dataset.clarified !== idiom) {
      supportBox.innerHTML =
        '<div class="idiom-info-row">' +
          '<span class="idiom-info-label">Simpulan bahasa:</span>' +
          '<strong class="idiom-info-word">' + idiom + '</strong>' +
        '</div>' +
        '<div class="idiom-info-row">' +
          '<span class="idiom-info-label">Maksud:</span>' +
          '<strong>' + meaning + '.</strong>' +
        '</div>';
      supportBox.dataset.clarified = idiom;
    }

    const instruction = taskOne.querySelector('p');
    if (instruction && instruction.dataset.clarified !== idiom) {
      instruction.innerHTML =
        'Taip semula simpulan bahasa <strong>“' + idiom + '”</strong> di ruang di bawah. ' +
        'Perhatikan ejaan dan jarak antara perkataan.';
      instruction.dataset.clarified = idiom;
    }
  }

  const overlay = document.getElementById('overlay');
  if (!overlay) return;

  const observer = new MutationObserver(enhanceMissionText);
  observer.observe(overlay, { childList: true, subtree: true });
  enhanceMissionText();
})();
