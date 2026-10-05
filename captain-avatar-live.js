/* Avatar PNG baharu Kapten Akmal & Kapten Arif + animasi badan penuh.
   Kandungan pembelajaran dan aliran permainan tidak diubah. */

(function () {
  if (typeof drawCaptain !== 'function' || typeof ctx === 'undefined' || typeof state === 'undefined') return;

  const drawCaptainAsal = drawCaptain;

  const avatarAkmalBaharu = new Image();
  avatarAkmalBaharu.src = 'assets/characters/kapten_akmal.png?v=3';

  const avatarArifBaharu = new Image();
  avatarArifBaharu.src = 'assets/characters/kapten_arif.png?v=3';

  const TEMPOH_GERAKAN = 10;
  const SUDUT_MAKS = 1.6 * Math.PI / 180;

  function lukisLabelNama(name, yAtas) {
    if (!name) return;

    const boxWidth = 142;
    const boxHeight = 31;
    const boxY = yAtas - 39;

    ctx.fillStyle = 'rgba(255, 253, 246, 0.96)';
    ctx.strokeStyle = '#344e5f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-boxWidth / 2, boxY, boxWidth, boxHeight, 13);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2e4652';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(name, 0, boxY + boxHeight / 2);
  }

  drawCaptain = function (x, y, name, isArif, cheer) {
    const img = isArif ? avatarArifBaharu : avatarAkmalBaharu;

    // Jika imej belum selesai dimuat, gunakan watak lama buat sementara.
    if (!img.complete || !img.naturalWidth) {
      drawCaptainAsal(x, y, name, isArif, cheer);
      return;
    }

    const width = isArif ? 154 : 160;
    const height = width * (img.naturalHeight / img.naturalWidth);

    const gerakanTenang = Boolean(state.calm);
    const fasa = isArif ? Math.PI : 0;
    const masa = state.t * Math.PI * 2 / TEMPOH_GERAKAN;
    const sudut = gerakanTenang ? 0 : Math.sin(masa + fasa) * SUDUT_MAKS;
    const terapung = gerakanTenang ? 0 : Math.cos(masa + fasa) * 2.2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(sudut);
    ctx.translate(0, terapung);

    // Bayang lembut di bawah kaki.
    ctx.fillStyle = 'rgba(35, 70, 75, 0.24)';
    ctx.beginPath();
    ctx.ellipse(0, 18, 46, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Avatar PNG penuh.
    const atas = -height + 24;
    ctx.drawImage(img, -width / 2, atas, width, height);

    lukisLabelNama(name, atas);
    ctx.restore();
  };
})();
