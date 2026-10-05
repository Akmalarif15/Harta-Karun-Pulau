/* Animasi badan penuh Kapten Akmal & Kapten Arif.
   Satu kitaran gerakan mengambil masa 10 saat. Tiada teks masa dipaparkan. */

(function () {
  if (typeof drawCaptain !== 'function' || typeof ctx === 'undefined' || typeof state === 'undefined') return;

  const drawCaptainAsal = drawCaptain;
  const TEMPOH = 10;
  const SUDUT_MAKS = 1.8 * Math.PI / 180;

  drawCaptain = function (x, y, name, isArif, cheer) {
    const gerakanDimatikan = Boolean(state.calm);
    const fasa = isArif ? Math.PI : 0;
    const gelombang = Math.sin((state.t * Math.PI * 2 / TEMPOH) + fasa);
    const sudut = gerakanDimatikan ? 0 : gelombang * SUDUT_MAKS;
    const terapung = gerakanDimatikan ? 0 : Math.sin((state.t * Math.PI * 2 / TEMPOH) + fasa + Math.PI / 2) * 1.5;

    ctx.save();

    // Gerakkan seluruh badan pada titik kaki supaya watak bergoyang sebagai satu unit.
    ctx.translate(x, y);
    ctx.rotate(sudut);
    ctx.translate(-x, -y + terapung);

    // Matikan gerakan lama ketika melukis supaya kitaran utama kekal 10 saat.
    const calmAsal = state.calm;
    state.calm = true;
    drawCaptainAsal(x, y, name, isArif, cheer);
    state.calm = calmAsal;

    ctx.restore();
  };
})();
