'use strict';

const $ = (id) => document.getElementById(id);
const canvas = $('world');
const ctx = canvas.getContext('2d');
const overlay = $('overlay');

const missions = [
  {
    island: 'Pulau 1',
    place: 'Pulau Kelapa',
    idiom: 'ringan tulang',
    meaning: 'suka menolong dan rajin bekerja',
    sentence: 'Aina seorang murid yang ringan tulang.',
    tokens: ['ringan tulang', 'Aina', 'yang', 'seorang', 'murid'],
    sky: '#94e5ff', sea: '#159db6', sand: '#ffd777', leaf: '#3caf62'
  },
  {
    island: 'Pulau 2',
    place: 'Pulau Cenderamata',
    idiom: 'buah tangan',
    meaning: 'hadiah yang dibawa pulang daripada sesuatu tempat',
    sentence: 'Ibu membawa buah tangan dari Melaka.',
    tokens: ['dari', 'buah tangan', 'Ibu', 'Melaka', 'membawa'],
    sky: '#a7e9ff', sea: '#168fae', sand: '#f6d06d', leaf: '#42a95f'
  },
  {
    island: 'Pulau 3',
    place: 'Pulau Bola',
    idiom: 'kaki bangku',
    meaning: 'tidak pandai bermain bola',
    sentence: 'Hakim digelar kaki bangku ketika bermain bola.',
    tokens: ['bermain', 'Hakim', 'ketika', 'kaki bangku', 'digelar', 'bola'],
    sky: '#8dd9fb', sea: '#117fa5', sand: '#f5ce72', leaf: '#2e9d67'
  },
  {
    island: 'Pulau 4',
    place: 'Pulau Santai',
    idiom: 'makan angin',
    meaning: 'bersiar-siar atau melancong untuk berehat',
    sentence: 'Kami pergi makan angin di Langkawi.',
    tokens: ['Langkawi', 'makan angin', 'Kami', 'di', 'pergi'],
    sky: '#b6ebff', sea: '#1998b0', sand: '#ffdc7d', leaf: '#4caf6a'
  },
  {
    island: 'Pulau 5',
    place: 'Pulau Batu Hati',
    idiom: 'hati batu',
    meaning: 'degil atau tidak mahu menerima nasihat',
    sentence: 'Amin digelar hati batu kerana tidak mendengar nasihat.',
    tokens: ['tidak', 'hati batu', 'Amin', 'nasihat', 'kerana', 'mendengar', 'digelar'],
    sky: '#a5dfff', sea: '#147f9d', sand: '#f2c86a', leaf: '#348f59'
  }
];

const introLines = [
  { speaker: 'Kapten Mal', face: '🧑‍✈️', text: 'Wah, sebuah kapal lanun! Siapa di sana?' },
  { speaker: 'Kapten Arif', face: '🏴‍☠️', text: 'Aku Kapten Arif. Aku sedang mencari harta karun yang tersembunyi di kepulauan ini.' },
  { speaker: 'Kapten Mal', face: '🧑‍✈️', text: 'Harta karun? Bolehkah aku ikut serta?' },
  { speaker: 'Kapten Arif', face: '🏴‍☠️', text: 'Boleh! Tetapi kita mesti menyelesaikan lima misi Bahasa Melayu di lima pulau.' },
  { speaker: 'Kapten Mal', face: '🧑‍✈️', text: 'Baiklah! Mari kita bina dan tulis ayat sehingga harta karun ditemui!' }
];

const state = {
  screen: 'title',
  island: -1,
  completed: 0,
  saved: new Array(5).fill(false),
  results: new Array(5).fill(null),
  calm: false,
  introIndex: 0,
  travelStart: 0,
  travelFrom: -1,
  travelTo: 0,
  built: [],
  task1Done: false,
  task2Done: false,
  task3Done: false,
  inputMode: 'keyboard',
  strokes: 0,
  drawing: false,
  lastPoint: null,
  t: 0
};

const STORAGE_KEY = 'misiHartaKarunKaptenMalArif_v1';
let toastTimer = null;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, function (c) {
    return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[c];
  });
}

function saveLocal() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      completed: state.completed,
      saved: state.saved,
      results: state.results
    }));
  } catch (e) {}
}

function clearLocal() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function toast(message) {
  clearTimeout(toastTimer);
  $('toast').textContent = message;
  $('toast').classList.remove('hidden');
  toastTimer = setTimeout(function () {
    $('toast').classList.add('hidden');
  }, 2300);
}

function updateHud() {
  if (state.island >= 0 && state.island < missions.length) {
    const m = missions[state.island];
    $('locationLabel').textContent = m.island + ' • ' + m.place;
    $('idiomLabel').textContent = m.idiom;
  } else if (state.screen === 'final') {
    $('locationLabel').textContent = 'Pulau Harta Karun';
    $('idiomLabel').textContent = 'Semua selesai';
  } else {
    $('locationLabel').textContent = 'Pantai Permulaan';
    $('idiomLabel').textContent = 'Belum bermula';
  }
  $('progressLabel').textContent = state.completed + ' / 5 pulau';
  $('savedLabel').textContent = state.saved.filter(Boolean).length + ' / 5';
  document.querySelectorAll('.route-node').forEach(function (node, idx) {
    node.classList.remove('active','past','goal');
    const currentRoute = state.screen === 'final' ? 6 : Math.max(0, state.island + 1);
    if (idx < currentRoute) node.classList.add('past');
    if (idx === currentRoute) node.classList.add('active');
    if (idx === 6 && state.screen === 'final') node.classList.add('goal');
  });
}

function setOverlay(html) {
  overlay.innerHTML = html;
  overlay.classList.remove('hidden');
}

function closeOverlay() {
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}

function titleScreen() {
  state.screen = 'title';
  state.island = -1;
  state.introIndex = 0;
  updateHud();
  $('sceneLabel').textContent = 'Pantai Permulaan';
  const saved = readLocal();
  setOverlay(
    '<div class="panel compact">' +
      '<div class="overline">Pengembaraan Bahasa Melayu • Tahun 5</div>' +
      '<h2>🏴‍☠️ Misi Harta Karun</h2>' +
      '<p class="lead"><b>Bantu Kapten Mal dan Kapten Arif</b> merentasi lima pulau. Setiap pulau mempunyai satu misi simpulan bahasa.</p>' +
      '<div class="support-box">✍️ Setiap misi: <b>tulis simpulan bahasa → susun ayat → bina dan tulis ayat sendiri → simpan hasil kerja.</b></div>' +
      '<div class="actions">' +
        '<button class="btn primary" id="startGame">▶ Mula Permainan</button>' +
        (saved && saved.completed > 0 ? '<button class="btn secondary" id="resumeGame">↻ Sambung sesi (' + saved.completed + '/5)</button>' : '') +
        '<button class="btn secondary" id="openHelp">❔ Cara Bermain</button>' +
      '</div>' +
    '</div>'
  );
  $('startGame').onclick = function () {
    clearLocal();
    resetProgress();
    startIntro();
  };
  if ($('resumeGame')) {
    $('resumeGame').onclick = function () {
      restoreSession(saved);
    };
  }
  $('openHelp').onclick = helpScreen;
}

