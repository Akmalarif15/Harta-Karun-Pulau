/* Lima pulau dengan siluet dan susun atur yang benar-benar berbeza.
   Hanya grafik pulau ditukar; kandungan, misi dan logik permainan kekal. */
(function () {
  if (typeof ctx === 'undefined' || typeof drawIslandScene !== 'function') return;

  function pathFillStroke(fill, stroke, lineWidth) {
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth || 4;
      ctx.stroke();
    }
  }

  function shadowEllipse(x, y, rx, ry, alpha) {
    ctx.save();
    ctx.fillStyle = 'rgba(42,85,89,' + (alpha || 0.20) + ')';
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function shoreline(pathFn) {
    ctx.save();
    pathFn(18);
    ctx.fillStyle = '#32b7df';
    ctx.fill();
    ctx.strokeStyle = '#197fa6';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    pathFn(7);
    ctx.strokeStyle = '#eefdff';
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();

    ctx.save();
    pathFn(0);
    pathFillStroke('#f6d36d', '#d9b35a', 4);
    ctx.restore();
  }

  function rock(x, y, w, h, tone) {
    const c = tone || '#bd6d4e';
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = c;
    ctx.strokeStyle = '#7f4b3e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-w * 0.46, h * 0.40);
    ctx.lineTo(-w * 0.36, -h * 0.18);
    ctx.lineTo(-w * 0.08, -h * 0.52);
    ctx.lineTo(w * 0.28, -h * 0.34);
    ctx.lineTo(w * 0.47, h * 0.12);
    ctx.lineTo(w * 0.30, h * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255,197,145,.35)';
    ctx.beginPath();
    ctx.moveTo(-w * 0.26, h * 0.20);
    ctx.lineTo(-w * 0.15, -h * 0.22);
    ctx.lineTo(w * 0.02, -h * 0.40);
    ctx.lineTo(w * 0.08, h * 0.05);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function bush(x, y, s) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    const blobs = [[0,0,26],[28,4,23],[-27,6,22],[8,-18,24],[-12,-15,20]];
    blobs.forEach(function (b, i) {
      ctx.fillStyle = i % 2 ? '#2f9f4c' : '#42b95b';
      ctx.beginPath();
      ctx.arc(b[0], b[1], b[2], 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  function shell(x, y, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color || '#ad6fc6';
    ctx.strokeStyle = '#704f7d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 12, Math.PI, 0);
    ctx.lineTo(12, 8);
    ctx.lineTo(-12, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function missionPanel(m) {
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,.95)';
    ctx.strokeStyle = '#344b59';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(520, 350, 400, 78, 18);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#2e4651';
    ctx.textAlign = 'center';
    ctx.font = 'bold 25px Arial';
    ctx.fillText(m.island, 720, 381);
    ctx.font = 'bold 17px Arial';
    ctx.fillText(m.place, 720, 410);
    ctx.restore();
  }

  function islandOne() {
    function p(o) {
      ctx.beginPath();
      ctx.moveTo(185 - o, 650 + o * .15);
      ctx.bezierCurveTo(230 - o, 520 - o, 430, 470 - o, 680, 485 - o * .35);
      ctx.bezierCurveTo(925, 460 - o * .15, 1160 + o, 510 - o, 1260 + o, 640 + o * .18);
      ctx.bezierCurveTo(1180 + o, 700 + o, 940 + o, 730 + o, 700, 720 + o);
      ctx.bezierCurveTo(450 - o, 742 + o, 260 - o, 720 + o, 185 - o, 650 + o * .15);
      ctx.closePath();
    }
    shoreline(p);
    shadowEllipse(710, 712, 485, 25, .12);
    rock(300, 505, 170, 270, '#c56f52');
    rock(410, 540, 115, 185, '#b86149');
    rock(225, 565, 95, 150, '#d17c5b');
    bush(315, 585, .95); bush(405, 600, .8);
    drawPalm(980, 585, .86); drawPalm(1100, 600, .66); drawPalm(890, 610, .58);
    shell(520, 670, '#b56dcc'); shell(1135, 655, '#e38c99');
  }

  function islandTwo() {
    function p(o) {
      ctx.beginPath();
      ctx.moveTo(135 - o, 640);
      ctx.bezierCurveTo(270 - o, 555 - o, 485, 555 - o * .4, 650, 585 - o * .2);
      ctx.bezierCurveTo(850, 555 - o * .3, 1110 + o, 565 - o * .5, 1305 + o, 650);
      ctx.bezierCurveTo(1240 + o, 710 + o, 990, 735 + o, 760, 716 + o);
      ctx.bezierCurveTo(510, 748 + o, 245 - o, 720 + o, 135 - o, 640);
      ctx.closePath();
    }
    shoreline(p);
    ctx.fillStyle = '#b9674e'; ctx.strokeStyle = '#7f4b3e'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.roundRect(185, 480, 285, 135, 22); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ca7957'; ctx.beginPath(); ctx.roundRect(230, 395, 245, 110, 20); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d88960'; ctx.beginPath(); ctx.roundRect(285, 330, 175, 88, 18); ctx.fill(); ctx.stroke();
    bush(210, 475, .68); bush(460, 485, .7); bush(335, 380, .58);
    drawPalm(920, 600, .88); drawPalm(1080, 610, .72); drawPalm(1210, 620, .54);
    ctx.fillStyle = '#e5a652'; ctx.strokeStyle = '#5b4c43'; ctx.lineWidth = 4;
    ctx.fillRect(760, 555, 125, 72); ctx.strokeRect(760, 555, 125, 72);
    ctx.fillStyle = '#f6dc6a'; ctx.fillRect(748, 535, 150, 24);
    ctx.fillStyle = '#ed6e63'; ctx.fillRect(785, 585, 27, 25);
    ctx.fillStyle = '#5fa9d0'; ctx.fillRect(835, 585, 27, 25);
    shell(610, 678, '#925fc4');
  }

  function islandThree() {
    function p(o) {
      ctx.beginPath();
      ctx.moveTo(170 - o, 630);
      ctx.bezierCurveTo(255 - o, 500 - o, 470, 465 - o, 650, 510);
      ctx.bezierCurveTo(760, 535, 840, 535, 950, 500 - o * .4);
      ctx.bezierCurveTo(1130 + o, 470 - o, 1270 + o, 555, 1280 + o, 650);
      ctx.bezierCurveTo(1190 + o, 690 + o, 1095, 682 + o, 1010, 640);
      ctx.bezierCurveTo(910, 590 - o * .1, 820, 585, 735, 650 + o * .15);
      ctx.bezierCurveTo(620, 735 + o, 470, 755 + o, 330 - o, 710 + o * .7);
      ctx.bezierCurveTo(250 - o, 690 + o * .4, 195 - o, 665, 170 - o, 630);
      ctx.closePath();
    }
    shoreline(p);
    ctx.fillStyle = '#4dc5e4'; ctx.strokeStyle = '#eefdff'; ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.ellipse(730, 622, 185, 75, -.05, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    rock(310, 505, 135, 210, '#c47356');
    rock(425, 540, 95, 150, '#b96750');
    bush(345, 570, .75); bush(445, 590, .72);
    drawPalm(1000, 590, .86); drawPalm(1130, 605, .62);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7;
    ctx.strokeRect(865, 530, 140, 92);
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(805, 652, 25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#333'; ctx.beginPath(); ctx.moveTo(785,652); ctx.lineTo(825,652); ctx.moveTo(805,632); ctx.lineTo(805,672); ctx.stroke();
  }

  function islandFour() {
    function p(o) {
      ctx.beginPath();
      ctx.moveTo(120 - o, 650);
      ctx.bezierCurveTo(240 - o, 585 - o * .5, 390, 600 - o * .4, 520, 625);
      ctx.bezierCurveTo(655, 650 + o * .15, 720, 540 - o, 850, 535 - o * .2);
      ctx.bezierCurveTo(1010, 525 - o * .2, 1155 + o, 580 - o * .4, 1320 + o, 635);
      ctx.bezierCurveTo(1210 + o, 690 + o, 1060, 700 + o, 910, 675 + o * .6);
      ctx.bezierCurveTo(770, 650, 690, 742 + o, 515, 730 + o);
      ctx.bezierCurveTo(350, 720 + o, 230 - o, 700 + o * .6, 120 - o, 650);
      ctx.closePath();
    }
    shoreline(p);
    rock(250, 520, 80, 230, '#ca7554');
    rock(335, 555, 70, 170, '#b9654d');
    drawPalm(760, 585, .90); drawPalm(930, 600, .76); drawPalm(1110, 612, .56);
    ctx.strokeStyle = '#765431'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(760,610); ctx.lineTo(790,505); ctx.moveTo(955,612); ctx.lineTo(930,510); ctx.stroke();
    ctx.strokeStyle = '#4f9b7c'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(790,548); ctx.quadraticCurveTo(860,605,930,548); ctx.stroke();
    shell(520, 675, '#e68ca2'); shell(1210, 665, '#a66dcc');
  }

  function islandFive() {
    function p(o) {
      ctx.beginPath();
      ctx.moveTo(210 - o, 675);
      ctx.bezierCurveTo(270 - o, 545 - o, 460, 465 - o * .5, 665, 505 - o * .2);
      ctx.bezierCurveTo(840, 455 - o, 1090 + o, 505 - o * .5, 1230 + o, 625);
      ctx.bezierCurveTo(1160 + o, 710 + o, 900, 742 + o, 660, 720 + o);
      ctx.bezierCurveTo(470, 755 + o, 290 - o, 735 + o, 210 - o, 675);
      ctx.closePath();
    }
    shoreline(p);
    ctx.fillStyle = '#6f7774'; ctx.strokeStyle = '#414d50'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(830, 640);
    ctx.lineTo(805, 520);
    ctx.bezierCurveTo(790, 450, 855, 420, 905, 470);
    ctx.bezierCurveTo(955, 420, 1020, 450, 1005, 520);
    ctx.lineTo(980, 640);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#263a41';
    ctx.beginPath();
    ctx.moveTo(905, 595);
    ctx.bezierCurveTo(845, 545, 835, 500, 872, 488);
    ctx.bezierCurveTo(892, 481, 905, 495, 905, 512);
    ctx.bezierCurveTo(905, 495, 922, 481, 942, 488);
    ctx.bezierCurveTo(980, 500, 965, 545, 905, 595);
    ctx.closePath(); ctx.fill();
    rock(360, 585, 85, 110, '#7f8580');
    rock(1145, 610, 65, 85, '#777d79');
    drawPalm(500, 610, .65); drawPalm(1185, 615, .52);
    shell(610, 680, '#a363c0');
  }

  const originalDrawIslandScene = drawIslandScene;

  drawIslandScene = function (index) {
    const safeIndex = Math.max(0, Math.min(index, 4));
    const m = missions[safeIndex];

    drawSkySea('#91bbd1', '#579493');

    switch (safeIndex) {
      case 0: islandOne(); break;
      case 1: islandTwo(); break;
      case 2: islandThree(); break;
      case 3: islandFour(); break;
      case 4: islandFive(); break;
      default: return originalDrawIslandScene(index);
    }

    drawShip(205, 625, .44);
    drawCaptain(610, 650, 'Kapten Akmal', false, false);
    drawCaptain(770, 650, 'Kapten Arif', true, false);
    missionPanel(m);
  };
})();
