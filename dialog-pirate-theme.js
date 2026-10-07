/* Tema dialog lanun untuk semua dialog dinamik pada canvas.
   Teks dan logik permainan tidak diubah. */
(function(){
  if(typeof ctx==='undefined') return;

  const asalCaptain = (typeof drawCaptain==='function') ? drawCaptain : null;
  const asalBubble = (typeof drawSpeechBubble==='function') ? drawSpeechBubble : null;

  function roundPath(x,y,w,h,r){
    const q=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+q,y);
    ctx.arcTo(x+w,y,x+w,y+h,q);
    ctx.arcTo(x+w,y+h,x,y+h,q);
    ctx.arcTo(x,y+h,x,y,q);
    ctx.arcTo(x,y,x+w,y,q);
    ctx.closePath();
  }

  function drawHelm(cx,cy,r){
    ctx.save();
    ctx.translate(cx,cy);
    ctx.strokeStyle='#8a5a16';
    ctx.fillStyle='#f7bd37';
    ctx.lineWidth=3;
    ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle='#fff2a4';ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,r*.48,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*r*.35,Math.sin(a)*r*.35);
      ctx.lineTo(Math.cos(a)*r*.82,Math.sin(a)*r*.82);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawNamePlate(x,y,name,isArif){
    if(!name) return;
    const w=Math.max(150,ctx.measureText(name).width+70);
    const h=36;
    const px=x-w/2;
    const py=y-(isArif?218:212);

    ctx.save();
    ctx.font='900 16px Arial';

    roundPath(px,py,w,h,16);
    ctx.fillStyle='#fffaf0';
    ctx.fill();
    ctx.lineWidth=4;
    ctx.strokeStyle='#0c6573';
    ctx.stroke();

    roundPath(px+3,py+3,w-6,h-6,13);
    ctx.lineWidth=2;
    ctx.strokeStyle='#f4b83c';
    ctx.stroke();

    drawHelm(px+19,py+h/2,15);

    ctx.fillStyle='#17384c';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.fillText(name,px+w/2+12,py+h/2+1);
    ctx.restore();
  }

  if(asalCaptain){
    drawCaptain=function(x,y,name,isArif,cheer){
      asalCaptain(x,y,'',isArif,cheer);
      drawNamePlate(x,y,name,isArif);
    };
  }

  drawSpeechBubble=function(x,y,w,h,text,side){
    ctx.save();

    // bayang
    roundPath(x+5,y+7,w,h,21);
    ctx.fillStyle='rgba(92,55,18,.22)';
    ctx.fill();

    // kertas utama
    roundPath(x,y,w,h,21);
    ctx.fillStyle='#fff9e8';
    ctx.fill();
    ctx.lineWidth=5;
    ctx.strokeStyle='#9b641f';
    ctx.stroke();

    // border emas dalam
    roundPath(x+5,y+5,w-10,h-10,17);
    ctx.lineWidth=3;
    ctx.strokeStyle='#f1b73b';
    ctx.stroke();

    // ekor bubble
    ctx.beginPath();
    if(side==='left'){
      ctx.moveTo(x+52,y+h-3);
      ctx.lineTo(x+25,y+h+27);
      ctx.lineTo(x+78,y+h-4);
    }else{
      ctx.moveTo(x+w-78,y+h-4);
      ctx.lineTo(x+w-25,y+h+27);
      ctx.lineTo(x+w-52,y+h-3);
    }
    ctx.closePath();
    ctx.fillStyle='#fff9e8';
    ctx.fill();
    ctx.lineWidth=4;
    ctx.strokeStyle='#9b641f';
    ctx.stroke();

    // simbol roda kapal
    drawHelm(x+17,y+17,13);

    // watermark sauh kecil
    ctx.globalAlpha=.10;
    ctx.fillStyle='#8b5b23';
    ctx.font='bold 52px Arial';
    ctx.textAlign='right';
    ctx.fillText('⚓',x+w-14,y+h-14);
    ctx.globalAlpha=1;

    // teks dinamik
    ctx.fillStyle='#17384c';
    ctx.font='900 18px Arial';
    ctx.textAlign='left';
    ctx.textBaseline='alphabetic';
    const words=String(text).split(' ');
    let line='';
    let yy=y+38;
    const maxW=w-38;
    words.forEach(function(word,i){
      const test=line+word+' ';
      if(ctx.measureText(test).width>maxW && line){
        ctx.fillText(line.trim(),x+19,yy);
        line=word+' ';
        yy+=26;
      }else{
        line=test;
      }
      if(i===words.length-1)ctx.fillText(line.trim(),x+19,yy);
    });

    ctx.restore();
  };

  // Fallback kalau fungsi bubble asal diperlukan oleh kod lain pada masa depan.
  if(!asalBubble && typeof drawSpeechBubble!=='function'){
    drawSpeechBubble=function(){};
  }
})();