function resetProgress() {
  state.island = -1;
  state.completed = 0;
  state.saved = new Array(5).fill(false);
  state.results = new Array(5).fill(null);
  updateHud();
}

function restoreSession(saved) {
  state.completed = Math.max(0, Math.min(5, Number(saved.completed) || 0));
  state.saved = Array.isArray(saved.saved) ? saved.saved.slice(0,5) : new Array(5).fill(false);
  while (state.saved.length < 5) state.saved.push(false);
  state.results = Array.isArray(saved.results) ? saved.results.slice(0,5) : new Array(5).fill(null);
  while (state.results.length < 5) state.results.push(null);
  if (state.completed >= 5) {
    finalScreen();
    return;
  }
  state.island = state.completed;
  prepareMission();
  showMission();
}

function startIntro() {
  state.screen = 'intro';
  state.island = -1;
  state.introIndex = 0;
  updateHud();
  renderIntroLine();
}

function renderIntroLine() {
  const d = introLines[state.introIndex];
  setOverlay(
    '<div class="panel compact">' +
      '<div class="overline">Babak Pembukaan • Tepi Pantai</div>' +
      '<h2>⚓ Pertemuan Dua Kapten</h2>' +
      '<div class="dialog-card">' +
        '<div class="avatar" aria-hidden="true">' + d.face + '</div>' +
        '<div><div class="speaker">' + d.speaker + '</div><div class="dialog-text">' + d.text + '</div></div>' +
      '</div>' +
      '<p class="save-note">Dialog ' + (state.introIndex + 1) + ' daripada ' + introLines.length + '</p>' +
      '<div class="actions">' +
        '<button class="btn primary" id="nextDialog">' + (state.introIndex === introLines.length - 1 ? '⛵ Belayar ke Pulau 1' : 'Seterusnya →') + '</button>' +
      '</div>' +
    '</div>'
  );
  $('nextDialog').onclick = function () {
    if (state.introIndex < introLines.length - 1) {
      state.introIndex++;
      renderIntroLine();
    } else {
      startTravel(-1, 0);
    }
  };
}

function helpScreen() {
  const returnTo = state.screen;
  setOverlay(
    '<div class="panel compact">' +
      '<div class="overline">Panduan Ringkas</div>' +
      '<h2>🧭 Cara Bermain</h2>' +
      '<ol class="help-list">' +
        '<li>Ikuti perjalanan Kapten Mal dan Kapten Arif ke <b>5 pulau</b>.</li>' +
        '<li>Di setiap pulau, taip simpulan bahasa dengan betul.</li>' +
        '<li>Klik perkataan untuk menyusun satu ayat yang betul.</li>' +
        '<li>Tulis ayat sendiri menggunakan <b>keyboard</b> atau <b>mouse</b>.</li>' +
        '<li>Tekan <b>Simpan Hasil Pulau</b>. Fail PNG akan dimuat turun.</li>' +
        '<li>Jika jawapan belum betul, cuba semula. Pulau seterusnya hanya dibuka selepas misi selesai dan disimpan.</li>' +
      '</ol>' +
      '<div class="support-box"><b>DSKP:</b> SK 3.2 Menulis perkataan, frasa dan ayat yang bermakna • SP 3.2.1 Membina dan menulis ayat.</div>' +
      '<div class="actions"><button class="btn primary" id="closeHelp">Kembali</button></div>' +
    '</div>'
  );
  $('closeHelp').onclick = function () {
    if (returnTo === 'title') titleScreen();
    else if (returnTo === 'mission') showMission();
    else if (returnTo === 'final') finalScreen();
    else renderIntroLine();
  };
}

function startTravel(from, to) {
  state.screen = 'travel';
  state.travelFrom = from;
  state.travelTo = to;
  state.travelStart = performance.now();
  state.island = to;
  updateHud();
  closeOverlay();
  $('travelLabel').textContent = '⛵ Kapten Mal & Kapten Arif bergerak ke Pulau ' + (to + 1) + ' • 2 saat';
  $('travelLabel').classList.remove('hidden');
}

function finishTravel() {
  $('travelLabel').classList.add('hidden');
  prepareMission();
  showMission();
}

function prepareMission() {
  state.screen = 'mission';
  state.built = [];
  state.task1Done = false;
  state.task2Done = false;
  state.task3Done = false;
  state.inputMode = 'keyboard';
  state.strokes = 0;
  state.drawing = false;
  state.lastPoint = null;
  updateHud();
  $('sceneLabel').textContent = missions[state.island].island + ' • ' + missions[state.island].place;
}

function showMission() {
  state.screen = 'mission';
  const m = missions[state.island];
  setOverlay(
    '<div class="panel">' +
      '<div class="mission-head">' +
        '<div><div class="overline">' + m.island + ' daripada 5 • Misi Bahasa Melayu</div><h2>' + m.place + '</h2></div>' +
        '<div class="idiom-badge">🔑 ' + m.idiom + '</div>' +
      '</div>' +
      '<div class="support-box"><b>Petunjuk makna:</b> “' + m.idiom + '” bermaksud <b>' + m.meaning + '</b>.</div>' +

      '<section class="task" id="task1">' +
        '<div class="task-title"><span class="task-number">1</span><h3>Tulis simpulan bahasa</h3></div>' +
        '<p>Taip simpulan bahasa yang dipaparkan. Perhatikan ejaan dan jarak perkataan.</p>' +
        '<div class="field-row"><input id="idiomInput" class="text-input" autocomplete="off" placeholder="Taip simpulan bahasa di sini"><button id="checkIdiom" class="btn secondary" type="button">Semak</button></div>' +
        '<div id="idiomFeedback" class="feedback"></div>' +
      '</section>' +

      '<section class="task locked" id="task2">' +
        '<div class="task-title"><span class="task-number">2</span><h3>Susun supaya menjadi ayat</h3></div>' +
        '<p>Klik perkataan mengikut urutan yang betul.</p>' +
        '<div class="word-bank" id="wordBank"></div>' +
        '<div class="built-sentence" id="builtSentence"><span class="save-note">Ayat kamu akan muncul di sini.</span></div>' +
        '<div class="actions"><button id="undoWord" class="btn ghost" type="button" disabled>↶ Undur</button><button id="resetWords" class="btn ghost" type="button" disabled>↻ Susun semula</button><button id="checkSentence" class="btn secondary" type="button" disabled>Semak ayat</button></div>' +
        '<div id="sentenceFeedback" class="feedback"></div>' +
      '</section>' +

      '<section class="task locked" id="task3">' +
        '<div class="task-title"><span class="task-number">3</span><h3>Bina dan tulis ayat sendiri</h3></div>' +
        '<p>Bina satu ayat bermakna yang mengandungi simpulan bahasa <b>“' + m.idiom + '”</b>. Pilih cara menulis.</p>' +
        '<div class="mode-tabs"><button id="keyboardMode" class="btn secondary" type="button" aria-pressed="true">⌨️ Keyboard</button><button id="mouseMode" class="btn ghost" type="button" aria-pressed="false">🖱️ Mouse</button></div>' +
        '<div id="keyboardArea"><textarea id="ownSentence" class="sentence-input" rows="3" placeholder="Contoh: Tulis ayat lengkap kamu di sini."></textarea></div>' +
        '<div id="mouseArea" class="handwriting-wrap hidden"><canvas id="handwritingCanvas" width="1100" height="300" aria-label="Ruang tulisan menggunakan mouse atau sentuhan"></canvas><div class="canvas-tools"><button id="clearCanvas" class="btn ghost" type="button">Padam tulisan</button></div><p class="save-note">Tulisan tangan tidak boleh dinilai maknanya secara automatik. Permainan hanya mengesan bahawa murid telah menulis; guru perlu menyemak PNG yang disimpan.</p></div>' +
        '<div class="actions"><button id="checkOwn" class="btn secondary" type="button" disabled>Semak tulisan</button></div>' +
        '<div id="ownFeedback" class="feedback"></div>' +
      '</section>' +

      '<div class="mission-footer">' +
        '<button id="saveMission" class="btn success" type="button" disabled>💾 Simpan Hasil Pulau</button>' +
        '<button id="nextIsland" class="btn primary" type="button" disabled>' + (state.island === 4 ? '🏆 Dapatkan Harta Karun' : '⛵ Mara ke Pulau Seterusnya') + '</button>' +
      '</div>' +
    '</div>'
  );

  buildWordBank();
  bindMissionEvents();
}

