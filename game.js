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
  $('travelLabel').textContent = '⛵ Perjalanan ke Pulau ' + (to + 1) + ' • 2 saat';
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

function drawPalm(x,y,scale) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);
  ctx.strokeStyle = '#7a4a27';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(-10,-85,16,-170);
  ctx.stroke();
  for (let i=0;i<8;i++) {
    const a = (i/8)*Math.PI*2;
    ctx.fillStyle = i%2 ? '#2c8c4e' : '#39a85a';
    ctx.beginPath();
    ctx.moveTo(15,-170);
    ctx.quadraticCurveTo(15+Math.cos(a)*55,-185+Math.sin(a)*16,15+Math.cos(a)*100,-170+Math.sin(a)*42);
    ctx.quadraticCurveTo(30+Math.cos(a)*55,-162+Math.sin(a)*12,15,-170);
    ctx.fill();
  }
  ctx.fillStyle = '#6b4426';
  ctx.beginPath();ctx.arc(2,-161,10,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(20,-156,9,0,Math.PI*2);ctx.fill();
  ctx.restore();
}

function drawCaptain(x,y,name,isArif,cheer) {
  ctx.save();
  ctx.translate(x,y);
  const bob = state.calm ? 0 : Math.sin(state.t*3 + x)*3;
  ctx.translate(0,bob);

  ctx.fillStyle = '#063a4466';
  ctx.beginPath();ctx.ellipse(0,12,33,10,0,0,Math.PI*2);ctx.fill();

  ctx.strokeStyle = '#27333a';
  ctx.lineWidth = 8;
  ctx.beginPath();ctx.moveTo(-9,-8);ctx.lineTo(-15,28);ctx.moveTo(9,-8);ctx.lineTo(15,28);ctx.stroke();

  ctx.fillStyle = isArif ? '#4b2f2b' : '#8b3f35';
  ctx.fillRect(-23,-60,46,55);
  ctx.fillStyle = '#fff1c5';
  ctx.fillRect(-23,-53,46,10);

  ctx.strokeStyle = '#27333a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  if (cheer) {
    ctx.moveTo(-18,-45);ctx.lineTo(-38,-80);
    ctx.moveTo(18,-45);ctx.lineTo(38,-80);
  } else {
    ctx.moveTo(-18,-45);ctx.lineTo(-33,-19);
    ctx.moveTo(18,-45);ctx.lineTo(33,-19);
  }
  ctx.stroke();

  ctx.fillStyle = '#d6a477';
  ctx.beginPath();ctx.arc(0,-82,24,0,Math.PI*2);ctx.fill();

  ctx.fillStyle = '#2c2628';
  ctx.beginPath();
  ctx.moveTo(-31,-100);ctx.lineTo(31,-100);ctx.lineTo(38,-92);ctx.lineTo(-38,-92);ctx.closePath();ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-22,-101);ctx.lineTo(-12,-124);ctx.lineTo(16,-124);ctx.lineTo(25,-101);ctx.closePath();ctx.fill();

  ctx.fillStyle = '#332826';
  ctx.beginPath();ctx.arc(-8,-82,2.8,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(9,-82,2.8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#55352c';ctx.lineWidth=2;ctx.beginPath();ctx.arc(1,-72,9,.1,Math.PI-.1);ctx.stroke();

  ctx.fillStyle = '#073d4acc';
  ctx.strokeStyle = '#ffd36a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-62,-150,124,30,12);
  ctx.fill();ctx.stroke();
  ctx.fillStyle='#fff7d1';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText(name,0,-129);
  ctx.restore();
}

function drawShip(x,y,scale) {
  ctx.save();
  ctx.translate(x,y);
  ctx.scale(scale,scale);
  ctx.fillStyle='#052e3866';ctx.beginPath();ctx.ellipse(0,58,170,22,0,0,Math.PI*2);ctx.fill();
  const hg=ctx.createLinearGradient(0,0,0,90);hg.addColorStop(0,'#a66c36');hg.addColorStop(1,'#4e2e21');
  ctx.fillStyle=hg;ctx.strokeStyle='#efc36e';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(-165,5);ctx.lineTo(-130,72);ctx.lineTo(120,72);ctx.lineTo(165,5);ctx.lineTo(95,25);ctx.lineTo(-100,25);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.strokeStyle='#55341f';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(0,15);ctx.lineTo(0,-190);ctx.stroke();
  ctx.fillStyle='#fff0c8';ctx.strokeStyle='#8c7045';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(5,-180);ctx.lineTo(125,-142);ctx.lineTo(125,-45);ctx.lineTo(5,-65);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#3b2d2b';ctx.beginPath();ctx.moveTo(0,-190);ctx.lineTo(82,-171);ctx.lineTo(0,-142);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff5d4';ctx.font='bold 27px Arial';ctx.fillText('☠',24,-160);
  ctx.restore();
}

function drawIntroScene() {
  drawSkySea('#92e6ff','#159bb6');

  const sand = ctx.createLinearGradient(0,430,650,790);
  sand.addColorStop(0,'#ffe28d'); sand.addColorStop(1,'#e9b453');
  ctx.fillStyle=sand;
  ctx.beginPath();
  ctx.moveTo(0,360);ctx.quadraticCurveTo(460,410,670,810);ctx.lineTo(0,810);ctx.closePath();ctx.fill();

  drawPalm(160,470,1.15);
  drawShip(1030,460,.9);
  drawCaptain(330,640,'Kapten Mal',false,false);
  drawCaptain(1020,392,'Kapten Arif',true,false);

  ctx.fillStyle='#fff8d9';ctx.font='bold 26px Georgia';ctx.textAlign='center';
  ctx.fillText('Pertemuan di Tepi Pantai',720,70);
}

function drawIslandScene(index) {
  const m = missions[Math.max(0,Math.min(index,4))];
  drawSkySea(m.sky,m.sea);

  ctx.fillStyle=m.sand;
  ctx.beginPath();
  ctx.ellipse(720,600,520,190,0,0,Math.PI*2);
  ctx.fill();
  ctx.strokeStyle='#fff3b3aa';ctx.lineWidth=8;ctx.stroke();

  ctx.fillStyle='#7db45c';
  ctx.beginPath();
  ctx.ellipse(720,555,390,115,0,0,Math.PI*2);
  ctx.fill();

  drawPalm(430,575,1.0);
  drawPalm(1020,565,.9);
  if (index===2) {
    ctx.fillStyle='#f5f5f5';ctx.beginPath();ctx.arc(730,570,36,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='#222';ctx.lineWidth=3;
    for(let a=0;a<6;a++){ctx.beginPath();ctx.moveTo(730,570);ctx.lineTo(730+Math.cos(a*Math.PI/3)*35,570+Math.sin(a*Math.PI/3)*35);ctx.stroke();}
  }
  if (index===4) {
    ctx.fillStyle='#777';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(560+i*70,580+(i%2)*22,28,0,Math.PI*2);ctx.fill();}
  }

  drawShip(280,555,.58);
  drawCaptain(610,585,'Kapten Mal',false,false);
  drawCaptain(790,585,'Kapten Arif',true,false);

  ctx.fillStyle='#6b4227';ctx.fillRect(620,400,200,70);
  ctx.strokeStyle='#f0c065';ctx.lineWidth=5;ctx.strokeRect(620,400,200,70);
  ctx.fillStyle='#fff2bd';ctx.font='bold 21px Georgia';ctx.textAlign='center';
  ctx.fillText(m.island,720,430);ctx.font='bold 16px Arial';ctx.fillText(m.place,720,457);
}

function drawTravel(progress) {
  drawSkySea('#86ddfb','#168da9');

  const points = [
    {x:150,y:620},{x:360,y:510},{x:570,y:620},{x:790,y:480},{x:1010,y:590},{x:1240,y:470}
  ];
  ctx.strokeStyle='#fff4c888';ctx.lineWidth=5;ctx.setLineDash([10,14]);ctx.beginPath();
  points.forEach(function(p,i){if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.stroke();ctx.setLineDash([]);

  points.forEach(function(p,i){
    ctx.fillStyle=i===0?'#e8c466':'#78b75f';ctx.beginPath();ctx.ellipse(p.x,p.y,75,38,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#063e4a';ctx.font='bold 16px Arial';ctx.textAlign='center';ctx.fillText(i===0?'Pantai':'P'+i,p.x,p.y+6);
  });

  const fromIdx = Math.max(0,state.travelFrom+1);
  const toIdx = state.travelTo+1;
  const a=points[fromIdx],b=points[toIdx];
  const ease=progress<.5?2*progress*progress:1-Math.pow(-2*progress+2,2)/2;
  const x=a.x+(b.x-a.x)*ease;
  const y=a.y+(b.y-a.y)*ease-35*Math.sin(Math.PI*ease);
  drawShip(x,y,.35);
  drawCaptain(x-18,y-47,'',false,false);
  drawCaptain(x+24,y-47,'',true,false);
}

function drawFinalScene() {
  drawSkySea('#9be8ff','#179ab0');
  ctx.fillStyle='#ffd978';ctx.beginPath();ctx.ellipse(720,610,520,190,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#64aa5b';ctx.beginPath();ctx.ellipse(720,570,390,110,0,0,Math.PI*2);ctx.fill();
  drawPalm(360,560,.95);drawPalm(1080,555,.9);

  ctx.fillStyle='#6c3d22';ctx.strokeStyle='#ffd060';ctx.lineWidth=7;ctx.fillRect(600,530,240,125);ctx.strokeRect(600,530,240,125);
  ctx.fillStyle='#d8982f';ctx.fillRect(600,500,240,55);ctx.strokeRect(600,500,240,55);
  ctx.fillStyle='#fff0a2';ctx.font='bold 42px Arial';ctx.textAlign='center';ctx.fillText('✦ ✦ ✦',720,585);

  drawCaptain(520,635,'Kapten Mal',false,true);
  drawCaptain(920,635,'Kapten Arif',true,true);

  ctx.fillStyle='#fff2a6';ctx.font='bold 36px Georgia';ctx.fillText('HARTA KARUN DITEMUI!',720,105);

  if (!state.calm) {
    const colors=['#ffcc3d','#ff7567','#4bd6b1','#74a9ff','#fff1a8'];
    for(let i=0;i<60;i++){
      const x=(i*97)%1400+20,y=(i*53+state.t*80)%370+120;
      ctx.fillStyle=colors[i%colors.length];ctx.fillRect(x,y,6,12);
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