function buildWordBank() {
  const m = missions[state.island];
  const bank = $('wordBank');
  bank.innerHTML = '';
  m.tokens.forEach(function (token, idx) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'word-token';
    b.textContent = token;
    b.dataset.idx = String(idx);
    b.disabled = !state.task1Done || state.built.indexOf(idx) !== -1;
    b.onclick = function () {
      if (!state.task1Done || state.task2Done) return;
      state.built.push(idx);
      renderBuiltSentence();
    };
    bank.appendChild(b);
  });
  renderBuiltSentence();
}

function renderBuiltSentence() {
  const m = missions[state.island];
  const out = $('builtSentence');
  if (!state.built.length) {
    out.innerHTML = '<span class="save-note">Ayat kamu akan muncul di sini.</span>';
  } else {
    out.innerHTML = '';
    state.built.forEach(function (idx) {
      const s = document.createElement('span');
      s.className = 'built-token';
      s.textContent = m.tokens[idx];
      out.appendChild(s);
    });
  }
  document.querySelectorAll('.word-token').forEach(function (b) {
    const idx = Number(b.dataset.idx);
    b.disabled = !state.task1Done || state.built.indexOf(idx) !== -1 || state.task2Done;
    b.classList.toggle('selected', state.built.indexOf(idx) !== -1);
  });
  $('undoWord').disabled = !state.built.length || state.task2Done;
  $('resetWords').disabled = !state.built.length || state.task2Done;
  $('checkSentence').disabled = !state.task1Done || state.built.length !== m.tokens.length || state.task2Done;
}

function bindMissionEvents() {
  const m = missions[state.island];

  $('checkIdiom').onclick = function () {
    const val = normalize($('idiomInput').value);
    if (val === normalize(m.idiom)) {
      state.task1Done = true;
      $('task1').classList.add('done');
      $('idiomInput').disabled = true;
      $('checkIdiom').disabled = true;
      $('idiomFeedback').className = 'feedback good';
      $('idiomFeedback').textContent = '✓ Betul! Sekarang susun ayat.';
      $('task2').classList.remove('locked');
      buildWordBank();
      toast('Bagus! Tugasan 1 selesai.');
    } else {
      $('idiomFeedback').className = 'feedback bad';
      $('idiomFeedback').textContent = 'Belum tepat. Cuba semula dan perhatikan ejaan simpulan bahasa.';
    }
  };

  $('idiomInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') $('checkIdiom').click();
  });

  $('undoWord').onclick = function () {
    state.built.pop();
    renderBuiltSentence();
  };

  $('resetWords').onclick = function () {
    state.built = [];
    renderBuiltSentence();
  };

  $('checkSentence').onclick = function () {
    const builtText = state.built.map(function (idx) { return m.tokens[idx]; }).join(' ') + '.';
    if (normalize(builtText) === normalize(m.sentence)) {
      state.task2Done = true;
      $('task2').classList.add('done');
      $('sentenceFeedback').className = 'feedback good';
      $('sentenceFeedback').textContent = '✓ Ayat betul: ' + m.sentence;
      $('task3').classList.remove('locked');
      enableWritingTask();
      renderBuiltSentence();
      toast('Hebat! Tugasan 2 selesai.');
    } else {
      $('sentenceFeedback').className = 'feedback bad';
      $('sentenceFeedback').textContent = 'Susunan belum betul. Tekan “Susun semula” dan cuba lagi.';
      state.built = [];
      renderBuiltSentence();
    }
  };

  $('keyboardMode').onclick = function () {
    if (!state.task2Done || state.task3Done) return;
    state.inputMode = 'keyboard';
    $('keyboardArea').classList.remove('hidden');
    $('mouseArea').classList.add('hidden');
    $('keyboardMode').setAttribute('aria-pressed','true');
    $('mouseMode').setAttribute('aria-pressed','false');
    $('keyboardMode').className = 'btn secondary';
    $('mouseMode').className = 'btn ghost';
  };

  $('mouseMode').onclick = function () {
    if (!state.task2Done || state.task3Done) return;
    state.inputMode = 'mouse';
    $('keyboardArea').classList.add('hidden');
    $('mouseArea').classList.remove('hidden');
    $('keyboardMode').setAttribute('aria-pressed','false');
    $('mouseMode').setAttribute('aria-pressed','true');
    $('keyboardMode').className = 'btn ghost';
    $('mouseMode').className = 'btn secondary';
    setupHandwritingCanvas();
  };

  $('checkOwn').onclick = function () {
    if (!state.task2Done) return;
    if (state.inputMode === 'keyboard') {
      const text = $('ownSentence').value.trim();
      const hasIdiom = normalize(text).indexOf(normalize(m.idiom)) !== -1;
      const enoughWords = normalize(text).split(' ').filter(Boolean).length >= 5;
      if (hasIdiom && enoughWords) {
        state.task3Done = true;
        $('task3').classList.add('done');
        $('ownSentence').disabled = true;
        $('ownFeedback').className = 'feedback good';
        $('ownFeedback').textContent = '✓ Ayat kamu mengandungi simpulan bahasa dan lengkap untuk disimpan.';
        finishMissionTasks();
      } else {
        $('ownFeedback').className = 'feedback bad';
        $('ownFeedback').textContent = 'Cuba lagi. Ayat mesti sekurang-kurangnya 5 perkataan dan mengandungi “' + m.idiom + '”.';
      }
    } else {
      if (state.strokes >= 12) {
        state.task3Done = true;
        $('task3').classList.add('done');
        $('ownFeedback').className = 'feedback good';
        $('ownFeedback').textContent = '✓ Tulisan dikesan. Simpan hasil PNG supaya guru boleh menyemak ayat kamu.';
        finishMissionTasks();
      } else {
        $('ownFeedback').className = 'feedback bad';
        $('ownFeedback').textContent = 'Tulisan masih terlalu sedikit. Tulis satu ayat lengkap pada ruang bergaris dan cuba semak lagi.';
      }
    }
  };

  $('clearCanvas').onclick = function () {
    clearHandwriting();
  };

  $('saveMission').onclick = saveMissionResult;

  $('nextIsland').onclick = function () {
    if (!state.saved[state.island]) return;
    if (state.island === missions.length - 1) {
      finalScreen();
    } else {
      startTravel(state.island, state.island + 1);
    }
  };
}

function enableWritingTask() {
  $('checkOwn').disabled = false;
}

function finishMissionTasks() {
  $('checkOwn').disabled = true;
  $('keyboardMode').disabled = true;
  $('mouseMode').disabled = true;
  $('saveMission').disabled = false;
  toast('Semua tugasan selesai. Simpan hasil kerja untuk mara.');
}

function setupHandwritingCanvas() {
  const c = $('handwritingCanvas');
  if (!c || c.dataset.ready === '1') return;
  c.dataset.ready = '1';
  const x = c.getContext('2d');
  x.lineWidth = 6;
  x.lineCap = 'round';
  x.lineJoin = 'round';
  x.strokeStyle = '#173e49';

  function point(e) {
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / r.width),
      y: (e.clientY - r.top) * (c.height / r.height)
    };
  }

  c.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    state.drawing = true;
    state.lastPoint = point(e);
    c.setPointerCapture(e.pointerId);
  });

  c.addEventListener('pointermove', function (e) {
    if (!state.drawing) return;
    e.preventDefault();
    const p = point(e);
    x.beginPath();
    x.moveTo(state.lastPoint.x, state.lastPoint.y);
    x.lineTo(p.x, p.y);
    x.stroke();
    state.lastPoint = p;
    state.strokes++;
  });

  function stop() {
    state.drawing = false;
    state.lastPoint = null;
  }

  c.addEventListener('pointerup', stop);
  c.addEventListener('pointercancel', stop);
  c.addEventListener('lostpointercapture', stop);
}

function clearHandwriting() {
  const c = $('handwritingCanvas');
  if (!c) return;
  c.getContext('2d').clearRect(0,0,c.width,c.height);
  state.strokes = 0;
  state.task3Done = false;
  $('task3').classList.remove('done');
  $('saveMission').disabled = true;
  $('ownFeedback').className = 'feedback info';
  $('ownFeedback').textContent = 'Ruang tulisan telah dikosongkan.';
  $('checkOwn').disabled = false;
}

function saveMissionResult() {
  const m = missions[state.island];
  const ownText = state.inputMode === 'keyboard' ? $('ownSentence').value.trim() : '[Tulisan menggunakan mouse — lihat imej PNG]';
  const result = {
    island: m.island,
    place: m.place,
    idiom: m.idiom,
    arrangedSentence: m.sentence,
    ownSentence: ownText,
    mode: state.inputMode,
    savedAt: new Date().toLocaleString('ms-MY')
  };

  state.results[state.island] = result;
  state.saved[state.island] = true;
  state.completed = Math.max(state.completed, state.island + 1);
  saveLocal();
  downloadMissionPng(result);

  $('saveMission').disabled = true;
  $('saveMission').textContent = '✓ Hasil Telah Disimpan';
  $('nextIsland').disabled = false;
  updateHud();
  toast('Hasil Pulau ' + (state.island + 1) + ' disimpan. Kamu boleh mara!');
}

function wrapText(c, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  let yy = y;
  for (let i = 0; i < words.length; i++) {
    const test = line + words[i] + ' ';
    if (c.measureText(test).width > maxWidth && i > 0) {
      c.fillText(line.trim(), x, yy);
      line = words[i] + ' ';
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  c.fillText(line.trim(), x, yy);
  return yy;
}

function downloadMissionPng(result) {
  const out = document.createElement('canvas');
  out.width = 1200;
  out.height = 900;
  const c = out.getContext('2d');

  c.fillStyle = '#fff8df';
  c.fillRect(0,0,out.width,out.height);
  c.fillStyle = '#0f7280';
  c.fillRect(0,0,out.width,110);

  c.fillStyle = '#ffffff';
  c.font = 'bold 38px Arial';
  c.fillText('Misi Harta Karun Kapten Mal & Kapten Arif', 55, 65);

  c.fillStyle = '#25433f';
  c.font = 'bold 31px Arial';
  c.fillText(result.island + ' • ' + result.place, 55, 165);

  c.font = 'bold 24px Arial';
  c.fillStyle = '#8d5c21';
  c.fillText('Simpulan bahasa: ' + result.idiom, 55, 215);

  c.fillStyle = '#263b3b';
  c.font = '22px Arial';
  c.fillText('SK 3.2: Menulis perkataan, frasa dan ayat yang bermakna', 55, 265);
  c.fillText('SP 3.2.1: Membina dan menulis ayat', 55, 302);

  c.fillStyle = '#e9d49b';
  c.fillRect(55,340,1090,2);

  c.fillStyle = '#25433f';
  c.font = 'bold 24px Arial';
  c.fillText('Ayat susunan yang betul:', 55, 390);
  c.font = '22px Arial';
  wrapText(c, result.arrangedSentence, 55, 430, 1080, 34);

  c.font = 'bold 24px Arial';
  c.fillText('Ayat murid:', 55, 515);

  if (result.mode === 'keyboard') {
    c.font = '22px Arial';
    wrapText(c, result.ownSentence, 55, 555, 1080, 36);
  } else {
    const hw = $('handwritingCanvas');
    if (hw) {
      c.fillStyle = '#ffffff';
      c.fillRect(55,550,1090,235);
      c.strokeStyle = '#b9cfc9';
      c.lineWidth = 2;
      for (let y = 595; y < 785; y += 45) {
        c.beginPath(); c.moveTo(55,y); c.lineTo(1145,y); c.stroke();
      }
      c.drawImage(hw,55,550,1090,235);
    }
  }

  c.fillStyle = '#60706a';
  c.font = '18px Arial';
  c.fillText('Disimpan: ' + result.savedAt, 55, 835);
  c.fillText('Nota: Tulisan mouse perlu disemak oleh guru.', 55, 870);

  const link = document.createElement('a');
  link.download = 'Hasil_Pulau_' + (state.island + 1) + '_' + result.idiom.replace(/\s+/g,'_') + '.png';
  link.href = out.toDataURL('image/png');
  link.click();
}

function finalScreen() {
  state.screen = 'final';
  state.island = 5;
  updateHud();
  $('sceneLabel').textContent = 'Pulau Harta Karun • Misi Selesai';
  closeOverlay();
  setTimeout(function () {
    setOverlay(
      '<div class="panel compact">' +
        '<div class="overline">🏆 Penamat Pengembaraan</div>' +
        '<h2>Tahniah! Harta Karun Ditemui!</h2>' +
        '<div class="dialog-card"><div class="avatar">🧑‍✈️</div><div><div class="speaker">Kapten Mal</div><div class="dialog-text">Kita berjaya! Semua lima misi telah diselesaikan.</div></div></div>' +
        '<div class="dialog-card"><div class="avatar">🏴‍☠️</div><div><div class="speaker">Kapten Arif</div><div class="dialog-text">Hebat! Kamu telah membantu kami membina dan menulis ayat menggunakan lima simpulan bahasa.</div></div></div>' +
        '<div class="summary-grid"><div><b>5/5</b><small>Pulau selesai</small></div><div><b>5</b><small>Simpulan bahasa</small></div><div><b>' + state.saved.filter(Boolean).length + '</b><small>Hasil disimpan</small></div></div>' +
        '<div class="actions"><button class="btn success" id="downloadSummary">📄 Simpan Ringkasan</button><button class="btn primary" id="playAgain">↻ Main Semula</button></div>' +
      '</div>'
    );
    $('downloadSummary').onclick = downloadSummary;
    $('playAgain').onclick = function () {
      clearLocal();
      resetProgress();
      titleScreen();
    };
  }, 900);
}

function downloadSummary() {
  let text = 'RINGKASAN MISI HARTA KARUN KAPTEN MAL & KAPTEN ARIF\\n';
  text += 'SK 3.2 Menulis perkataan, frasa dan ayat yang bermakna\\n';
  text += 'SP 3.2.1 Membina dan menulis ayat\\n\\n';
  state.results.forEach(function (r, i) {
    if (!r) return;
    text += 'PULAU ' + (i + 1) + '\\n';
    text += 'Simpulan bahasa: ' + r.idiom + '\\n';
    text += 'Ayat susunan: ' + r.arrangedSentence + '\\n';
    text += 'Ayat murid: ' + r.ownSentence + '\\n';
    text += 'Kaedah menulis: ' + (r.mode === 'keyboard' ? 'Keyboard' : 'Mouse') + '\\n';
    text += 'Disimpan: ' + r.savedAt + '\\n\\n';
  });
  text += 'Nota: Hasil tulisan menggunakan mouse perlu disemak oleh guru.\\n';
  const blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Ringkasan_Misi_Harta_Karun.txt';
  a.click();
  URL.revokeObjectURL(url);
}

function exitToMenu() {
  if (state.screen === 'title') return;
  const prev = state.screen;
  setOverlay(
    '<div class="panel compact">' +
      '<div class="overline">Kembali ke Menu</div>' +
      '<h2>Keluar daripada sesi?</h2>' +
      '<p class="lead">Kemajuan yang telah disimpan masih boleh disambung semula daripada menu utama.</p>' +
      '<div class="actions"><button class="btn danger" id="confirmExit">Ya, ke Menu</button><button class="btn secondary" id="cancelExit">Batal</button></div>' +
    '</div>'
  );
  $('confirmExit').onclick = titleScreen;
  $('cancelExit').onclick = function () {
    if (prev === 'mission') showMission();
    else if (prev === 'final') finalScreen();
    else if (prev === 'intro') renderIntroLine();
    else closeOverlay();
  };
}

function drawSkySea(sky, sea) {
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,sky);
  g.addColorStop(.52,'#eaf9ff');
  g.addColorStop(.53,sea);
  g.addColorStop(1,'#07566f');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle = '#fff7cfcc';
  ctx.beginPath();
  ctx.arc(1160,120,62,0,Math.PI*2);
  ctx.fill();

  ctx.strokeStyle = '#d6f7ff77';
  ctx.lineWidth = 4;
  for (let y = 500; y < 790; y += 45) {
    ctx.beginPath();
    for (let x = 0; x <= canvas.width; x += 30) {
      const yy = y + Math.sin(x * .018 + state.t * (state.calm ? 0 : 1.2)) * 6;
      if (x === 0) ctx.moveTo(x,yy); else ctx.lineTo(x,yy);
    }
    ctx.stroke();
  }
}


function roundedRect(x,y,w,h,r,fill,stroke,lineWidth) {
  const rr = Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
  if (fill) { ctx.fillStyle=fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle=stroke; ctx.lineWidth=lineWidth||2; ctx.stroke(); }
}

function drawCloud(x,y,scale,alpha) {
  ctx.save();
  ctx.globalAlpha = alpha == null ? .72 : alpha;
  ctx.fillStyle = '#ffffff';
  [[0,10,46,20],[40,0,52,27],[88,11,44,19],[52,18,75,22]].forEach(function(p){
    ctx.beginPath();
    ctx.ellipse(x+p[0]*scale,y+p[1]*scale,p[2]*scale,p[3]*scale,0,0,Math.PI*2);
    ctx.fill();
  });
  ctx.restore();
}

function drawBird(x,y,scale) {
  ctx.save();
  ctx.strokeStyle='#315b68aa';
  ctx.lineWidth=3*scale;
  ctx.beginPath();
  ctx.arc(x,y,13*scale,Math.PI*1.05,Math.PI*1.85);
  ctx.arc(x+24*scale,y,13*scale,Math.PI*1.15,Math.PI*1.95);
  ctx.stroke();
  ctx.restore();
}

function drawPalm(x,y,scale) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);

  ctx.fillStyle='#214b3e33';
  ctx.beginPath();ctx.ellipse(7,8,58,18,0,0,Math.PI*2);ctx.fill();

  const trunk=ctx.createLinearGradient(-10,-170,20,0);
  trunk.addColorStop(0,'#bd8043');trunk.addColorStop(.55,'#8a542c');trunk.addColorStop(1,'#5f381f');
  ctx.strokeStyle=trunk;ctx.lineWidth=19;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-16,-76,18,-171);ctx.stroke();

  ctx.strokeStyle='#5a371f77';ctx.lineWidth=3;
  for(let i=0;i<9;i++){
    const yy=-18-i*17;
    ctx.beginPath();ctx.moveTo(-9,yy);ctx.lineTo(11,yy-4);ctx.stroke();
  }

  for (let i=0;i<9;i++) {
    const a=(i/9)*Math.PI*2-.35;
    const ex=18+Math.cos(a)*112, ey=-171+Math.sin(a)*46;
    const mx=18+Math.cos(a)*62, my=-176+Math.sin(a)*26;
    ctx.fillStyle=i%2?'#2a944d':'#43b764';
    ctx.strokeStyle='#1b6c3a';ctx.lineWidth=2;
    ctx.beginPath();
    ctx.moveTo(18,-171);
    ctx.quadraticCurveTo(mx,my-18,ex,ey);
    ctx.quadraticCurveTo(mx+7,my+12,18,-171);
    ctx.closePath();ctx.fill();ctx.stroke();
  }

  [['#744627',8,-158,9],['#6a3d23',25,-157,9],['#82502a',16,-145,8]].forEach(function(c){
    ctx.fillStyle=c[0];ctx.beginPath();ctx.arc(c[1],c[2],c[3],0,Math.PI*2);ctx.fill();
  });
  ctx.restore();
}

function drawCaptain(x,y,name,isArif,cheer) {
  ctx.save();
  ctx.translate(x,y);
  const bob = state.calm ? 0 : Math.sin(state.t*3 + x*.01)*3;
  ctx.translate(0,bob);

  ctx.fillStyle='#042e3860';
  ctx.beginPath();ctx.ellipse(0,15,36,11,0,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle='#253139';ctx.lineWidth=8;ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(-11,-8);ctx.lineTo(-17,29);
  ctx.moveTo(11,-8);ctx.lineTo(17,29);
  ctx.stroke();

  ctx.strokeStyle='#513b28';ctx.lineWidth=10;
  ctx.beginPath();ctx.moveTo(-18,29);ctx.lineTo(-5,29);ctx.moveTo(5,29);ctx.lineTo(20,29);ctx.stroke();

  const coat = isArif ? '#244c68' : '#a8433b';
  const coatDark = isArif ? '#183245' : '#71302c';
  ctx.fillStyle=coat;
  ctx.beginPath();ctx.moveTo(-28,-64);ctx.lineTo(28,-64);ctx.lineTo(24,-8);ctx.lineTo(-24,-8);ctx.closePath();ctx.fill();
  ctx.strokeStyle=coatDark;ctx.lineWidth=3;ctx.stroke();

  ctx.fillStyle='#fff0c5';ctx.fillRect(-24,-55,48,11);
  ctx.fillStyle='#e7b54c';ctx.beginPath();ctx.arc(0,-29,5,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle='#273239';ctx.lineWidth=8;ctx.lineCap='round';
  ctx.beginPath();
  if (cheer) {
    ctx.moveTo(-22,-48);ctx.lineTo(-44,-83);
    ctx.moveTo(22,-48);ctx.lineTo(44,-83);
  } else {
    ctx.moveTo(-22,-49);ctx.lineTo(-39,-24);
    ctx.moveTo(22,-49);ctx.lineTo(39,-24);
  }
  ctx.stroke();

  ctx.fillStyle='#d9a77a';
  ctx.beginPath();ctx.arc(0,-87,25,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#2a2427';
  ctx.beginPath();
  ctx.moveTo(-36,-106);ctx.lineTo(36,-106);ctx.lineTo(44,-96);ctx.lineTo(-44,-96);ctx.closePath();ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-24,-106);ctx.quadraticCurveTo(-12,-137,0,-126);
  ctx.quadraticCurveTo(15,-141,27,-106);ctx.closePath();ctx.fill();

  ctx.fillStyle='#f5cc58';ctx.fillRect(-17,-108,34,4);

  ctx.fillStyle='#312626';
  ctx.beginPath();ctx.arc(-8,-87,2.8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(9,-87,2.8,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle='#684338';ctx.lineWidth=2.2;
  ctx.beginPath();ctx.arc(1,-76,9,.15,Math.PI-.15);ctx.stroke();

  if (isArif) {
    ctx.fillStyle='#2e2323';
    ctx.beginPath();ctx.arc(2,-69,12,.05,Math.PI-.05);ctx.lineTo(12,-61);ctx.lineTo(-8,-61);ctx.closePath();ctx.fill();
  }

  if (name) {
    roundedRect(-68,-158,136,31,12,'#063f50e8','#ffd36a',2);
    ctx.fillStyle='#fff7d1';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText(name,0,-137);
  }
  ctx.restore();
}

function drawShip(x,y,scale) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);

  ctx.fillStyle='#052e3866';ctx.beginPath();ctx.ellipse(0,66,182,24,0,0,Math.PI*2);ctx.fill();

  const hg=ctx.createLinearGradient(0,0,0,95);hg.addColorStop(0,'#b77c3c');hg.addColorStop(.55,'#7a4729');hg.addColorStop(1,'#41271d');
  ctx.fillStyle=hg;ctx.strokeStyle='#f0c36d';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-175,4);ctx.lineTo(-142,72);ctx.quadraticCurveTo(0,104,142,72);ctx.lineTo(175,4);ctx.lineTo(102,24);ctx.lineTo(-106,24);ctx.closePath();ctx.fill();ctx.stroke();

  ctx.strokeStyle='#e1a85d88';ctx.lineWidth=3;
  for(let yy=39;yy<=70;yy+=15){ctx.beginPath();ctx.moveTo(-140,yy);ctx.quadraticCurveTo(0,yy+24,140,yy);ctx.stroke();}

  ctx.fillStyle='#40281e';ctx.fillRect(-118,4,236,13);
  ctx.fillStyle='#f1c46d';ctx.fillRect(-115,1,230,4);

  ctx.strokeStyle='#55341f';ctx.lineWidth=11;ctx.beginPath();ctx.moveTo(0,15);ctx.lineTo(0,-205);ctx.stroke();

  ctx.strokeStyle='#e7dab7';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(0,-197);ctx.lineTo(-150,10);ctx.moveTo(0,-197);ctx.lineTo(150,10);ctx.stroke();

  ctx.fillStyle='#fff1c9';ctx.strokeStyle='#8b704a';ctx.lineWidth=3;
  ctx.beginPath();ctx.moveTo(6,-188);ctx.lineTo(132,-150);ctx.lineTo(132,-48);ctx.lineTo(6,-70);ctx.closePath();ctx.fill();ctx.stroke();

  ctx.fillStyle='#3a2a2b';
  ctx.beginPath();ctx.moveTo(0,-205);ctx.lineTo(88,-182);ctx.lineTo(0,-153);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff4d1';ctx.font='bold 31px Arial';ctx.textAlign='center';ctx.fillText('☠',33,-173);

  ctx.fillStyle='#1c2227';
  for(let px=-105;px<=105;px+=42){ctx.beginPath();ctx.arc(px,52,7,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawSpeechBubble(x,y,w,h,text,side) {
  roundedRect(x,y,w,h,18,'#fffdf2','#ba7f2f',3);
  ctx.fillStyle='#fffdf2';
  ctx.strokeStyle='#ba7f2f';ctx.lineWidth=3;
  ctx.beginPath();
  if(side==='left'){
    ctx.moveTo(x+28,y+h-2);ctx.lineTo(x+3,y+h+28);ctx.lineTo(x+52,y+h-4);
  } else {
    ctx.moveTo(x+w-50,y+h-3);ctx.lineTo(x+w-3,y+h+26);ctx.lineTo(x+w-28,y+h-4);
  }
  ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#263a3c';ctx.font='bold 19px Arial';ctx.textAlign='left';
  const words=text.split(' ');let line='';let yy=y+32;
  words.forEach(function(word,i){
    const t=line+word+' ';
    if(ctx.measureText(t).width>w-30 && line){ctx.fillText(line.trim(),x+15,yy);line=word+' ';yy+=27;}else line=t;
    if(i===words.length-1)ctx.fillText(line.trim(),x+15,yy);
  });
}

function drawGiftStall(x,y) {
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#7d4b28';ctx.fillRect(-70,-5,140,75);
  ctx.fillStyle='#f7cf68';ctx.fillRect(-80,-38,160,32);
  for(let i=-70;i<80;i+=40){ctx.fillStyle=(i/40)%2===0?'#ea6254':'#fff2c4';ctx.fillRect(i,-38,22,32);}
  ctx.fillStyle='#a65a32';ctx.fillRect(-58,8,116,42);
  const colors=['#e95b5b','#4aa2d8','#f4c64e'];
  [-38,0,38].forEach(function(px,i){ctx.fillStyle=colors[i];ctx.fillRect(px-14,18,28,24);ctx.strokeStyle='#fff1c9';ctx.lineWidth=3;ctx.strokeRect(px-14,18,28,24);ctx.beginPath();ctx.moveTo(px,18);ctx.lineTo(px,42);ctx.stroke();});
  ctx.restore();
}

function drawFootballGoal(x,y) {
  ctx.save();ctx.translate(x,y);ctx.strokeStyle='#f5f5f5';ctx.lineWidth=8;
  ctx.strokeRect(-80,-70,160,85);
  ctx.strokeStyle='#d6e5e6aa';ctx.lineWidth=2;
  for(let xx=-70;xx<=70;xx+=20){ctx.beginPath();ctx.moveTo(xx,-68);ctx.lineTo(xx,12);ctx.stroke();}
  for(let yy=-55;yy<=5;yy+=15){ctx.beginPath();ctx.moveTo(-78,yy);ctx.lineTo(78,yy);ctx.stroke();}
  ctx.restore();
}

function drawHammock(x,y) {
  ctx.save();ctx.translate(x,y);
  ctx.strokeStyle='#65472b';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-95,40);ctx.lineTo(-75,-85);ctx.moveTo(95,40);ctx.lineTo(75,-85);ctx.stroke();
  ctx.strokeStyle='#f2d98f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-75,-48);ctx.quadraticCurveTo(0,32,75,-48);ctx.stroke();
  ctx.strokeStyle='#4b9f83';ctx.lineWidth=14;ctx.beginPath();ctx.moveTo(-67,-42);ctx.quadraticCurveTo(0,18,67,-42);ctx.stroke();
  ctx.restore();
}

function drawRockCave(x,y) {
  ctx.save();ctx.translate(x,y);
  ctx.fillStyle='#555e60';ctx.strokeStyle='#394648';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(-110,50);ctx.lineTo(-92,-45);ctx.lineTo(-55,-95);ctx.lineTo(5,-120);ctx.lineTo(72,-82);ctx.lineTo(108,-25);ctx.lineTo(118,55);ctx.closePath();ctx.fill();ctx.stroke();
  const g=ctx.createRadialGradient(5,5,5,5,5,80);g.addColorStop(0,'#13384a');g.addColorStop(1,'#071f2b');
  ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(5,20,55,72,0,Math.PI,Math.PI*2);ctx.lineTo(60,55);ctx.lineTo(-50,55);ctx.closePath();ctx.fill();
  ctx.restore();
}

function drawTreasureChest(x,y,scale,open) {
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
  ctx.fillStyle='#082f3855';ctx.beginPath();ctx.ellipse(0,68,100,24,0,0,Math.PI*2);ctx.fill();
  if(open){
    const glow=ctx.createRadialGradient(0,-25,0,0,-25,130);glow.addColorStop(0,'#fff1a599');glow.addColorStop(1,'#fff1a500');ctx.fillStyle=glow;ctx.fillRect(-135,-160,270,230);
    ctx.fillStyle='#9a5a2f';ctx.strokeStyle='#f4c759';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-86,-4);ctx.lineTo(-73,-76);ctx.lineTo(70,-76);ctx.lineTo(86,-4);ctx.closePath();ctx.fill();ctx.stroke();
    for(let i=0;i<22;i++){ctx.fillStyle=i%2?'#ffd85a':'#fff0a0';ctx.beginPath();ctx.arc(-65+(i*31)%130,13+(i*17)%35,7,0,Math.PI*2);ctx.fill();}
  }
  const g=ctx.createLinearGradient(0,-5,0,70);g.addColorStop(0,'#a96d39');g.addColorStop(1,'#56301f');
  ctx.fillStyle=g;ctx.strokeStyle='#f0c05d';ctx.lineWidth=5;ctx.fillRect(-90,-5,180,75);ctx.strokeRect(-90,-5,180,75);
  [-58,0,58].forEach(function(px){ctx.fillStyle='#dba845';ctx.fillRect(px-6,0,12,65);});
  ctx.fillStyle='#f1c95e';ctx.fillRect(-19,16,38,28);ctx.fillStyle='#6c4b20';ctx.fillRect(-6,28,12,12);
  ctx.restore();
}

function drawIntroScene() {
  drawSkySea('#92e6ff','#159bb6');
  drawCloud(110,95,.75,.62);drawCloud(520,125,.6,.5);drawBird(470,185,1);drawBird(540,162,.7);

  const sand = ctx.createLinearGradient(0,380,720,810);
  sand.addColorStop(0,'#ffe59a');sand.addColorStop(.62,'#f0c35f');sand.addColorStop(1,'#c98f3c');
  ctx.fillStyle=sand;
  ctx.beginPath();
  ctx.moveTo(0,350);ctx.quadraticCurveTo(390,380,700,810);ctx.lineTo(0,810);ctx.closePath();ctx.fill();

  ctx.fillStyle='#fff3b777';
  for(let i=0;i<80;i++){ctx.beginPath();ctx.arc((i*83)%640,450+(i*47)%330,2+(i%2),0,Math.PI*2);ctx.fill();}

  drawPalm(150,500,1.18);
  drawPalm(545,605,.63);
  drawShip(1050,470,.94);
  drawCaptain(320,650,'Kapten Mal',false,false);
  drawCaptain(1045,400,'Kapten Arif',true,false);

  if(state.screen==='intro'){
    const d=introLines[state.introIndex];
    if(d.speaker==='Kapten Mal') drawSpeechBubble(360,420,390,115,d.text,'left');
    else drawSpeechBubble(665,165,530,120,d.text,'right');
  } else {
    drawSpeechBubble(355,425,390,105,'Kapten Mal ternampak sebuah kapal lanun di tepi pantai.','left');
  }

  roundedRect(520,42,400,52,16,'#063e50d9','#ffd36a',2);
  ctx.fillStyle='#fff4bf';ctx.font='bold 28px Georgia';ctx.textAlign='center';ctx.fillText('Pertemuan di Tepi Pantai',720,77);
}

function drawIslandScene(index) {
  const m = missions[Math.max(0,Math.min(index,4))];
  drawSkySea(m.sky,m.sea);
  drawCloud(90,86,.6,.55);drawCloud(965,125,.55,.45);drawBird(280,195,.75);drawBird(340,178,.6);

  ctx.fillStyle=m.sand;
  ctx.beginPath();ctx.ellipse(720,610,530,195,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff2b5aa';ctx.lineWidth=9;ctx.stroke();

  const green=ctx.createLinearGradient(0,460,0,690);green.addColorStop(0,m.leaf);green.addColorStop(1,'#5c944b');
  ctx.fillStyle=green;ctx.beginPath();ctx.ellipse(720,560,405,120,0,0,Math.PI*2);ctx.fill();

  drawPalm(380,590,.95);
  drawPalm(1070,580,.82);
  drawShip(250,575,.54);

  if(index===0){
    drawPalm(800,535,.66);drawPalm(910,550,.55);
    roundedRect(625,450,190,54,14,'#75502b','#f0c66e',4);
    ctx.fillStyle='#fff1bd';ctx.font='bold 19px Arial';ctx.textAlign='center';ctx.fillText('RINGAN TULANG',720,484);
  }
  if(index===1){
    drawGiftStall(840,555);
    ctx.fillStyle='#f4b849';ctx.font='bold 30px Arial';ctx.textAlign='center';ctx.fillText('🎁',840,455);
  }
  if(index===2){
    drawFootballGoal(845,560);
    ctx.fillStyle='#f7f7f7';ctx.strokeStyle='#222';ctx.lineWidth=3;ctx.beginPath();ctx.arc(710,590,34,0,Math.PI*2);ctx.fill();ctx.stroke();
    for(let a=0;a<6;a++){ctx.beginPath();ctx.moveTo(710,590);ctx.lineTo(710+Math.cos(a*Math.PI/3)*31,590+Math.sin(a*Math.PI/3)*31);ctx.stroke();}
  }
  if(index===3){
    drawHammock(835,570);
    ctx.fillStyle='#f45f55';ctx.beginPath();ctx.moveTo(675,590);ctx.lineTo(720,475);ctx.lineTo(765,590);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#67462d';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(720,475);ctx.lineTo(720,620);ctx.stroke();
  }
  if(index===4){
    drawRockCave(860,565);
    for(let i=0;i<7;i++){ctx.fillStyle=i%2?'#7a7d78':'#5e6866';ctx.beginPath();ctx.arc(510+i*55,610+(i%2)*20,27+(i%3)*4,0,Math.PI*2);ctx.fill();}
  }

  drawCaptain(595,615,'Kapten Mal',false,false);
  drawCaptain(760,615,'Kapten Arif',true,false);

  roundedRect(530,370,380,88,18,'#734a28e8','#f0c064',4);
  ctx.fillStyle='#fff0b8';ctx.font='bold 26px Georgia';ctx.textAlign='center';ctx.fillText(m.island,720,404);
  ctx.font='bold 18px Arial';ctx.fillText(m.place,720,435);

  roundedRect(515,690,410,57,15,'#073f4dd9','#62d5c8',2);
  ctx.fillStyle='#fff8d4';ctx.font='bold 21px Arial';ctx.fillText('Misi: “'+m.idiom+'”',720,726);
}

function drawTravel(progress) {
  drawSkySea('#86ddfb','#168da9');
  drawCloud(80,95,.56,.46);drawCloud(930,88,.5,.42);

  roundedRect(65,52,310,58,15,'#063e50dc','#ffd36a',2);
  ctx.fillStyle='#fff4c3';ctx.font='bold 25px Georgia';ctx.textAlign='center';ctx.fillText('Peta Perjalanan',220,88);

  const points = [
    {x:150,y:620,label:'Mula'},
    {x:350,y:500,label:'1'},
    {x:555,y:625,label:'2'},
    {x:770,y:470,label:'3'},
    {x:995,y:605,label:'4'},
    {x:1235,y:475,label:'5'}
  ];

  ctx.strokeStyle='#fff1bb99';ctx.lineWidth=6;ctx.setLineDash([11,15]);ctx.beginPath();
  points.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.stroke();ctx.setLineDash([]);

  points.forEach(function(p,i){
    ctx.fillStyle=i===0?'#e6b85b':['#62b25d','#4fae62','#5cb66a','#4ea95f','#599b55'][Math.max(0,i-1)];
    ctx.beginPath();ctx.ellipse(p.x,p.y,82,41,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#fff0a8';ctx.lineWidth=4;ctx.stroke();
    ctx.fillStyle='#073e4a';ctx.font='bold 17px Arial';ctx.textAlign='center';ctx.fillText(p.label,p.x,p.y+6);
    if(i>0){ctx.fillStyle='#2f8f4f';ctx.beginPath();ctx.arc(p.x-18,p.y-34,24,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(p.x+18,p.y-35,20,0,Math.PI*2);ctx.fill();}
  });

  const fromIdx = Math.max(0,state.travelFrom+1);
  const toIdx = state.travelTo+1;
  const a=points[fromIdx],b=points[toIdx];
  const ease=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2;
  const x=a.x+(b.x-a.x)*ease;
  const y=a.y+(b.y-a.y)*ease-42*Math.sin(Math.PI*ease);

  ctx.save();
  if(!state.calm){ctx.translate(0,Math.sin(progress*Math.PI*8)*3);}
  drawShip(x,y,.34);
  drawCaptain(x-19,y-47,'',false,false);
  drawCaptain(x+25,y-47,'',true,false);
  ctx.restore();

  roundedRect(470,710,500,44,18,'#073e50d9','#ffd36a',2);
  ctx.fillStyle='#0c91a7';ctx.fillRect(486,724,468,14);
  ctx.fillStyle='#ffd15c';ctx.fillRect(486,724,468*progress,14);
  ctx.strokeStyle='#fff4c4';ctx.strokeRect(486,724,468,14);
  ctx.fillStyle='#fff4c4';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText('Perjalanan 2 saat • '+Math.round(progress*100)+'%',720,700);
}

function drawFinalScene() {
  drawSkySea('#9be8ff','#179ab0');
  drawCloud(70,90,.58,.5);drawCloud(1040,80,.62,.48);
  ctx.fillStyle='#ffd978';ctx.beginPath();ctx.ellipse(720,620,535,200,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#fff0ae';ctx.lineWidth=8;ctx.stroke();
  ctx.fillStyle='#67aa59';ctx.beginPath();ctx.ellipse(720,570,400,116,0,0,Math.PI*2);ctx.fill();

  drawPalm(345,585,.95);drawPalm(1110,580,.88);
  drawTreasureChest(720,575,1.18,true);
  drawCaptain(505,655,'Kapten Mal',false,true);
  drawCaptain(935,655,'Kapten Arif',true,true);

  roundedRect(420,48,600,70,20,'#073e50e8','#ffd25d',3);
  ctx.fillStyle='#fff1a7';ctx.font='bold 34px Georgia';ctx.textAlign='center';ctx.fillText('HARTA KARUN DITEMUI!',720,93);

  roundedRect(520,140,400,48,15,'#237c55e8','#b9f0bd',2);
  ctx.fillStyle='#ffffff';ctx.font='bold 20px Arial';ctx.fillText('Tahniah! Semua 5 misi berjaya.',720,171);

  if (!state.calm) {
    const colors=['#ffcc3d','#ff7567','#4bd6b1','#74a9ff','#fff1a8','#ef71b7'];
    for(let i=0;i<80;i++){
      const x=(i*97)%1400+20,y=(i*53+state.t*82)%390+120;
      ctx.fillStyle=colors[i%colors.length];
      ctx.save();ctx.translate(x,y);ctx.rotate((i%7)*.35+state.t*.4);ctx.fillRect(-4,-7,8,14);ctx.restore();
    }
  }
}

function render(now) {
  state.t = now / 1000;
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (state.screen === 'title' || state.screen === 'intro') {
    drawIntroScene();
  } else if (state.screen === 'travel') {
    const elapsed = now - state.travelStart;
    const progress = Math.min(1, elapsed / 2000);
    drawTravel(progress);
    if (progress >= 1) finishTravel();
  } else if (state.screen === 'final') {
    drawFinalScene();
  } else {
    drawIslandScene(state.island);
  }

  requestAnimationFrame(render);
}

$('helpBtn').onclick = helpScreen;
$('exitBtn').onclick = exitToMenu;
$('calmBtn').onclick = function () {
  state.calm = !state.calm;
  $('calmBtn').setAttribute('aria-pressed',String(state.calm));
  $('calmBtn').textContent = state.calm ? '☀ Gerakan biasa' : '🌙 Gerakan tenang';
  toast(state.calm ? 'Gerakan hiasan dikurangkan.' : 'Gerakan hiasan diaktifkan.');
};

titleScreen();
requestAnimationFrame(render);
